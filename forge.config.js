module.exports = {
    "packagerConfig": {
        "icon": "./assets/rts-iconr",
        "osxSign": {
            "identity": "environmental-variables.developerId",
            "hardened-runtime": true,
            "entitlements": "static/entitlements.plist",
            "entitlements-inherit": "static/entitlements.plist",
            "signature-flags": "library"
        },
        "osxNotarize": {
            "appleId": "environmental-variables.appleId",
            "appleIdPassword": "environmental-variables.applePassword"
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
