import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { FirebaseStorage } from 'firebase/storage';
import { getStorage, ref as refStorage } from 'firebase/storage';
import  * as firebaseAuth  from 'firebase/auth';
import { getDatabase, ref as refDB, set, get,  goOnline, goOffline } from 'firebase/database';
import { SignJWT, decodeJwt, importPKCS8 } from 'jose';
import config, { getFirebaseTokenConfig } from '../config';
import { dumpRecipe, dumpUserSessionData } from '~/utils/dumpUtils';
import logger from '~/logger';
import type { compareResult, dbResult } from '~/utils/sync';
import { compareRecipes } from '~/utils/sync';
import type { Recipe } from '~/types';

const {
    inMemoryPersistence,
    initializeAuth,
    signInWithCustomToken
} = firebaseAuth;

async function getDownloadURL(reference) {
    const service = reference.storage;
    const location = reference._location;
    const url = new URL(`${service._protocol }://${service.host}/v0${location.fullServerUrl()}`);

    const res = await fetch(url.href);
    const json = await res.json();

    return `${url.href}?alt=media&token=${json.downloadTokens}`;
}

export default class FireBaseServer {
    _app: FirebaseApp;

    _storage: FirebaseStorage;

    _bucketName: string;

    _instance: any;

    auth: firebaseAuth.Auth;

    private _appID: string;

    private _tokenConfig: {
        privateKey: 'string',
        sub: 'string',
        issuer: 'string',
        audience: 'string',
    };

    constructor({ env }) {
        this._appID = (new Date()).toISOString();
        this._app = initializeApp(config.firebase, this._appID);
        this._storage = getStorage(this._app);
        this._bucketName = this._app.options.storageBucket || '';

        this._tokenConfig = getFirebaseTokenConfig(env);

        this.auth = initializeAuth(this._app, {
            persistence : inMemoryPersistence
        });
    }

    async getImageUrl(userId, imageName) {
        const file = `gs://${this._bucketName}/${userId}/${imageName}`;
        const starsRef = refStorage(this._storage, file);

        return getDownloadURL(starsRef);
    }

    async downloadRecipe(userId, recipeId) {
        const db = getDatabase(this._app);

        goOnline(db);
        const ref = refDB(db, `recipes/${userId}/${recipeId}`);
        const snapshot = await get(ref);

        goOffline(db);

        if (!snapshot.exists()) return null;

        return dumpRecipe(snapshot.val());
    }

    async downloadRecipes(userId) {
        const db = getDatabase(this._app);

        goOnline(db);
        const ref = refDB(db, `recipes/${userId}`);
        const snapshot = await get(ref);

        goOffline(db);

        if (!snapshot.exists()) return [];

        return Object.values(snapshot.val()).map(r => dumpRecipe(r));
    }

    async getToken(idToken):Promise<string> {
        const decoded = decodeJwt(idToken); // TODO: verify
        const k = this._tokenConfig.privateKey;
        const key = await importPKCS8(this._tokenConfig.privateKey, 'RS256');

        return new SignJWT({
            uid      : decoded.user_id,
            authTime : decoded.auth_time,
            sub      : this._tokenConfig.sub
        })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuedAt()
            .setIssuer(this._tokenConfig.issuer)
            .setAudience(this._tokenConfig.audience)
            .setExpirationTime('1h')
            .sign(key);
    }

    async signIn(token) {
        if (!token) {
            await this.auth.signOut();

            return null;
        }

        const userCredential = await signInWithCustomToken(this.auth, token);
        const user = userCredential.user;

        return dumpUserSessionData(user);
    }

    async syncUserRecipes(userId:string, recipes:Recipe[]):Promise<compareResult[]>  {
        const syncId = `${userId }_${Date.now()}`;

        try {
            logger.info(`RECIPES_SYNC_STARTED ${syncId}`);

            const db = getDatabase(this._app);

            goOnline(db);
            const ref = refDB(db, `recipes/${userId}`);
            const snapshot = await get(ref);
            const inDBMapping = (snapshot.val() as dbResult | null) || {};

            const results = [] as compareResult[];
            const checked = new Set();

            for (const localRecipe of recipes) {
                const remoteRecipe = inDBMapping[localRecipe.id];

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (remoteRecipe) {
                    results.push(compareRecipes(remoteRecipe, localRecipe));
                } else if (!localRecipe.deletedAt) {
                    results.push({ type: 'ADD_REMOTE', recipe: localRecipe });
                }

                checked.add(localRecipe.id);
            }

            for (const remoteRecipe of Object.values(inDBMapping)) {
                if (!checked.has(remoteRecipe.id)) results.push({ type: 'ADD_LOCAL', recipe: remoteRecipe });
            }

            const promises = results.map(r => {
                if ([ 'ADD_REMOTE', 'UPDATE_REMOTE' ].includes(r.type)) {
                    const recipeRef = refDB(db, `recipes/${userId}/${r.recipe.id}`);

                    return set(recipeRef, r.recipe);
                }

                return null;
            });

            await Promise.all(promises);
            goOffline(db);
            logger.info(`RECIPES_SYNC_FINISHED ${ syncId}`);

            return results;
        } catch (error) {
            logger.error(`RECIPES_SYNC_FAILED ${syncId}`);
            if (error instanceof Error) {
                logger.error({ error: error.toString(), stack: error.stack });
            }

            return [];
        }
    }
}
