import Assembler from 'cottus/lib/Assembler';
import defaultRules  from 'cottus/lib/rules';
import Cottus from 'cottus/lib/Cottus';

// import AssemblerInport from 'cottus/lib/Assembler';
// import defaultRulesInport  from 'cottus/lib/rules';
// import CottusInport from 'cottus/lib/Cottus';

// const Assembler = AssemblerInport.default;
// const defaultRules = defaultRulesInport.default;
// const Cottus = CottusInport.default;

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

const schema = {
    firebase : firebase('PUBLIC_FIREBASE')
};

const assembler = new Assembler(cottus, schema);

assembler.parse();
const config = assembler.run(e);

export default config;
