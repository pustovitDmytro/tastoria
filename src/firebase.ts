import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { FirebaseStorage } from 'firebase/storage';
import { getStorage, ref as refStorage, uploadBytes } from 'firebase/storage';
import type { User } from 'firebase/auth';
import  * as firebaseAuth  from 'firebase/auth';
import { getDatabase, ref as refDB, set, get } from 'firebase/database';
import config from './config';
import type { Receipt } from '~/types';

const { GoogleAuthProvider, getAuth, signInWithPopup } = firebaseAuth;

async function getDownloadURL(reference) {
    const service = reference.storage;
    const location = reference._location;
    const url = new URL(`${service._protocol }://${service.host}/v0${location.fullServerUrl()}`);

    const res = await fetch(url.href);
    const json = await res.json();

    return `${url.href}?alt=media&token=${json.downloadTokens}`;
}

function dumpUserSessionData(user: User) {
    const meta = user.metadata;

    return {
        id       : user.uid,
        email    : user.email,
        fullName : user.displayName,
        avatar   : user.photoURL,

        lastLoginAt : meta.lastSignInTime,
        createdAt   : meta.creationTime

        // accessToken: user.accessToken
    };
}

// interface CustomBaseApi extends BaseApi {
//     get(url: string): any; // Define the 'get' method signature
// }

class FireBase {
    _app: FirebaseApp;

    _userId: any;

    _storage: FirebaseStorage;

    _bucketName: string;

    _instance: any;

    constructor(firebaseConfig) {
        // super();
        this._app = initializeApp(firebaseConfig);
        this._storage = getStorage(this._app);
        this._bucketName = this._app.options.storageBucket || '';
    }

    getHeaders() {
        return {};
    }

    async getImageUrl(userId, imageName) {
        const file = `gs://${this._bucketName}/${userId}/${imageName}`;
        const starsRef = refStorage(this._storage, file);

        return getDownloadURL(starsRef);
    }

    async downloadImage(userId, imageName) {
        const url = await this.getImageUrl(userId, imageName);
        const res = await fetch(url);

        return res.blob();
    }

    async downloadRecipes(userId) {
        const db = getDatabase();
        const ref = refDB(db, `recipes/${userId}`);
        const snapshot = await get(ref);

        if (!snapshot.exists()) return [];

        return (Object.values(snapshot.val()) as Receipt[]);
    }

    async downloadRecipy(userId, recipyId) {
        const db = getDatabase();
        const ref = refDB(db, `recipes/${userId}/${recipyId}`);
        const snapshot = await get(ref);

        if (!snapshot.exists()) return null;

        return snapshot.val();
    }

    async signIn() {
        const auth = getAuth(this._app);

        const provider = new GoogleAuthProvider();

        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

        const result = await signInWithPopup(auth, provider);

        return dumpUserSessionData(result.user);
    }

    onError(error) {
        console.error(error);

        return null;
    }

    async saveUserData(user, data) {
        const db = getDatabase();
        const userRef = refDB(db, `users/${user.id}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            console.log('user', snapshot.val());
        } else {
            await set(userRef, user);
        }

        const promises = data.recipes.map(async r => {
            if (!r.id) return;
            const recipyRef = refDB(db, `recipes/${user.id}/${r.id}`);

            await set(recipyRef, r);
        });

        await Promise.all(promises);
    }

    async saveImage(user, name, blob) {
        const storageRef = refStorage(this._storage, `${user.id}/${name}`);

        await uploadBytes(storageRef, blob);
    }
}

const firebase = new FireBase(config.firebase);

export default firebase;
