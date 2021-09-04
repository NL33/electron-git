module.exports = {
    "packagerConfig": {
        "icon": "./assets/rts-iconr",
        "osxSign": {
            "identity": 'Developer ID Application: Race to Saturn, LLC (V68AY8BCU4)',
            "hardened-runtime": true,
            "gatekeeper-assess": false,
            "entitlements": "static/entitlements.plist",
            "entitlements-inherit": "static/entitlements.plist",
            "signature-flags": "library"
        },
        "osxNotarize": {
            "appleId": 'info112233@racetosaturn.com',
            "appleIdPassword": 'usrh-nkik-qguk-uhpw'
        }
    },
    "makers": [
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
