
import {
    ClassMethodDecorator as BaseClassMethodDecorator,
    ClassDecorator as BaseClassDecorator,
    FunctionDecorator as BaseFunctionDecorator,
    isFunction,
    isClass,
    cleanUndefined,
    getBenchmark,
    startBenchmark
} from 'myrmidon';
import { $ } from '@builder.io/qwik';

import { v4 as uuid } from 'uuid';

function decorateClass(target, config) {
    const decorator = new ClassDecorator({ config });

    return decorator.decorate(target);
}

function classMethodDecorator({ target, methodName, descriptor }, config = {}) {
    const a = new ClassMethodDecorator({
        methodName,
        descriptor,
        config,
        target
    });

    return a.run();
}

function classDecorator(target, config = {}) {
    if (config.classProperties) {
        return class extends target {
            constructor(...args) {
                super(...args);
                decorateClass(this, config);
            }
        };
    }

    decorateClass(target.prototype, config);
}

class TastoriaError extends Error {
    constructor({ type, original, code, message }) {
        super(code);
        this.type = type;
        this.original = original;
        this.code = code;
        this.message = message;
    }
}

export async function qwikErrorDecorator(f, { app, signals: { main } }) {
    try {
        await f();
    } catch (error) {
        const id = uuid();

        // eslint-disable-next-line no-param-reassign
        app.toasts[id] = {
            id,
            type : 'error',
            text : error.message
        };

        // eslint-disable-next-line no-param-reassign
        if (main) main.value = error.message;
    }
}

class FunctionDecorator extends BaseFunctionDecorator {
    onError({ error, config }) {
        const payload = {
            type     : 'UnknownTastoriaError',
            original : error
        };

        if (error.name === 'FirebaseError') {
            payload.type = error.name;
            const found = Object.keys(firebaseErrors).find(key => error.message.includes(key));

            payload.code = found ? firebaseErrors[found] : 'FIREBASE_UNKNOWN_ERROR';
            payload.message = ERROR_MESSAGES[payload.code];
        }

        throw new TastoriaError(payload);
    }
}


class ClassMethodDecorator extends BaseClassMethodDecorator {
    static FunctionDecorator = FunctionDecorator;
}

class ClassDecorator extends BaseClassDecorator {
    static ClassMethodDecorator = ClassMethodDecorator;

    getClassMethodDecoratorConfig(params) {
        const { target } = params;

        return {
            ...super.getClassMethodDecoratorConfig(params),
            serviceName : target.constructor.name
        };
    }
}

function getDecorator() {
    return (...args) => {
        const config = args[0];

        return (target, methodName, descriptor) => {
            if (methodName && descriptor) {
                return classMethodDecorator(
                    { target, methodName, descriptor },
                    config
                );
            }

            if (isClass(target)) {
                return classDecorator(target, config);
            }

            if (isFunction(target)) {
                const functionDecorator = new FunctionDecorator({ config });

                return functionDecorator.run(target);
            }
        };
    };
}

export const fireBaseErrorDecorator = getDecorator();

const firebaseErrors = {
    'auth/admin-restricted-operation' : 'FIREBASE_ADMIN_ONLY_OPERATION',
    'auth/code-expired'               : 'FIREBASE_CODE_EXPIRED',
    'auth/email-already-in-use'       : 'FIREBASE_EMAIL_EXISTS',
    'auth/expired-action-code'        : 'FIREBASE_EXPIRED_OOB_CODE',
    'auth/internal-error'             : 'FIREBASE_INTERNAL_ERROR',
    'auth/invalid-user-token'         : 'FIREBASE_INVALID_AUTH',
    'auth/invalid-verification-code'  : 'FIREBASE_INVALID_CODE',
    'auth/invalid-email'              : 'FIREBASE_INVALID_EMAIL',
    'auth/invalid-credential'         : 'FIREBASE_INVALID_LOGIN_CREDENTIALS',
    'auth/invalid-action-code'        : 'FIREBASE_INVALID_OOB_CODE',
    'auth/wrong-password'             : 'FIREBASE_INVALID_PASSWORD',
    'auth/missing-verification-code'  : 'FIREBASE_MISSING_CODE',
    'auth/missing-verification-id'    : 'FIREBASE_MISSING_SESSION_INFO',
    'auth/network-request-failed'     : 'FIREBASE_NETWORK_REQUEST_FAILED',
    'auth/quota-exceeded'             : 'FIREBASE_QUOTA_EXCEEDED',
    'auth/timeout'                    : 'FIREBASE_TIMEOUT',
    'auth/user-token-expired'         : 'FIREBASE_TOKEN_EXPIRED',
    'auth/too-many-requests'          : 'FIREBASE_TOO_MANY_ATTEMPTS_TRY_LATER',
    'auth/unverified-email'           : 'FIREBASE_UNVERIFIED_EMAIL',
    'auth/user-not-found'             : 'FIREBASE_USER_DELETED',
    'auth/user-signed-out'            : 'FIREBASE_USER_SIGNED_OUT',
    'auth/weak-password'              : 'FIREBASE_WEAK_PASSWORD',
    'auth/invalid-login-credentials'  : 'FIREBASE_INVALID_CREDENTIALS',

    'Permission denied' : 'FIREBASE_PERMISSION_DENIED'
};

export const ERROR_MESSAGES =  {
    FIREBASE_UNKNOWN_ERROR : $localize `ERROR_FIREBASE_UNKNOWN_ERROR`,

    FIREBASE_INVALID_CREDENTIALS         : $localize `FIREBASE_INVALID_CREDENTIALS`,
    FIREBASE_ADMIN_ONLY_OPERATION        : $localize `ERROR_FIREBASE_ADMIN_ONLY_OPERATION`,
    FIREBASE_CODE_EXPIRED                : $localize `ERROR_FIREBASE_CODE_EXPIRED`,
    FIREBASE_EMAIL_EXISTS                : $localize `ERROR_FIREBASE_EMAIL_EXISTS`,
    FIREBASE_EXPIRED_OOB_CODE            : $localize `ERROR_FIREBASE_EXPIRED_OOB_CODE`,
    FIREBASE_INTERNAL_ERROR              : $localize `ERROR_FIREBASE_INTERNAL_ERROR`,
    FIREBASE_INVALID_AUTH                : $localize `ERROR_FIREBASE_INVALID_AUTH`,
    FIREBASE_INVALID_CODE                : $localize `ERROR_FIREBASE_INVALID_CODE`,
    FIREBASE_INVALID_EMAIL               : $localize `ERROR_FIREBASE_INVALID_EMAIL`,
    FIREBASE_INVALID_LOGIN_CREDENTIALS   : $localize `ERROR_FIREBASE_INVALID_LOGIN_CREDENTIALS`,
    FIREBASE_INVALID_OOB_CODE            : $localize `ERROR_FIREBASE_INVALID_OOB_CODE`,
    FIREBASE_INVALID_PASSWORD            : $localize `ERROR_FIREBASE_INVALID_PASSWORD`,
    FIREBASE_MISSING_CODE                : $localize `ERROR_FIREBASE_MISSING_CODE`,
    FIREBASE_MISSING_SESSION_INFO        : $localize `ERROR_FIREBASE_MISSING_SESSION_INFO`,
    FIREBASE_NETWORK_REQUEST_FAILED      : $localize `ERROR_FIREBASE_NETWORK_REQUEST_FAILED`,
    FIREBASE_QUOTA_EXCEEDED              : $localize `ERROR_FIREBASE_QUOTA_EXCEEDED`,
    FIREBASE_TIMEOUT                     : $localize `ERROR_FIREBASE_TIMEOUT`,
    FIREBASE_TOKEN_EXPIRED               : $localize `ERROR_FIREBASE_TOKEN_EXPIRED`,
    FIREBASE_TOO_MANY_ATTEMPTS_TRY_LATER : $localize `ERROR_FIREBASE_TOO_MANY_ATTEMPTS_TRY_LATER`,
    FIREBASE_UNVERIFIED_EMAIL            : $localize `ERROR_FIREBASE_UNVERIFIED_EMAIL`,
    FIREBASE_USER_DELETED                : $localize `ERROR_FIREBASE_USER_DELETED`,
    FIREBASE_USER_SIGNED_OUT             : $localize `ERROR_FIREBASE_USER_SIGNED_OUT`,
    FIREBASE_WEAK_PASSWORD               : $localize `ERROR_FIREBASE_WEAK_PASSWORD`,
    FIREBASE_PERMISSION_DENIED           : $localize `ERROR_FIREBASE_PERMISSION_DENIED`
};
