import type { EntityStorageUI, ImageContext } from '../types';

// Browser never talks to supabase directly: the service key lives server-side,
// so all image traffic goes through the session-protected /api/image endpoint.
function buildImagePath(userId: string, imageName: string, ctx?: ImageContext) {
    const search = new URLSearchParams({ userId });

    if (ctx?.shareToken) search.set('share', ctx.shareToken);

    return `/api/image/${encodeURIComponent(imageName)}?${search.toString()}`;
}

const IMAGE_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

// Blobs unpacked from a backup zip carry no type, while /api/image accepts only image/*
function getImageType(imageName: string, blob: Blob) {
    const extension = imageName.split('.').pop()?.toLowerCase() ?? '';

    return blob.type || IMAGE_TYPES[extension] || 'application/octet-stream';
}

const supabaseDriver: EntityStorageUI = {
    async getImageUrl(userId, imageName, ctx) {
        return buildImagePath(userId, imageName, ctx);
    },

    async downloadImage(userId, imageName, ctx) {
        const res = await fetch(buildImagePath(userId, imageName, ctx));

        if (!res.ok) throw new Error(`IMAGE_DOWNLOAD_FAILED (${res.status})`);

        return res.blob();
    },

    async saveImage(user, imageName, blob) {
        const res = await fetch(`/api/image/${encodeURIComponent(imageName)}`, {
            method  : 'POST',
            headers : { 'Content-Type': getImageType(imageName, blob) },
            body    : blob
        });

        if (!res.ok) throw new Error(`IMAGE_UPLOAD_FAILED (${res.status})`);
    }
};

export default supabaseDriver;
