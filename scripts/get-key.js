
/*******GENERATE PUBLIC AND PRIVATE KEY */
//description: https://meta.discourse.org/t/user-api-keys-specification/48536/45
//stackoverflow: https://stackoverflow.com/questions/68838012/does-electrons-registerhttpprotocol-work-in-development
//steps:
//1. duscourseAPITest: send rsa keys to discourse. opens up discourse. where user hits authorize
//2. discourse redirects with payload. paypload based on default protocol set up with setAsDefaultProtocolClient in main.js: saturnproto
//3 app picks that up in "app.on('open-url')" function in main.js
//4 app parses to get the data after the payload in main.js. This is the "encoded user key"
//5. main.js sends parsed payload (encoded user key) to renderer, though discourse-payload-url
//6. renderer receives discourse-payload-url call, and then calls "decodeTheKey()" function. this decodes the key, and produces the actual API Key
//7. API key is saved securely
//8. when user wants to send something to discourse, the fucntion gets the API Key from the secure spot
const { ipcRenderer } = require('electron')

const { generateKeyPairSync, privateDecrypt, constants } = require('crypto');

const { hostname } = require('os')



var privateKeyRaw
var publicKey;
module.exports.sendKeysToSite = async function () {
  try {
    //var testOrLive = 'test'
    var { publicKey, privateKey } = generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
        },
    });
    privateKeyRaw = privateKey
    const http = require("url");
   // if (testOrLive === 'test'){
     //   var url = new URL(`https://localhost:4200/user-api-key/new`);
   // } else {
        var url = new URL(`https://go.racetosaturn.com/user-api-key/new`);
    //}
    
    var redirectUrl = "saturnproto://redirect";

    url.searchParams.append("application_name", "Saturn-App");
    url.searchParams.append("client_id", hostname());
    url.searchParams.append("scopes", "write");
    url.searchParams.append("public_key", publicKey);
    url.searchParams.append('auth_redirect', redirectUrl) /***LEAVE OUT IF YOU WANT THE SITE TO GIVE YOU THE KEY DIRECTLY */
    url.searchParams.append("nonce", "1");
    shell.openExternal(url.href);
} catch(e){
    console.log('error sending keys to the main site = ' + e)
}
}


module.exports.decodeTheKey = async function (payload) {
  try {
    const keytar = require('keytar')
    var privateKey1 = privateKeyRaw.trim(); //environmentVariables.privateKeyForDecoding.trim()
    //  var encodedKey = environmentVariables.encodedUserKey
    const trimmedKey = decodeURIComponent(payload)//.trim().replace(/\s/g, "");
    const decriptedKey = privateDecrypt(
        {
            key: privateKey1,
            padding: constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(trimmedKey, "base64")
    );
    const jsonKey = decriptedKey.toString("ascii");
    const theKey = JSON.parse(jsonKey).key
    console.log('the key = ' + theKey)
    await keytar.setPassword('saturn_app_api_token', 'account', theKey)
    console.log('set the key. It = ' + theKey);
    } catch(e) {
        console.log('error decoding the key = ' + e)
    }
}


module.exports.getSecureToken = async function(){
    try {
    const keytar = require('keytar')
    await keytar.getPassword('saturn_app_api_token', 'account').then((result)=>{
        console.log('the token = ' + result)
    })
    } catch(e){
        console.log('error in getting the token = ' + e)
    }
}

