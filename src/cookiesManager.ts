
import { isAfter } from 'date-fns';
import { decodeJwt, SignJWT, importPKCS8 } from 'jose';
import type { FireBaseTokenPayload } from './types';
import { getFirebaseTokenConfig } from '~/config';

const version = TASTORIA_BUILD.VERSION;
const sessionCookieKey = 'tastoria.session';

function decode(token) {
    return decodeJwt(token) as FireBaseTokenPayload;
}

class CookieManager {
    async isLoggedIn(cookie) {
        const session = cookie.get(sessionCookieKey);

        if (!session) return false;
        const { token } = session.json();

        if (!token) return false;

        const decoded = decode(token);

        if (!decoded.uid) return false;

        return token;
    }

    setSession(cookie, jwttoken) {
        cookie.set(sessionCookieKey, { token: jwttoken, version }, {
            path     : '/',
            maxAge   : [ 90, 'days' ],
            sameSite : 'strict'
        });
    }

    async getSession(cookie, env) {
        const token = await this.isLoggedIn(cookie);

        if (!token) return null;

        const decoded = decode(token);

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
