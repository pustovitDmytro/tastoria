import type { FilesStorageUI } from '../types';
import firebaseUI from '~/firebase/ui';

const firebaseDriver: FilesStorageUI = {
    getImageUrl(userId, imageName) {
        return firebaseUI.getImageUrl(userId, imageName);
    },

    downloadImage(userId, imageName) {
        return firebaseUI.downloadImage(userId, imageName);
    },

    saveImage(user, imageName, blob) {
        return firebaseUI.saveImage(user, imageName, blob);
    }
};

export default firebaseDriver;
