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
    ]
}

