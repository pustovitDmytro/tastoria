/* eslint-disable import/unambiguous */
module.exports = {
    root : true,
    env  : {
        browser : true,
        es2021  : true,
        node    : true
    },
    extends : [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:qwik/recommended',
        'incredible'
    ],
    parser        : '@typescript-eslint/parser',
    parserOptions : {
        tsconfigRootDir : __dirname,
        project         : [ './tsconfig.json' ],
        ecmaVersion     : 2021,
        sourceType      : 'module',
        ecmaFeatures    : {
            jsx : true
        }
    },
    plugins : [ '@typescript-eslint' ],
    rules   : {
        '@typescript-eslint/no-explicit-any'                : 'off',
        '@typescript-eslint/explicit-module-boundary-types' : 'off',
        '@typescript-eslint/no-inferrable-types'            : 'off',
        '@typescript-eslint/no-non-null-assertion'          : 'off',
        '@typescript-eslint/no-empty-interface'             : 'off',
        '@typescript-eslint/no-namespace'                   : 'off',
        '@typescript-eslint/no-empty-function'              : 'off',
        '@typescript-eslint/no-this-alias'                  : 'off',
        '@typescript-eslint/ban-types'                      : 'off',
        '@typescript-eslint/ban-ts-comment'                 : 'off',
        'prefer-spread'                                     : 'off',
        'no-case-declarations'                              : 'off',
        '@typescript-eslint/consistent-type-imports'        : 'warn',
        '@typescript-eslint/no-unnecessary-condition'       : 'warn',
        'censor/no-swear'                                   : 0,
        '@typescript-eslint/no-unused-vars'                 : 0,
        'no-unused-vars'                                    : 0,
        'unicorn/filename-case'                             : 0,
        'node/no-unpublished-import'                        : 0,
        'no-duplicate-imports'                              : 0,
        'import/no-unresolved'                              : 0,
        'no-magic-numbers'                                  : 0,
        'qwik/jsx-img'                                      : 0,
        'qwik/no-use-visible-task'                          : 0
    },
    'globals' : {
        $localize      : 'writable',
        TASTORIA_BUILD : 'readable',
        expect         : 'readable',
        cy             : 'readable',
        Cypress        : 'readable'
    },
    'overrides' : [ {
        'files' : [ 'src/components/Header/header.tsx' ],
        'rules' : {
            'qwik/valid-lexical-scope' : 0
        }
    } ]
};
