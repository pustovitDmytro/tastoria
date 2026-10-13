import type { FilesStorageServer } from '../types';
import FireBaseServer from '~/firebase/server';

export default class FirebaseFilesStorage implements FilesStorageServer {
    private _server: FireBaseServer;

    constructor({ env }) {
        this._server = new FireBaseServer({ env });
    }

    getImageUrl(userId: string, imageName: string): Promise<string> {
        return this._server.getImageUrl(userId, imageName);
    }

    saveImage(userId: string, imageName: string, data: Blob | ArrayBuffer): Promise<void> {
        return this._server.saveImage(userId, imageName, data);
    }
}
