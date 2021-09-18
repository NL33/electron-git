const { readFile, readdirSync, statSync } = require('fs')
//dexie database for linking project files to discourse posts
const Dexie = require('dexie')
var db = new Dexie("ProjectDatabase")
//Dexie.debug = false //set to false for production. During development, gives more thorough error logs
let projectName
let projectPath

module.exports.setUpDexie = async function(){
    try {
            await db.version(1).stores({
                fileInfo: "++id,fileId, fileName, lastSentTime, filePath, topicId, projectName, projectTagName, pathForTopic, linkAddress, summaryText"
            })
            console.log('setup dexie')
            return 'done'
        } catch (error) {
            console.log('error in setUpDexie = ' + error)
        }
}

module.exports.sendProject = function (projectFolderPath, projectFolderName){
    console.log(projectFolderPath +','+ projectFolderName)
    projectName = projectFolderName
    projectPath = projectFolderPath
    loopThroughFolder()
    console.log('got it!')
}

/************** Testing Discourse API *******************************/

//current-code
async function loopThroughFolder() {
    var currentTime = new Date()
    console.log('current time = ' + currentTime.getTime())
    /*
    if (thePath === 'start') {
        var projectPath = projectFolderPath //overall project path
    } else {
        var projectPath = thePath
    }
    */

    var projectContents1 = await readdirSync(projectPath) //produces array of all top-level contents of a folder
    var projectContents = projectContents1.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item)); //excludes hidden files like .ds-store and .git files 
    console.log('project contents = ' + projectContents)
    for (var i = 0; i < projectContents.length; i++) {
        if (projectContents[i].substring(0, 2) !== '~$') { //stop if a temp word file
            var itemPath = path.join(projectPath, projectContents[i])
            //await fs.stat(itemPath) //fsStat would be used to determine metadata info about the given file, such as when it was last updated
            if (statSync(itemPath).isDirectory() === true) { //if a directory, then run this again, until you get to a document
                loopThroughFolder(itemPath)
            } else { //if it's a file, then see if a word doc. If so, perform magic. 
                //console.log('in a document')
                var extension = path.extname(itemPath)
                if (extension.includes('doc')) {
                    checkDatabase(itemPath, 'word')
                    // sendDocWordDoc(itemPath)
                } else {
                    checkDatabase(itemPath, 'notWord')
                    //sendDoc(itemPath)
                    // return 'done'
                }
            }
        }
    }
}

async function checkDatabase(filePath, wordOrNot) {
    var stats = statSync(filePath)
    var createTime = stats.birthtimeMs
    var dbEntry = await db.fileInfo.get({ fileId: createTime })
    if (!dbEntry) {
        //not entered in database yet. should mean no discourse topic created yet. So create a new one
        setUpDocForCreate(filePath, createTime, wordOrNot)
    } else { //already a discourse topic
        var lastModifiedTime = stats.mtime //mtime is when file last modified. ctime includes that time, but also includes if file properties change, like file permissions, name or location. Ctime would be better, but it also updates when the file is opened (even if no other change). So I am going with mtime--and if you want to update the version online, you need to be sure to save it.
        var lastSentTime = dbEntry.lastSentTime
        var topicId = dbEntry.topicId
        if (lastModifiedTime > lastSentTime) {
            console.log('time to update for  = ' + filePath)
            setUpDocForUpdate(filePath, createTime, wordOrNot, topicId)
        } else {
            console.log('dont update for ' + filePath)
        }
    }
}

function setUpDocForCreate(itemPath, createTime, wordOrNot) {
    console.log('setup doc for create, for: ' + itemPath)
    return 'done'
    if (wordOrNot === 'word') {
        mammoth.convertToHtml({ path: itemPath }).then(function (result) {
            var htmlWord = result.value
            createDiscoursePostFromFile(itemPath, createTime, htmlWord)
        })
    } else {
        readFile(itemPath, 'utf8', function (err, data) {
            if (err) {
                console.log('error in reading file in send doc = ' + err)
            } else {
                createDiscoursePostFromFile(itemPath, createTime, data)
            }
        })
    }
}

function setUpDocForUpdate(itemPath, createTime, wordOrNot, topicId) {
    console.log('setup doc for Update, for: ' + itemPath)
    return 'done'
    if (wordOrNot === 'word') {
        mammoth.convertToHtml({ path: itemPath }).then(function (result) {
            var htmlWord = result.value
            updateDiscoursePostFromFile(itemPath, createTime, htmlWord, topicId)
        })
    } else {
        readFile(itemPath, 'utf8', function (err, data) {
            if (err) {
                console.log('error in reading file in send doc = ' + err)
            } else {
                updateDiscoursePostFromFile(itemPath, createTime, data, topicId)
            }
        })
    }
}


function createDiscoursePostFromFile1(filePath, createTime, data) {
    //***NOTE: I have experimented with getting a user key, but have not updated z-environments yet. So it's possible those keys are no longer valid. And just go through the process of getting the key again using the discourse api test code. */ */
    var url1 = 'https://go.racetosaturn.com/posts.json'
    var url = 'http://localhost:4200/posts.json'
    var title = path.basename(filePath)
    var topicContent = data
    var topicShowPath = filePath.substring(filePath.indexOf(projectFolderName) + (projectFolderName.length + 1)) /*
    example:
    project name (projectFolderName) = 'rocking-research'
    doc path = rocking-research/post-enlightenment/platos-influences.docx
    topicShowPath = 'post-enlightenment/platos-influences.docx' ; and that will be the title of the post.
   */
    var userName = 'SeanRtS' //***Have to get this programmatically*****/
    var tagName = userName + '-project-' + projectFolderName
    axios({
        method: 'post',
        url: url,
        contentType: 'multipart/form-data',
        data: {
            "title": topicShowPath,
            "raw": topicContent,
            //"project_main": "wow-main-project",
            "project_comments": 'wow-main-project',
            //"topic_id": 0,
            "category": 11,
            //   "tags": [tagName],
            /*VERIFIED THAT THIS WORKS: "project_name": 'test-project-name'*/
            //  "target_recipients": "blake,sam",
            //"target_usernames": "string",
            //"archetype": "private_message",
            //"created_at": "string"
        },
        headers: {
            //"User-Api-Key": environmentVariables.decodedUserKey,
            //"Api-Username": 'SeanRtS'
            // for local testing: make sure to add localHost as url, and remove category and tags
            "Api-Key": environmentVariables.wsKey,
            "Api-Username": environmentVariables.wsName
        },
        dataType: 'json'
    }).then(response => {
        console.log('created new post for = ' + filePath)
        console.log('heres the response = ')
        console.log(response)
        var topicId = response.data.id
        var timeNow1 = new Date();
        var timeNow = timeNow1.getTime()
        db.fileInfo.add({
            fileId: createTime,
            fileName: title,
            filePath: filePath,
            topicId: topicId,
            lastSentTime: timeNow,
            projectTagName: tagName
            //project?
        })
    }).catch(error => {
        console.log('error in api post test =')
        console.log(error)
    })
}

//my-new-micro-word
//new-text-doc
//amazing stuff email
//z-version notes
//simple-text
//social-interactions notes
//word-test-doc
//


function createDiscoursePostFromFile(filePath, createTime, data) { //THIS IS THE FUNCTION TO create discourse post on main app through electron. sometimes I add 1 when I want to use the alternative function to create on local site.
    //***NOTE: I have experimented with getting a user key, but have not updated z-environments yet. So it's possible those keys are no longer valid. And just go through the process of getting the key again using the discourse api test code. */ */
    var url = 'https://go.racetosaturn.com/posts.json'
    //var url1 = 'http://localhost:4200/posts.json'
    var title = path.basename(filePath)
    var topicContent = data
    var topicShowPath = filePath.substring(filePath.indexOf(projectFolderName) + (projectFolderName.length + 1)) /*
    example:
    project name (projectFolderName) = 'rocking-research'
    doc path = rocking-research/post-enlightenment/platos-influences.docx
    topicShowPath = 'post-enlightenment/platos-influences.docx' ; and that will be the title of the post.
   */
    var userName = 'seanrts' //***Have to get this programmatically*****/
    var projectName = userName + '-project-' + projectFolderName
    axios({
        method: 'post',
        url: url,
        contentType: 'multipart/form-data',
        data: {
            "title": topicShowPath,
            "raw": topicContent,
            //"topic_id": 0,
            "category": 37,
            "project_main": projectName,
            /*VERIFIED THAT THIS WORKS: "project_name": 'test-project-name'*/
            //  "target_recipients": "blake,sam",
            //"target_usernames": "string",
            //"archetype": "private_message",
            //"created_at": "string"
        },
        headers: {
            "User-Api-Key": environmentVariables.decodedUserKey,
            //"Api-Username": 'SeanRtS'
            /* for local testing: make sure to add localHost as url, and remove category and tags
            "Api-Key": environmentVariables.wsKey,
            "Api-Username": 'ADD IN'
            */
        },
        dataType: 'json'
    }).then(response => {
        console.log('created new post for = ' + filePath)
        console.log('heres the response = ')
        console.log(response)
        var topicId = response.data.id
        var timeNow1 = new Date();
        var timeNow = timeNow1.getTime()
        db.fileInfo.add({
            fileId: createTime,
            fileName: title,
            filePath: filePath,
            topicId: topicId,
            lastSentTime: timeNow,
            projectTagName: projectName
            //project?
        })
    }).catch(error => {
        console.log('error in api post test =')
        console.log(error)
    })
}
//wsKey
function updateDiscoursePostFromFile(filePath, createTime, data, topicId) {
    var url = 'https://go.racetosaturn.com/posts/' + topicId + '.json'
    var title = path.basename(filePath)
    var topicContent = data
    var topicShowPath = filePath.substring(filePath.indexOf(projectFolderName) + (projectFolderName.length + 1))
    var userName = 'SeanRtS' //***Have to get this programmatically*****/
    var tagName = userName + '-project-' + projectFolderName
    axios({
        method: 'put',
        url: url,
        contentType: 'multipart/form-data',
        data: {
            "title": topicShowPath,
            "raw": topicContent,
            "tags": [tagName]
        },
        headers: {
            "User-Api-Key": environmentVariables.decodedUserKey,
            //"Api-Username": 'SeanRtS'
        },
        dataType: 'json'
    }).then(response => {
        console.log('discourse post updated for = ' + topicShowPath)
        var timeNow1 = new Date();
        var timeNow = timeNow1.getTime()
        db.transaction("rw", db.fileInfo, async () => {
            db.fileInfo.where("fileId").equals(createTime).modify({
                fileName: title, //most of the time will be the same. but would be updated if user changes the title
                filePath: filePath, //most of the time will be the same. but would be updated if user changes the path
                lastSentTime: timeNow
            })
            const viewEntry = await db.fileInfo.where({ fileId: createTime }).toArray()
        }).catch(Dexie.ModifyError, error => {
            // ModifyError did occur
            console.error(error.failures.length + " items failed to modify");

        }).catch(error => {
            console.error("Generic error: " + error);
        })
    }).catch(error => {
        console.log('error in update discourse post from file =')
        console.log(error)
    })
}


/*****Create discourse post  */
function createDiscoursePost() {
    console.log('now in create Post')
    var url = 'https://go.racetosaturn.com/posts.json'
    var key = token
    var userName = discourseUser
    var topicContent = `
        Here is a post using the generated api user key. check it out.
    `
    axios({
        method: 'post',
        url: url,
        contentType: 'multipart/form-data',
        data: {
            "title": "Great Word Doc 3",
            "raw": topicContent,
            //"topic_id": 0,
            "category": 36,
            //  "target_recipients": "blake,sam",
            //"target_usernames": "string",
            //"archetype": "private_message",
            //"created_at": "string"
        },
        headers: {
            "User-Api-Key": environmentVariables.decodedUserKey,
            //"Api-Username": 'SeanRtS'
        },
        dataType: 'json'
    }).then(response => {
        console.log('post response = ')
        console.log(response)
    }).catch(error => {
        console.log('error in create post =')
        console.log(error)
    })
}

function getDiscoursetopicId() {
    console.log('now in get topicId ')
    var topicId = '421' //looking for post id = 586
    var url = 'https://go.racetosaturn.com/t/' + topicId + '.json'
    var key = token
    var userName = discourseUser
    axios({
        method: 'get',
        url: url,
        //contentType: 'multipart/form-data',
        headers: {
            "Api-Key": key,
            "Api-Username": userName
        },
        dataType: 'application/json'
    }).then(response => {
        console.log('initial response = ' + JSON.stringify(response))
        var topicId = response.data.post_stream.posts[0].id
        console.log('post response = ' + topicId)
        updatePost(topicId, userName, key)
    }).catch(error => {
        console.log('error in get post Id =')
        console.log(error)
    })
}

function updatePost(topicId, userName, key) {
    console.log('now in update Post')
    var url = 'https://go.racetosaturn.com/posts/' + topicId + '.json'
    var topicContent = 'Update content as of 1:151 from GroupInfoUser. How does it look?'
    axios({
        method: 'put',
        url: url,
        contentType: 'multipart/form-data',
        data: {
            //  "title": "Great Word Doc 2",
            "raw": topicContent,
            //"topic_id": 0,
            //"category": 36,
            //  "target_recipients": "blake,sam",
            //"target_usernames": "string",
            //"archetype": "private_message",
            //"created_at": "string"
        },
        headers: {
            "Api-Key": key,
            "Api-Username": userName
        },
        dataType: 'json'
    }).then(response => {
        console.log('post response = ')
        console.log(response)
    }).catch(error => {
        console.log('error in update post =')
        console.log(error)
    })
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

var privateKey1
var publicKey
function discourseAPITest1() {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
    })
    console.log('api test1')
    console.log('private key = ' + privateKey)
    const http = require('url')
    var myUrl = 'https://go.racetosaturn.com/user-api-key/new'

    //var redirectUrl = 'goprotocol:example' /***the below code with this url works to get a key for the app and go to discourse, but discourse produces an error when it tries to go to the redirect url. the custom protocol is not working yet. */
    var redirectUrl = 'saturnproto://redirect'

    // code for getting user key. Commented out to not run again until ready

    const url = new URL(`https://go.racetosaturn.com/user-api-key/new`)

    url.searchParams.append('application_name', 'Saturn-App')
    url.searchParams.append('client_id', hostname())
    url.searchParams.append('scopes', 'write')
    url.searchParams.append('public_key', publicKey)
    //url.searchParams.append('auth_redirect', redirectUrl) /***LEAVE OUT IF YOU WANT THE SITE TO GIVE YOU THE KEY DIRECTLY */
    url.searchParams.append('nonce', '1')
    console.log(`redirect URL is ${url.href}`)
    shell.openExternal(url.href)


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

ipcRenderer.on('discourse-payload-url', (event, payload) => {
    decodeTheKey(payload)
})

function decodeTheKey(payload) {
    console.log('decode the key now')
    var privateKey2 = privateKey1.trim() //environmentVariables.privateKeyForDecoding.trim()
    //  var encodedKey = environmentVariables.encodedUserKey
    console.log('private key2 = ' + privateKey2)
    const trimmedKey = payload.trim().replace(/\s/g, '')
    console.log(`trimmed encoded key is:*******= ${trimmedKey}`)
    const decriptedKey = privateDecrypt(
        {
            key: privateKey2,
            padding: constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(trimmedKey, 'base64')
    )
    const jsonKey = decriptedKey.toString('ascii')
    console.log('the decoded key = ')
    console.log(jsonKey)
}


function decryptAttempt1() {
    var privateKey = environmentVariables.privateKeyForDecoding.trim()
    var encodedKey = environmentVariables.encodedUserKey.trim()
    const buffer = Buffer.from(encodedKey, "base64");
    const decrypted = privateDecrypt({
        key: privateKey, padding:
            constants.RSA_PKCS1_PADDING
    }, buffer);
    console.log(decrypted.toString("utf8"))
}

function decryptAttempt() {
    var forge = require('node-forge')
    var pki = require('node-forge').pki;
    var privateKey1 = environmentVariables.privateKeyForDecoding1.trim()
    var encodedKey = environmentVariables.encodedUserKey1.trim()
    // var private_key = pki.privateKeyFromPem(privateKey);
    try {
        var privateKey = forge.pki.privateKeyFromPem(privateKey1);
        var ctBytes = forge.util.decode64(encodedKey);

        var plaintextBytes = privateKey.decrypt(ctBytes);
        // rsaMessage.val(plaintextBytes.toString('utf8')); <-- old
        console.log('key result = ' + forge.util.decodeUtf8(plaintextBytes));
    }
    catch (e) {
        console.log(e);
        alert("cannot decrypt");
    }
    console.log('result = ')
    //console.log(result)
}
//https://stackoverflow.com/questions/47306186/node-decrypt-content-with-private-key-and-padding