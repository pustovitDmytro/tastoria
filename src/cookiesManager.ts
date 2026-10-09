
import { isAfter } from 'date-fns';
import { exportJWK, importJWK, importPKCS8, jwtVerify, SignJWT } from 'jose';
import type { KeyLike } from 'jose';
import type { FireBaseTokenPayload } from './types';
import { getFirebaseTokenConfig } from '~/config';

const version = TASTORIA_BUILD.VERSION;
const sessionCookieKey = 'tastoria.session';

const SESSION_MAX_AGE = '90 days';
const publicKeys = new Map<string, Promise<KeyLike | Uint8Array>>();

async function derivePublicKey(privateKey: string) {
    const key = await importPKCS8(privateKey, 'RS256', { extractable: true });
    const { kty, n, e } = await exportJWK(key);

    return importJWK({ kty, n, e }, 'RS256');
}

function getPublicKey(privateKey: string) {
    if (!publicKeys.has(privateKey)) publicKeys.set(privateKey, derivePublicKey(privateKey));

    return publicKeys.get(privateKey) as Promise<KeyLike | Uint8Array>;
}

// Expired tokens are still accepted here (up to the cookie lifetime) so getSession can refresh them
async function verify(token, env): Promise<FireBaseTokenPayload | null> {
    try {
        const tokenConfig = getFirebaseTokenConfig(env);
        const key = await getPublicKey(tokenConfig.privateKey);
        const { payload } = await jwtVerify(token, key, {
            issuer         : tokenConfig.issuer,
            audience       : tokenConfig.audience,
            clockTolerance : SESSION_MAX_AGE
        });

        return payload as unknown as FireBaseTokenPayload;
    } catch {
        return null;
    }
}

class CookieManager {
    async readSession(cookie, env) {
        const session = cookie.get(sessionCookieKey);

        if (!session) return null;
        const { token } = session.json();

        if (!token) return null;

        const decoded = await verify(token, env);

        if (!decoded?.uid) return null;

        return { token, decoded };
    }

    async isLoggedIn(cookie, env) {
        const session = await this.readSession(cookie, env);

        return session ? session.token : false;
    }

    setSession(cookie, jwttoken) {
        cookie.set(sessionCookieKey, { token: jwttoken, version }, {
            path     : '/',
            maxAge   : [ 90, 'days' ],
            sameSite : 'strict'
        });
    }

    async getSession(cookie, env) {
        const session = await this.readSession(cookie, env);

        if (!session) return null;

        const { token, decoded } = session;

        const isExpired = isAfter(new Date(), new Date(decoded.exp * 1000));

        if (isExpired) {
            const tokenConfig = getFirebaseTokenConfig(env);

            const key = await importPKCS8(tokenConfig.privateKey, 'RS256');

            const jwt = await new SignJWT({
                uid      : decoded.uid,
                authTime : decoded.authTime,
                sub      : tokenConfig.sub
            })
                .setProtectedHeader({ alg: 'RS256' })
                .setIssuedAt()
                .setIssuer(tokenConfig.issuer)
                .setAudience(tokenConfig.audience)
                .setExpirationTime('1h')
                .sign(key);

            await this.setSession(cookie, jwt);

            return {
                token  : jwt,
                userId : decoded.uid
            };
        }

        return {
            token,
            userId : decoded.uid
        };
    }

    async deleteSession(cookie) {
        cookie.delete(sessionCookieKey, { path: '/' });
    }
}

export default new CookieManager();
