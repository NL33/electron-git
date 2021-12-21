const uglify = require('./hooks/uglify');
const excludeMeta = require('./hooks/exclude-meta');
require('dotenv').config();


module.exports = {
    "packagerConfig": {
        "icon": "./assets/rts-iconr",
        "osxSign": {
            "identity": process.env.DEVID,
            "hardened-runtime": true,
            "gatekeeper-assess": false,
            "entitlements": "static/entitlements.plist",
            "entitlements-inherit": "static/entitlements.plist",
            "signature-flags": "library"
        },
        "osxNotarize": {
            "appleId": process.env.APPLEID,
            "appleIdPassword": process.env.APPIDPASS
        },
        "ignore": [
            'forge.config.js',
            '.env',
            './environments/environments.js',
           /* '.gitignore', for some reason creates error when include*/
            'z-changelog.md',
            'z-next.md',
            'hooks',
            'README.md'
        ],
        "ignorePackageJson": [
            'devDependencies',
            'author',
            'scripts',
            'keywords',
        ],
        "asar": true,

    },
    "makers": [
        {
            "name": "@electron-forge/maker-dmg",
            "config": {
                "format": "ULFO"
            }
        },
        {
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "name": "electron_git"
            }
        },
        {
            "name": "@electron-forge/maker-zip",
            "platforms": [
                "darwin"
            ]
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {}
        }
    ],
    "hooks": {
        packageAfterCopy: async (_, location) => {
            await uglify(location, 'javascripts').then(console.log('ug done'));
            excludeMeta(location, _.packagerConfig.ignorePackageJson);
            console.log('✔ selected package.json properties are excluded');
        },
    }
}

