import AssemblerImport from 'cottus/lib/Assembler';
import defaultRulesImport  from 'cottus/lib/rules';
import CottusImport from 'cottus/lib/Cottus';
// import { isDev } from '@builder.io/qwik/build';

const Assembler = AssemblerImport.default ?? AssemblerImport;
const defaultRules = defaultRulesImport.default || defaultRulesImport;
const Cottus = CottusImport.default || CottusImport;
// import AssemblerInport from 'cottus/lib/Assembler';
// import defaultRulesInport  from 'cottus/lib/rules';
// import CottusInport from 'cottus/lib/Cottus';

const cottus = new Cottus({ rules: defaultRules });

const e = import.meta.env;

const firebase = prefix => ({
    apiKey            : { $source: `{${prefix}_API_KEY}`, $validate: [ 'required', 'string' ] },
    authDomain        : { $source: `{${prefix}_AUTH_DOMAIN}`, $validate: [ 'required', 'string' ] },
    projectId         : { $source: `{${prefix}_PROJECT_ID}`, $validate: [ 'required', 'string' ] },
    storageBucket     : { $source: `{${prefix}_STORAGE_BUCKET}`, $validate: [ 'required', 'string' ] },
    messagingSenderId : { $source: `{${prefix}_MESSAGING_SENDER_ID}`, $validate: [ 'required', 'string' ] },
    appId             : { $source: `{${prefix}_APPID}`, $validate: [ 'required', 'string' ] },
    measurementId     : { $source: `{${prefix}_MEASUREMENT_ID}`, $validate: [ 'required', 'string' ] }
});

const firebaseToken = prefix => ({
    privateKey : { $source: `{${prefix}_PRIVATE_KEY}`, $validate: [ 'required', 'string' ] }, // TODO: encryptionKey
    sub        : { $source: `{${prefix}_SUB}`, $validate: [ 'required', 'email' ] },
    issuer     : { $source: `{${prefix}_SUB}`, $validate: [ 'required', 'email' ] },
    audience   : { $source: `{${prefix}_AUDIENCE}`, $validate: [ 'required', 'string' ] }
});

const schema = {
    firebase : firebase('PUBLIC_FIREBASE'),
    sync     : {
        disable : { $source: '{PUBLIC_DISABLE_SYNC}', $validate: [ 'required', 'boolean' ] }
    }
};

const assembler = new Assembler(cottus, schema);

assembler.parse();
const config = assembler.run(e);

export default config;

export function getFirebaseTokenConfig(env) {
    const faSchema = firebaseToken('FIREBASE_TOKEN');
    const dict = {};

    for (const key of Object.keys(faSchema)) {
        const envKey = faSchema[key].$source.replaceAll(/['{}]/g, '');

        dict[envKey] = env.get(envKey);
    }

    const faAssembler = new Assembler(cottus, faSchema);

    faAssembler.parse();

    return faAssembler.run(dict);
}
