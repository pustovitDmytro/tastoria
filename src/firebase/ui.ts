import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { FirebaseStorage } from 'firebase/storage';
import { getStorage, ref as refStorage, uploadBytes } from 'firebase/storage';
import  * as firebaseAuth  from 'firebase/auth';
import config from '../config';
import { dumpRecipe, dumpUserSessionData } from '~/utils/dumpUtils';
import { fireBaseErrorDecorator } from '~/errors';

const {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signInWithCustomToken,
    EmailAuthProvider,
    updatePassword,
    updateProfile,
    sendEmailVerification,
    applyActionCode,
    updateCurrentUser
} = firebaseAuth;

async function getDownloadURL(reference) {
    const service = reference.storage;
    const location = reference._location;
    const url = new URL(`${service._protocol }://${service.host}/v0${location.fullServerUrl()}`);

    const res = await fetch(url.href);
    const json = await res.json();

    return `${url.href}?alt=media&token=${json.downloadTokens}`;
}

@fireBaseErrorDecorator()
class FireBaseUI {
    _app: FirebaseApp;

    _storage: FirebaseStorage;

    _bucketName: string;

    _instance: any;

    constructor(firebaseConfig) {
        this._app = initializeApp(firebaseConfig);
        this._storage = getStorage(this._app);
        this._bucketName = this._app.options.storageBucket || '';
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

    async googleSignIn() {
        const auth = getAuth(this._app);
        const provider = new GoogleAuthProvider();

        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        return { user: dumpUserSessionData(result.user), token: idToken };
    }

    async signIn({ email, password }) {
        const auth = getAuth(this._app);
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        const user = credentials.user;
        const idToken = await user.getIdToken();

        return { user: dumpUserSessionData(user), token: idToken };
    }

    async signUp({ email, password, fullName }, appUrl) {
        const auth = getAuth(this._app);
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        const user = credentials.user;
        const url = new URL(`/login/?email=${email}`, appUrl.href);

        await updateProfile(user, {
            displayName : fullName
        });

        const actionCodeSettings = {
            url             : url.href,
            handleCodeInApp : true
        };

        await sendEmailVerification(user, actionCodeSettings);
        const idToken = await user.getIdToken();

        return { user: dumpUserSessionData(user), token: idToken };
    }

    async saveImage(user, name, blob) {
        const storageRef = refStorage(this._storage, `${user.id}/${name}`);

        await uploadBytes(storageRef, blob);
    }
}

export default new FireBaseUI(config.firebase);
