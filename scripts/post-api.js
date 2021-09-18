const { readFile, readdirSync, statSync } = require("fs");
var mammoth = require("mammoth");
const sanitizeHtml = require('sanitize-html');
//dexie database for linking project files to discourse posts
const Dexie = require("dexie");
var db = new Dexie("ProjectDatabase");
//Dexie.debug = false //set to false for production. During development, gives more thorough error logs
let projectName;
let projectPath;

module.exports.setUpDexie = async function () {
  try {
    await db.version(2).stores({
      fileInfo:
        "++id,fileId, fileName, lastSentTime, filePath, topicId, projectName, pathForTopic, linkAddress, summaryText, topicUserName",
    });
    console.log("setup dexie");
    return "done";
  } catch (error) {
    console.log("error in setUpDexie = " + error);
  }
};

module.exports.sendProject = function (projectFolderPath, projectFolderName) {
  console.log(projectFolderPath + "," + projectFolderName);
  projectName = projectFolderName;
  projectPath = projectFolderPath;
  loopThroughFolder("start");
  console.log("got it!");
};

/************** Testing Discourse API *******************************/

//current-code
async function loopThroughFolder(thePath) {
  try {
    var currentTime = new Date();
    if (thePath === "start") {
      //why do we specify the path here, including start? Because below in this function, if an item is a directory, we run this loopThroughFolder again, only this time, the starting point is that (sub) directory. So we need a way of distinguishing what directory we are looking at
      var projectPath = projectFolderPath; //overall project path
    } else {
      var projectPath = thePath;
    }

    var projectContents1 = await readdirSync(projectPath); //produces array of all top-level contents of a folder
    var projectContents = projectContents1.filter(
      (item) => !/(^|\/)\.[^\/\.]/g.test(item)
    ); //excludes hidden files like .ds-store and .git files
    for (var i = 0; i < projectContents.length; i++) {
      if (projectContents[i].substring(0, 2) !== "~$") {
        //stop if a temp word file
        var itemPath = path.join(projectPath, projectContents[i]);
        //await fs.stat(itemPath) //fsStat would be used to determine metadata info about the given file, such as when it was last updated
        if (statSync(itemPath).isDirectory() === true) {
          //if a directory, then run this again, until you get to a document
          loopThroughFolder(itemPath);
        } else {
          //if it's a file, then see if a word doc. If so, perform magic.
          var extension = path.extname(itemPath);
          if (extension.includes("doc")) {
            checkDatabase(itemPath, "word");
            // sendDocWordDoc(itemPath)
          } else {
            checkDatabase(itemPath, "notWord");
            //sendDoc(itemPath)
            // return 'done'
          }
        }
      }
    }
  } catch (e) {
    console.log("error in loop through folder = " + e);
  }
}

async function checkDatabase(filePath, wordOrNot) {
  try {
    var stats = statSync(filePath);
    var createTime = stats.birthtimeMs;
    var dbEntry = await db.fileInfo.get({ fileId: createTime });
    if (!dbEntry) {
      //not entered in database yet. should mean no discourse topic created yet. So create a new one
      setUpDocForCreate(filePath, createTime, wordOrNot);
    } else {
      //already a discourse topic
      var lastModifiedTime = stats.mtime; //mtime is when file last modified. ctime includes that time, but also includes if file properties change, like file permissions, name or location. Ctime would be better, but it also updates when the file is opened (even if no other change). So I am going with mtime--and if you want to update the version online, you need to be sure to save it.
      var lastSentTime = dbEntry.lastSentTime;
      var topicId = dbEntry.topicId;
      if (lastModifiedTime > lastSentTime) {
        console.log("time to update for  = " + filePath);
        setUpDocForUpdate(filePath, createTime, wordOrNot, topicId);
      } else {
        console.log("dont update for " + filePath);
      }
    }
  } catch (e) {
    console.log("error in checkDatabase = " + e);
  }
}

function setUpDocForCreate(itemPath, createTime, wordOrNot) {
  try {
    if (wordOrNot === "word") {
      mammoth.convertToHtml({ path: itemPath }).then(function (result) {
        var htmlWord = result.value;
        createDiscoursePostFromFile(itemPath, createTime, htmlWord);
      });
    } else {
      readFile(itemPath, "utf8", function (err, data) {
        if (err) {
          console.log("error in reading file in send doc = " + err);
        } else {
          createDiscoursePostFromFile(itemPath, createTime, data);
        }
      });
    }
  } catch (e) {
    console.log("error in setup doc for create = " + e);
  }
}

function setUpDocForUpdate(itemPath, createTime, wordOrNot, topicId) {
  try {
    console.log("setup doc for Update, for: " + itemPath);
    if (wordOrNot === "word") {
      mammoth.convertToHtml({ path: itemPath }).then(function (result) {
        var htmlWord = result.value;
        updateDiscoursePostFromFile(itemPath, createTime, htmlWord, topicId);
      });
    } else {
      readFile(itemPath, "utf8", function (err, data) {
        if (err) {
          console.log("error in reading file in send doc = " + err);
        } else {
          updateDiscoursePostFromFile(itemPath, createTime, data, topicId);
        }
      });
    }
  } catch (e) {
    console.log("error in setup doc for update = " + e);
  }
}



/**************SEND THE DOCS TO THE WEB APP ************************ */


function createDiscoursePostFromFile(filePath, createTime, data) {
  var testOrLive = 'test'
  if (testOrLive === 'live'){
    var url = "https://go.racetosaturn.com/posts.json";
    var category = 36
    var userName = 'seanrts'
    var apiKey = environmentVariables.decodedUserKey
  } else {
      var url = "http://localhost:4200/posts.json";
      var category = 11;
      var userName = 'winst1143'
      var apiKey= ''//environmentVariables.wsKey,
      var apiUserName=''// environmentVariables.wsName,
  }

  var title = path.basename(filePath);
  var topicContent = data;

  var tagName = 'music'

  var filePathArray = filePath.split(projectName)
  var pathForTopic = projectName + filePathArray[1]

  var summaryText = ''
  if (title.includes('project-summary.')){
      var summaryTextRaw = data
      summaryText = sanitizeHtml(summaryTextRaw).trim();
  }

  return 'done'
  var topicShowPath = filePath.substring( /****START HERE!!!!!!!!!!! */
    filePath.indexOf(projectFolderName) + (projectFolderName.length + 1)
  ); /*
    example:
    project name (projectFolderName) = 'rocking-research'
    doc path = rocking-research/post-enlightenment/platos-influences.docx
    topicShowPath = 'post-enlightenment/platos-influences.docx' ; and that will be the title of the post.
   */

  axios({
    method: "post",
    url: url,
    contentType: "multipart/form-data",
    data: {
      title: topicShowPath,
      raw: topicContent,
      category: category,
      project_main: projectName,
      path_for_topic: pathForTopic,
      summary_text: summaryText,
      tags: [tagName],

    },
    headers: {
      //"User-Api-Key": environmentVariables.decodedUserKey,
      apiKey: apiKey,
      apiUserName: apiUserName
    },
    dataType: "json",
  })
    .then((response) => {
      console.log("created new post for = " + filePath);
      console.log("heres the response = ");
      console.log(response);
      var topicId = response.data.id;
      var timeNow1 = new Date();
      var userName = 'GET USER NAME'
      /*GET USER NAME ^^^^^^^^^^^^^^^*/
      var timeNow = timeNow1.getTime();
      db.fileInfo.add({
        fileId: createTime,
        fileName: title,
        filePath: filePath,
        topicId: topicId,
        lastSentTime: timeNow,
        projectName: projectName,
        pathForTopic: pathForTopic,
        linkAddress: '',
        summaryText: '',
        topicUserName: userName
        //project?
      });
    })
    .catch((error) => {
      console.log("error in api post test =");
      console.log(error);
    });
}
//wsKey
function updateDiscoursePostFromFile(filePath, createTime, data, topicId) {
  var url = "https://go.racetosaturn.com/posts/" + topicId + ".json";
  var title = path.basename(filePath);
  var topicContent = data;
  var topicShowPath = filePath.substring(
    filePath.indexOf(projectFolderName) + (projectFolderName.length + 1)
  );
  var userName = "SeanRtS"; //***Have to get this programmatically*****/
  var tagName = userName + "-project-" + projectFolderName;
  axios({
    method: "put",
    url: url,
    contentType: "multipart/form-data",
    data: {
      title: topicShowPath,
      raw: topicContent,
      tags: [tagName],
    },
    headers: {
      "User-Api-Key": environmentVariables.decodedUserKey,
      //"Api-Username": 'SeanRtS'
    },
    dataType: "json",
  })
    .then((response) => {
      console.log("discourse post updated for = " + topicShowPath);
      var timeNow1 = new Date();
      var timeNow = timeNow1.getTime();
      db.transaction("rw", db.fileInfo, async () => {
        db.fileInfo.where("fileId").equals(createTime).modify({
          fileName: title, //most of the time will be the same. but would be updated if user changes the title
          filePath: filePath, //most of the time will be the same. but would be updated if user changes the path
          lastSentTime: timeNow,
        });
        const viewEntry = await db.fileInfo
          .where({ fileId: createTime })
          .toArray();
      })
        .catch(Dexie.ModifyError, (error) => {
          // ModifyError did occur
          console.error(error.failures.length + " items failed to modify");
        })
        .catch((error) => {
          console.error("Generic error: " + error);
        });
    })
    .catch((error) => {
      console.log("error in update discourse post from file =");
      console.log(error);
    });
}

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
