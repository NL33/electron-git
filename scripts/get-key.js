
/*******GENERATE PUBLIC AND PRIVATE KEY */
//steps:
//1. duscourseAPITest: send rsa keys to discourse. opens up discourse. where user hits authorize
//2. discourse redirects with payload. paypload based on default protocol set up with setAsDefaultProtocolClient in main.js: saturnproto
//3 app picks that up in "app.on('open-url')" function in main.js
//4 app parses to get the data after the payload in main.js. This is the "encoded user key"
//5. main.js sends parsed payload (encoded user key) to renderer, though discourse-payload-url
//6. renderer receives discourse-payload-url call, and then calls "decodeTheKey()" function. this decodes the key, and produces the actual API Key
//7. API key is saved securely
//8. when user wants to send something to discourse, the fucntion gets the API Key from the secure spot

var privateKey1;
var publicKey;
function discourseAPITest1() {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
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
    console.log("api test1");
    console.log("private key = " + privateKey);
    const http = require("url");
    var myUrl = "https://go.racetosaturn.com/user-api-key/new";

    //var redirectUrl = 'goprotocol:example' /***the below code with this url works to get a key for the app and go to discourse, but discourse produces an error when it tries to go to the redirect url. the custom protocol is not working yet. */
    var redirectUrl = "saturnproto://redirect";

    // code for getting user key. Commented out to not run again until ready

    const url = new URL(`https://go.racetosaturn.com/user-api-key/new`);

    url.searchParams.append("application_name", "Saturn-App");
    url.searchParams.append("client_id", hostname());
    url.searchParams.append("scopes", "write");
    url.searchParams.append("public_key", publicKey);
    //url.searchParams.append('auth_redirect', redirectUrl) /***LEAVE OUT IF YOU WANT THE SITE TO GIVE YOU THE KEY DIRECTLY */
    url.searchParams.append("nonce", "1");
    console.log(`redirect URL is ${url.href}`);
    shell.openExternal(url.href);

    //ipcRenderer.send('open-discourse-auth-window', url.href)  //if want to open the window in the app

    /*
           axios({
              method: 'get',
              url: myUrl,
              params: {
                  auth_redirect: redirectUrl,
                  application_name: 'Saturn App',
                  client_id: 'hostname',
                  scopes: 'write',//can also include push for notifications
                  //push_url: '',
                  nonce: '1',
                  public_key: publicKey
              },
              dataType: 'json'
          }).then(response =>{
              console.log('response = ')
              console.log(response)
              console.log('response data = ')
              myUrl.href = response.config 
              shell.openExternal(myUrl)
          }).catch(error=>{
              console.log('error in api test =')
              console.log(error)
          })
      */
}

ipcRenderer.on("discourse-payload-url", (event, payload) => {
    decodeTheKey(payload);
});

function decodeTheKey(payload) {
    console.log("decode the key now");
    var privateKey2 = privateKey1.trim(); //environmentVariables.privateKeyForDecoding.trim()
    //  var encodedKey = environmentVariables.encodedUserKey
    console.log("private key2 = " + privateKey2);
    const trimmedKey = payload.trim().replace(/\s/g, "");
    console.log(`trimmed encoded key is:*******= ${trimmedKey}`);
    const decriptedKey = privateDecrypt(
        {
            key: privateKey2,
            padding: constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(trimmedKey, "base64")
    );
    const jsonKey = decriptedKey.toString("ascii");
    console.log("the decoded key = ");
    console.log(jsonKey);
}

function decryptAttempt1() {
    var privateKey = environmentVariables.privateKeyForDecoding.trim();
    var encodedKey = environmentVariables.encodedUserKey.trim();
    const buffer = Buffer.from(encodedKey, "base64");
    const decrypted = privateDecrypt(
        {
            key: privateKey,
            padding: constants.RSA_PKCS1_PADDING,
        },
        buffer
    );
    console.log(decrypted.toString("utf8"));
}

function decryptAttempt() {
    var forge = require("node-forge");
    var pki = require("node-forge").pki;
    var privateKey1 = environmentVariables.privateKeyForDecoding1.trim();
    var encodedKey = environmentVariables.encodedUserKey1.trim();
    // var private_key = pki.privateKeyFromPem(privateKey);
    try {
        var privateKey = forge.pki.privateKeyFromPem(privateKey1);
        var ctBytes = forge.util.decode64(encodedKey);

        var plaintextBytes = privateKey.decrypt(ctBytes);
        // rsaMessage.val(plaintextBytes.toString('utf8')); <-- old
        console.log("key result = " + forge.util.decodeUtf8(plaintextBytes));
    } catch (e) {
        console.log(e);
        alert("cannot decrypt");
    }
    console.log("result = ");
    //console.log(result)
}
//https://stackoverflow.com/questions/47306186/node-decrypt-content-with-private-key-and-padding
