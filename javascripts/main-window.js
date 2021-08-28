const { ipcRenderer, ipcMain, clipboard, shell, remote } = require('electron')
const { Menu, MenuItem } = remote
const { writeFile, fstat } = require('fs')
const fs = require("fs")
var path = require('path')
const simpleGit = require('simple-git')
const git = simpleGit()
var TurndownService = require('turndown')
var turndownService = new TurndownService()
var mammoth = require("mammoth");
const trash = require('trash');

const homeDir = require('os').homedir();
const desktopDir = `${homeDir}/Desktop`;
var appFolder = desktopDir + '/app-versions'
const runJxa = require('run-jxa')
const environmentVariables = require('../z-environments-1.js')
var token = environmentVariables.discourseToken
var discourseUser = environmentVariables.discourseUser

var projectFolderPath
var projectFolderName
var fileName

let spawn = require("child_process").spawn
var cp = require("child_process");
const { promisify } = require('util')
const { resolve } = require('path')
const { O_DIRECTORY } = require('constants')

var diff2html = require("diff2html").Diff2Html
const { default: axios } = require('axios')

// Including generateKeyPairSync from crypto module. This is for generating an api key for authenticating with discourse
const { generateKeyPairSync, privateDecrypt, constants } = require('crypto');

const { hostname } = require('os')

//dexie database for linking project files to discourse posts
const Dexie = require('dexie')
var db = new Dexie("FileDatabase")


//Dexie.debug = false //set to false for production. During development, gives more thorough error logs
/*****Button Set Up *****/
window.onload = async function () {
    try {
        try {
            await db.version(3).stores({
                fileInfo: "++id,fileId, fileName, lastSentTime, filePath,postId, projectTagName"
            })
        } catch (error) {
            console.log('error = ' + error)
        }

        /*
        catch(function (error) {
            alert('Uh oh : ' + error);
        });
        */
        //will send file to discourse, linking with postId. how will it link with project? When send to site, project will probably be named after main-folder-name/subfolder. Can get this from the filepath. And then add the tag with this name and a hash to the post, so it will be tagged that way on discourse.
        //start out this way. Issues in future: if change path name, will that change project? maybe it's ok for it to work that way?


        /****** REMOVE ANY WORK TREES CREATED BY THE APP*********** */
        if (localStorage.getItem('working-trees-present')) {
            let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
            if (treeArray.length > 0) {
                treeArray.forEach((treePath) => {
                    if (treePath.length) {
                        removeSavedWorkTree(treePath)
                    }
                })
            }
        }

        document.getElementById('viewPriorVersionsSelect').addEventListener('click', () => {
            viewPriorVersionsFunction()
        })

        document.getElementById('compareChangesSelect').addEventListener('click', () => {
            showCompareChangesFunction()
        })

        //get last project folder info
        if (localStorage.getItem('lastProjectFolder')) {
            let folderArray = JSON.parse(localStorage.getItem('lastProjectFolder'))
            if (folderArray) {
                projectFolderPath = folderArray[0]
                projectFolderName = folderArray[1]
                document.getElementById('projectDirectory').textContent = projectFolderName
                var divId = "projectDirectory"
                showFolderContents(divId, projectFolderPath, 0)
            }
        }

        //change project folder button
        var changeFolderButton = document.getElementById('changeFolder')
        changeFolderButton.addEventListener('click', () => {
            changeFolder()
            //openDocFunction()
            //openDocSpawn()
            // wordExps()
        })

        //click save button

        document.getElementById('saveButton').addEventListener('click', () => {
            saveGitVersion()
        })

        //set right click menu 
        menuFunction()

        checkIfDescriptionExists()

        tabFunction()
    } catch (e) {
        console.log('error in onload function')
    }
}   //end window onload


function tabFunction() {
    try {
        document.getElementById('noteForSave').addEventListener('keydown', (event) => {
            if (event.which == 9) {
                console.log('tab hit')
                saveGitVersion()

            }
        })
    } catch (e) {
        console.log('error in tab function')
    }
}

/******HIDE WINDOW, AND SHOW BASIC WINDOW**** */

function hideWindow() {
    ipcRenderer.send('hide-main-window', '')
}

/**SHOW PROJECT DESCRIPTION************** */
async function checkIfDescriptionExists() {
    try {
        var descFilePath = projectFolderPath + '/project-description.md'
        fs.stat(descFilePath, function (err, stat) {
            if (err == null) {
                //file exists
                document.getElementById('addDescriptionButton').style.display = 'none'
            } else if (err.code === 'ENOENT') {
                document.getElementById('addDescriptionButton').style.display = 'inline-block'
            } else {
                console.log('Some other error: ', err.code);
            }
        });
    }
    catch (e) {
        console.log('error in checking for description = ' + e)
    }
}

async function addDescription() {
    try {
        /*Make a file of project-description:*/
        var descFilePath = projectFolderPath + '/project-description.md'
        fs.stat(descFilePath, function (err, stat) { //just a doublecheck in case file already exists. In most instances, this will already be done through checkIfDescriptionExists function
            if (err == null) {
                //file exists
                document.getElementById('addDescriptionButton').style.display = 'none'
            } else if (err.code === 'ENOENT') {
                // file does not exist
                fs.writeFile(descFilePath, '', (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        //file created
                        var indent = 0
                        var newIndent = parseInt(indent) + 15
                        var newId = "**is-document**^^^" + descFilePath + "^^^" + indent
                        var newId = "**is-document**^^^" + descFilePath + "^^^" + indent
                        contents = `<div>
                                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${descFilePath}", "${newIndent}")'>` + 'project-description.md' + `</div>
                                </div>`
                        var contentsDiv = document.getElementById('folderContents')
                        contentsDiv.insertAdjacentHTML("afterbegin", contents)
                        openDoc(descFilePath)
                        var highlightedDivs = document.getElementsByClassName('highlightFolderOrFile')
                        while (highlightedDivs.length)
                            highlightedDivs[0].classList.remove('highlightFolderOrFile')
                        document.getElementById(newId).classList.add('highlightFolderOrFile')
                        document.getElementById('addDescriptionButton').style.display = 'none'
                    }
                })
            } else {
                console.log('Some other error in adding description function = ', err.code);
            }
        });
    }
    catch (e) {
        console.log('error in adding description function = ' + e)
    }
}

/************** Testing Discourse API *******************************/

//current-code
async function loopThroughFolder(thePath) {
    var currentTime = new Date()
    console.log('current time = ' + currentTime.getTime())
    if (thePath === 'start') {
        var projectPath = projectFolderPath //overall project path
    } else {
        var projectPath = thePath
    }

    var projectContents1 = await fs.readdirSync(projectPath) //produces array of all top-level contents of a folder
    var projectContents = projectContents1.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item)); //excludes hidden files like .ds-store and .git files 
    for (var i = 0; i < projectContents.length; i++) {
        if (projectContents[i].substring(0, 2) !== '~$') { //stop if a temp word file
            var itemPath = path.join(projectPath, projectContents[i])
            //await fs.stat(itemPath) //fsStat would be used to determine metadata info about the given file, such as when it was last updated
            if (fs.statSync(itemPath).isDirectory() === true) { //if a directory, then run this again, until you get to a document
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
    var stats = fs.statSync(filePath)
    var createTime = stats.birthtimeMs
    var dbEntry = await db.fileInfo.get({ fileId: createTime })
    if (!dbEntry) {
        //not entered in database yet. should mean no discourse topic created yet. So create a new one
        setUpDocForCreate(filePath, createTime, wordOrNot)
    } else { //already a discourse topic
        var lastModifiedTime = stats.mtime //mtime is when file last modified. ctime includes that time, but also includes if file properties change, like file permissions, name or location. Ctime would be better, but it also updates when the file is opened (even if no other change). So I am going with mtime--and if you want to update the version online, you need to be sure to save it.
        var lastSentTime = dbEntry.lastSentTime
        var postId = dbEntry.postId
        if (lastModifiedTime > lastSentTime) {
            console.log('time to update for  = ' + filePath)
            setUpDocForUpdate(filePath, createTime, wordOrNot, postId)
        } else {
            console.log('dont update for ' + filePath)
        }
    }
}

function setUpDocForCreate(itemPath, createTime, wordOrNot) {
    if (wordOrNot === 'word') {
        mammoth.convertToHtml({ path: itemPath }).then(function (result) {
            var htmlWord = result.value
            createDiscoursePostFromFile(itemPath, createTime, htmlWord)
        })
    } else {
        fs.readFile(itemPath, 'utf8', function (err, data) {
            if (err) {
                console.log('error in reading file in send doc = ' + err)
            } else {
                createDiscoursePostFromFile(itemPath, createTime, data)
            }
        })
    }
}

function setUpDocForUpdate(itemPath, createTime, wordOrNot, postId) {
    if (wordOrNot === 'word') {
        mammoth.convertToHtml({ path: itemPath }).then(function (result) {
            var htmlWord = result.value
            updateDiscoursePostFromFile(itemPath, createTime, htmlWord, postId)
        })
    } else {
        fs.readFile(itemPath, 'utf8', function (err, data) {
            if (err) {
                console.log('error in reading file in send doc = ' + err)
            } else {
                updateDiscoursePostFromFile(itemPath, createTime, data, postId)
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
        var postId = response.data.id
        var timeNow1 = new Date();
        var timeNow = timeNow1.getTime()
        db.fileInfo.add({
            fileId: createTime,
            fileName: title,
            filePath: filePath,
            postId: postId,
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
        var postId = response.data.id
        var timeNow1 = new Date();
        var timeNow = timeNow1.getTime()
        db.fileInfo.add({
            fileId: createTime,
            fileName: title,
            filePath: filePath,
            postId: postId,
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
function updateDiscoursePostFromFile(filePath, createTime, data, postId) {
    var url = 'https://go.racetosaturn.com/posts/' + postId + '.json'
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

function getDiscoursePostId() {
    console.log('now in get postid ')
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
        var postId = response.data.post_stream.posts[0].id
        console.log('post response = ' + postId)
        updatePost(postId, userName, key)
    }).catch(error => {
        console.log('error in get post Id =')
        console.log(error)
    })
}

function updatePost(postId, userName, key) {
    console.log('now in update Post')
    var url = 'https://go.racetosaturn.com/posts/' + postId + '.json'
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

/*****close all windows with appletext ***********/

async function minimizeWindows() {
    try {
        const result = await runJxa(`
            const evalAS2 = s => {
                    const a = Application.currentApplication();
                    const sa = (a.includeStandardAdditions = true, a);
                    return sa.runScript(s);
            };
           evalAS2('tell application "System Events" to set visible of every application process to false')
          `)
        return result
        function openMain() {
            ipcRenderer.send('open-main-window', '') //doesn't get called bc window is minimized. right now, it closes all windows
        }

    } catch (error) {
        console.log('error in minimize windows' + error)
    }
}


/********CONTROLLING APPLE NOTES ************************* */

var appleNoteHtmlContent
async function addAppleNote(divId, mainPath, indent) {
    var newIndent = parseInt(indent) + 17
    console.log('get apple note file')
    try {
        getFrontNote().then((response) => {
            appleNoteHtmlContent = response.noteContent
            var noteId = response.noteId
            var element = document.getElementById(divId)
            contents = `<form action="#" id="addAppleNoteForm" style="margin-left: ${newIndent}px;" onsubmit='createAppleNoteFile("${divId}", "${mainPath}", "${indent}", "${noteId}")'>
                <input type="text" class="docOrDirectory"  id="appleNoteNameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                </form>
                `

            var newItems = element.nextElementSibling  //gets "newItems" div
            newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
            document.getElementById('appleNoteNameEntry').value = response.noteName + ' (apple-note).html'
        })
    } catch (error) {
        console.log('error in addAppleNote = ' + error)
    }
}
async function getFrontNote() { //get the text of the apple note in the foreground
    // (async () => {
    try {
        const result = await runJxa(`
        console.log('running')
            const evalAS2 = s => {
                    const a = Application.currentApplication();
                    const sa = (a.includeStandardAdditions = true, a);
                    return sa.runScript(s);
            };
            var noteName = evalAS2('tell application "Notes" to get the name of item 1 of (get selection)');
            var noteId = evalAS2('tell application "Notes" to get the id of item 1 of (get selection)');
            var noteContent = evalAS2('tell application "Notes" to get body of item 1 of (get selection)');
            return {'noteName': noteName, 'noteId': noteId, 'noteContent': noteContent}
            `)
        return result
    } catch (error) {
        console.log('error in trying to get note information ' + error)
    }
    //})();
}

async function createAppleNoteFile(divId, folderPath, indent, noteId) {
    //this checks if an apple note with that id already exists.
    /*
        when click "add apple note", it should automatically check if there is an existing matching note before it gives you the chance to rename. If there is an existing matching note, DON't show the spot to name the file. Just update the existing file with the name of the note on the system.
        If you then want to change the name, you can do so with the right click menu.
        will have to show a spinner while the activity is happening, and then a confirmation message once the note has been updated
        will also want to check that the async timing is working ok
    */
    var fileName = document.getElementById('appleNoteNameEntry').value
    document.getElementById('addAppleNoteForm').remove()
    var newDocPath = folderPath + '/' + fileName
    var folderArray = await fs.readdirSync(folderPath)
    var appleNoteFiles = []
    folderArray.forEach((item) => {
        if (item.includes('(apple-note)')) {
            console.log('There is an apple note: ' + item)
            appleNoteFiles.push(item)
        }
    })
    var matchingNotePath = 'n/a'

    appleNoteFiles.forEach((note) => {  //go through the apple notes to see if one of them has the same id. NOTE: Currently, this only works for the same directory. Will not update apple notes in a different directory, even if the same id
        var theNotePath = folderPath + '/' + note

        try {
            var data = fs.readFileSync(theNotePath, 'utf8')
            var dataInfo = data.substring(
                data.lastIndexOf('<span id="noteId81423">') + 23,
                data.lastIndexOf('</span>')
            )

            if (dataInfo === noteId) {
                matchingNotePath = theNotePath  //if match in ids, then set the matching note as the matchingNotePath
            }
        } catch (err) {
            console.log('error in reading apple note file = ' + err)
        }
    })

    if (matchingNotePath !== 'n/a') {
        try {
            fs.renameSync(matchingNotePath, newDocPath, () => {
                console.log('the matching note has been renamed to the new note.')
            })
        } catch (err) {
            console.log('error in renamig = ' + err)
        }
    }

    var updatedContent = appleNoteHtmlContent.replaceAll('<div><u><br></u></div>', '').replaceAll('<u><br></u>', '').replaceAll('<h1><br></h1>', '').replaceAll('<h2><br></h2>', '').replaceAll('<h3><br></h3>', '')
    var colorStyleInsert = `
<style>
body {
color: #353535;
padding-left: 10px;
padding-right: 10px
}
h1, h2, h3 {
margin-bottom: 1px;
margin-top: 1px
}
ul {
margin-top: 0px;
margin-bottom: 0px
}
</style>
    `

    var newIndent = parseInt(indent) + 15
    var element = document.getElementById(divId)
    var content = colorStyleInsert + '<div style="margin-bottom: 12px; display: none">id:<span id="noteId81423">' + noteId + '</span></div>' + updatedContent  //noteId span name is given the code 81423 to make it unlikely someone will print that exact string in their own notes
    fs.writeFile(newDocPath, content, function (err) {
        if (err) {
            console.log(err)
        } else {
            //var newItems = div.nextElementSibling
            // newItems.innerHTML = ''
            //   e.target.classList.remove('clicked') //removed so that it can run showFolderContents function
            if ((element.classList.contains('clicked')) || (divId === "projectDirectory")) {
                //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
                showNewFolderOrDoc(divId, folderPath, newDocPath, fileName, newIndent)
                console.log('here 1')
            } else {
                //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
                showFolderContents(divId, folderPath, newIndent)
                console.log('here 2')
            }
        }
    })
}

/******************FUNCTION TO REMOVE ANY WORK TREES CREATED BY THE APP******************************** */

async function removeSavedWorkTree(treePath) {
    try {
        await trash([treePath]).then((error) => {
            console.log('removed work tree = ' + treePath)
            if (error) {
                console.log(error)
            } else {
                let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                let index = treeArray.indexOf(treePath)
                if (index > -1) {
                    treeArray.splice(index, 1)
                    localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                    console.log('local storage now = ' + localStorage.getItem('working-trees-present'))
                }
            }
        })
    } catch (e) {
        console.log('error in removing work tree')
    }
}


/*****Open Doc***** */

async function openDoc(thePath) {
    try {
        let theExtension = path.extname(thePath)
        if (thePath.includes('(apple-note)')) { //if apple note. then open the apple note doc directly
            console.log('open apple doc')
            var theNoteId
            try {
                var data = fs.readFileSync(thePath, 'utf8')
                theNoteId = data.substring(
                    data.lastIndexOf('<span id="noteId81423">') + 23,
                    data.lastIndexOf('</span>')
                )
            } catch (err) {
                console.log('error in reading apple note file = ' + err)
            }

            try {
                await runJxa(`
            'use strict';

            // evalAS2 :: String -> IO a
            const evalAS2 = s => {
                const a = Application.currentApplication();
				const sa = (a.includeStandardAdditions = true, a);
				return sa.runScript(s);
            };

             return evalAS2('tell application "Notes" to show note id "${theNoteId}"')
            `)
            } catch (e) {//if there's an error in trying to open the apple note, can just go ahead and open the file through the app.
                console.log('error in opening note = ' + e)
                fs.readFile(thePath, 'utf8', function (err, data) {
                    if (err) {
                        console.log(err)
                    } else {
                        ipcRenderer.send('open-html-window', thePath, data)
                    }
                })
            }
            console.log('the note id = ' + theNoteId)

        } else if (theExtension.includes('html')) { //if not apple note but is an html file, open that file
            fs.readFile(thePath, 'utf8', function (err, data) {
                if (err) {
                    console.log(err)
                } else {
                    ipcRenderer.send('open-html-window', thePath, data)
                }
            })

        } else { //open the file directly
            shell.openPath(thePath)
        }
    } catch (e) {
        alert('Sorry, there was an error showing this doc.')
    }
}


/*
function openDocFunction() {

    shell.openPath(wordDoc, '', 'x=10, y=10').then((result) => {
        console.log(result)
    })

    //window.open(txtDoc, '_blank','top=300, left=600')
}


function openDocSpawn() {

    var exec = require('child_process').exec;
    var command = 'open ' + wordDoc
    exec(command, function (error, stdout, stderr) {  // 'dir' is for example
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
}
*/
/*************************************Select Project Folder to show folder contents*******************************/

function changeFolder() {
    ipcRenderer.send('open-folder-dialog', '')
}

ipcRenderer.on('selected-folder', (event, pathToFolder) => {
    document.getElementById('folderContents').innerHTML = ''
    projectFolderPath = pathToFolder.toString()
    let dataArray = projectFolderPath.split("/")
    projectFolderName = dataArray[dataArray.length - 1]
    document.getElementById('projectDirectory').textContent = projectFolderName
    var divId = "projectDirectory"
    showFolderContents(divId, projectFolderPath, 0)
    if (projectFolderPath.length > 0) { //should always be true, but adding a doublecheck
        console.log('set local storage')
        let array = [projectFolderPath, projectFolderName]
        localStorage.setItem('lastProjectFolder', JSON.stringify(array))
    }
    checkIfDescriptionExists()
})

/******Loop through contents of Selected Folder and display results************* */

async function showFolderContents(divId, mainPath, indent) {
    try {
        var element = document.getElementById(divId)
        var highlightedDivs = document.getElementsByClassName('highlightFolderOrFile')
        while (highlightedDivs.length)
            highlightedDivs[0].classList.remove('highlightFolderOrFile')
        if (element.id !== 'projectDirectory') {
            element.classList.add('highlightFolderOrFile')
        }
        var extension = path.extname(mainPath)
        var hasExtension = false
        if (extension) {
            hasExtension = true  //why this? Below, with stats.isDirectory(), you can check if something is a directory. However, this misses a few special types of "directories"--which are really complex files. For example logicX files. These files show up as directories with isDirectory(), but when you click on them, you normally want to open them, not view the contents. So this code pickes up these cases.
        }
        if ((divId === 'projectDirectory') || (!(element.classList.contains('clicked')))) {
            var stats = fs.statSync(mainPath)
            if ((stats.isDirectory() === true) && (hasExtension === false)) { //determine if a directory (instead of file). 
                //show folder contents
                var contentArray = []
                try {
                    contentArray = fs.readdirSync(mainPath)
                } catch (e) {
                    console.log(e)
                }
                var contents = ""
                var newIndent = parseInt(indent) + 15
                contentArray.forEach((item) => {
                    if ((item != '.DS_Store') && (item != ".git") && (!(item.includes('worktree3#&7#&1#&4')))) {
                        var fullPath = mainPath + '/' + item
                        var subStats = fs.statSync(fullPath)
                        var extension1 = path.extname(fullPath)
                        var hasExtension1 = false
                        if (extension1) {
                            hasExtension1 = true  //why this? Below, with stats.isDirectory(), you can check if something is a directory. However, this misses a few special types of "directories"--which are really complex files. For example logicX files. These files show up as directories with isDirectory(), but when you click on them, you normally want to open them, not view the contents. So this code pickes up these cases.
                        }
                        if ((subStats.isDirectory() === true) && (hasExtension1 === false)) {
                            var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
                            contents = `<div style='margin-left: ${indent}px'>
                        <div class='subFolder docOrDirectory' style="padding-left: 3px; padding-right: 3px" id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'> <img src="../clear-folder-fntawesome.svg" style="padding-right: 3px; height: 11pt; width: 9pt; vertical-align: text-top"></img>` + item + `</div>
                        <div class="newItems"></div>
                        </div>`
                        } else {
                            var newId = "**is-document**^^^" + fullPath + "^^^" + indent
                            contents = `<div >
                        <div class='subFolder docOrDirectory' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'>` + item + `</div>
                        </div>`
                        }
                    }
                    if (divId !== "projectDirectory") {
                        var newItems = element.nextElementSibling  //gets "newItems" div
                        newItems.insertAdjacentHTML("beforeEnd", contents)  //insert into newItems
                        element.classList.add('clicked') //add clicked class so don't run this again if click again
                    } else {
                        var contentsDiv = document.getElementById('folderContents')
                        if (item.indexOf('project-description') > -1) {
                            contentsDiv.insertAdjacentHTML("afterBegin", contents)
                        } else {
                            contentsDiv.insertAdjacentHTML("beforeEnd", contents)
                        }
                    }
                })
            } else {  //if not a directory
                openDoc(mainPath)
            }
        } else { //if not projectstart and DO have clicked (so a folder that is already open)
            element.classList.remove('clicked')
            var newItems = element.nextElementSibling
            newItems.innerHTML = '' //remove items in newItems
        }
    } catch (e) {
        console.log('error in showing folder contents')
        alert('Sorry, there was an error in showing these contents. Please try again.')
    }
}
//<img src="../clear-folder-fntawesome.svg" style="height: 11pt; width: 9pt; vertical-align: unset"></img>

/*****************************************Menu Function***************************************************/

function menuFunction() {
    const contextMenu = new Menu();

    window.addEventListener('contextmenu', (e) => {
        try {

            if ((e.target.id) && (e.target.classList.contains('docOrDirectory'))) {
                var fullId = e.target.id
                contextMenu.clear() //remove prior menuItem
                e.preventDefault();

                if (fullId.includes('**is-directory**')) { //show this menu only if a directory
                    var idArray = fullId.split("^^^")
                    var thePath = idArray[1]
                    var indent = idArray[2]
                } else if (fullId === "projectDirectory") {
                    var thePath = projectFolderPath
                    var indent = -15
                }
                if ((fullId.includes('**is-directory**')) || (fullId === 'projectDirectory')) {
                    contextMenu.append(new MenuItem({
                        label: "New Folder",
                        click: () => {
                            // addFolder(e, thePath, indent)
                            var divId = fullId
                            enterNewFolder(divId, thePath, indent)
                        }
                    }))
                    contextMenu.append(new MenuItem({
                        label: "New File",
                        click: () => {
                            // addFolder(e, thePath, indent)
                            var divId = fullId
                            enterNewFile(divId, thePath, indent)
                        }
                    }))
                    contextMenu.append(new MenuItem({  //paste file = file where it automatically pastes in the content on the clipboard (so you can easily create a doc for, example, your email content--copy your email content and easily create a file in your project with that content)
                        label: "New Paste File",
                        click: () => {
                            // addFolder(e, thePath, indent)
                            var divId = fullId
                            enterNewPasteFile(divId, thePath, indent)
                        }
                    }))
                    contextMenu.append(new MenuItem({  //paste file = file where it automatically pastes in the content on the clipboard (so you can easily create a doc for, example, your email content--copy your email content and easily create a file in your project with that content)
                        label: "Add Apple Note File",
                        click: () => {
                            // addFolder(e, thePath, indent)
                            var divId = fullId
                            addAppleNote(divId, thePath, indent)
                        }
                    }))
                    contextMenu.append(new MenuItem({  //paste file = file where it automatically pastes in the content on the clipboard (so you can easily create a doc for, example, your email content--copy your email content and easily create a file in your project with that content)
                        label: "View Folder to Search",
                        click: () => {
                            viewFolder(e, thePath)
                        }
                    }))
                }

                if (fullId !== 'projectDirectory') {
                    contextMenu.append(new MenuItem({
                        label: "Move to Trash",
                        click: () => {
                            deleteItem(e)
                        }
                    }))
                    /**NOTE: Consider having this appear only for files that I can write, like md, txt, rtf, html, etc. */
                    contextMenu.append(new MenuItem({
                        label: "Update File with copied content",
                        click: () => {
                            updatePasteFile(e)
                        }
                    }))
                }

                contextMenu.popup(remote.getCurrentWindow());
            } //end if contains docOrDirectory
        } catch (e) {
            console.log('error in adding menu function')
        }
    }, false);
}

function viewFolder(e, thePath) {
    var theFolder = thePath
    shell.openPath(theFolder)
}


/*old code: onblur="newFolderNoFocus()"*/
/****INPUT TO ENTER NEW FOLDER AND FILE ********* */
/* Steps of creating new folder:
1. enterNewFolder function: adds entry box. When click return in the box, goes to addFolder function
2. add folder does mkdir code., then goes to
3. showNewFolderOrDoc or showFolderContents to show the new folder
*/

function enterNewFolder(divId, mainPath, indent) {
    var newIndent = parseInt(indent) + 17
    var element = document.getElementById(divId)
    contents = `<form action="#" id="addForm" style="margin-left: ${newIndent}px" onsubmit='addFolder("${divId}", "${mainPath}", "${indent}")'>
                <input type="text" class="docOrDirectory"  id="nameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                </form>
                `
    var newItems = element.nextElementSibling  //gets "newItems" div
    newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
    document.getElementById('nameEntry').focus()
}

function enterNewFile(divId, mainPath, indent) {
    var newIndent = parseInt(indent) + 17
    var element = document.getElementById(divId)
    contents = `<form action="#" id="addForm" style="margin-left: ${newIndent}px" onsubmit='createFile("${divId}", "${mainPath}", "${indent}")'>
                <input type="text" class="docOrDirectory"  id="nameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                </form>
                `
    var newItems = element.nextElementSibling  //gets "newItems" div
    newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
    document.getElementById('nameEntry').focus()
}

function enterNewPasteFile(divId, mainPath, indent) {
    var newIndent = parseInt(indent) + 17
    var element = document.getElementById(divId)
    contents = `<form action="#" id="addForm" style="margin-left: ${newIndent}px" onsubmit='createPasteFile("${divId}", "${mainPath}", "${indent}")'>
                <input type="text" class="docOrDirectory"  id="nameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                </form>
                `

    var newItems = element.nextElementSibling  //gets "newItems" div
    newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
    document.getElementById('nameEntry').focus()
}

function newFolderNoFocus() {
    if (document.getElementById('addForm')) {
        document.getElementById('addForm').remove()
    } else if (document.getElementById('addAppleNoteForm')) {
        document.getElementById('addAppleNoteForm').remove()
    }
}

/*************************CREATE A FOLDER ********************/
function addFolder(divId, path, indent) {
    try {
        var folderName = document.getElementById('nameEntry').value
        document.getElementById('addForm').remove()
        var newPath = path + '/' + folderName
        var newIndent = parseInt(indent) + 15
        var element = document.getElementById(divId)
        fs.mkdir(newPath, function (err) {
            if (err) {
                console.log(err)
            } else {
                //var newItems = div.nextElementSibling
                // newItems.innerHTML = ''
                //   e.target.classList.remove('clicked') //removed so that it can run showFolderContents function
                if ((element.classList.contains('clicked')) || (divId === "projectDirectory")) {
                    //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
                    showNewFolderOrDoc(divId, path, newPath, folderName, newIndent)
                } else {
                    //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
                    showFolderContents(divId, path, newIndent)
                }

            }
        })
    } catch (e) {
        alert('Sorry, there was an error in adding the folder. Please try again.')
    }
}

/****************** CREATE A FILE **************************/

function createFile(divId, path, indent) {
    try {
        var fileName = document.getElementById('nameEntry').value
        document.getElementById('addForm').remove()
        var newPath = path + '/' + fileName
        var newIndent = parseInt(indent) + 15
        var element = document.getElementById(divId)
        fs.writeFile(newPath, '', function (err) {
            if (err) {
                console.log(err)
            } else {
                //var newItems = div.nextElementSibling
                // newItems.innerHTML = ''
                //   e.target.classList.remove('clicked') //removed so that it can run showFolderContents function
                if ((element.classList.contains('clicked')) || (divId === "projectDirectory")) {
                    //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
                    showNewFolderOrDoc(divId, path, newPath, fileName, newIndent)
                } else {
                    //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
                    showFolderContents(divId, path, newIndent)
                }
            }
        })
    } catch (e) {
        console.log('Sorry, there was an error in creating the file. Please try again.')
    }
}

/*******************CREATE A PASTE FILE ****************************/
//hit create paste file button, and app creates file, pastes in clipboard, and, if no extension specified when you create it, adds "html" extension.
//the html extension means that when you open it, it will open in an app window, that will render the html 
//the expectation is that most times of using a paste file is getting content from the web--an email, a website, etc...
//so rendering the html will be the best representation of the data
function createPasteFile(divId, folderPath, indent) {
    try {
        var fileName = document.getElementById('nameEntry').value
        document.getElementById('addForm').remove()
        var newDocPath1 = folderPath + '/' + fileName
        var pathExtension = path.extname(newDocPath1)
        if (pathExtension.length) { //people can still specify an extension if they want
            var newDocPath = newDocPath1
            var updatedFileName = fileName
        } else { //if not, go with html
            var newDocPath = newDocPath1 + '.html'
            var updatedFileName = fileName + '.html'
        }

        var newIndent = parseInt(indent) + 15
        var element = document.getElementById(divId)
        var content = clipboard.readText()//clipboard.readHTML()
        fs.writeFile(newDocPath, content, function (err) {
            if (err) {
                console.log(err)
            } else {
                //var newItems = div.nextElementSibling
                // newItems.innerHTML = ''
                //   e.target.classList.remove('clicked') //removed so that it can run showFolderContents function
                if ((element.classList.contains('clicked')) || (divId === "projectDirectory")) {
                    //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
                    showNewFolderOrDoc(divId, folderPath, newDocPath, updatedFileName, newIndent)
                } else {
                    //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
                    showFolderContents(divId, folderPath, newIndent)
                }
            }
        })
    } catch (e) {
        console.log('Sorry, there was an error in creating the file. Please try again.')
    }
}

function updatePasteFile(e) {
    var content = clipboard.readText()
    var targetDiv = e.target
    var filePath = targetDiv.id.split('^^^')[1]  //id of docs has structure = ***is-directory***^^^/Users/[pathandname]^^^indentnumber
    /*Consider adding a dialog saying: confirm update file with [the first lines of text] to make sure this is on purpose.*/
    fs.writeFile(filePath, content, function (err) {
        if (err) {
            console.log(err)
            /**Can add dialog saying: Sorry, there was a problem updating this doc */
        } else {
            console.log('paste doc updated')
            /**Can add a dialog confirming this worked */
        }
    })


}


/**************** showNewFolder ANd new Doc *******************/

function showNewFolderOrDoc(divId, mainPath, newPath, folderName, indent) {
    //goal: insert new file alphabetically into view of the directory
    try {
        var contentArray = []
        try {
            contentArray = fs.readdirSync(mainPath) //note: this is plugging into the file system, where the new file already exists. So the new file is already in the content array
        } catch (e) {
            console.log(e)
        }
        let itemArray = []
        contentArray.forEach((item) => {
            if ((item != '.DS_Store') && (item != ".git") && (!(item.includes('worktree3#&7#&1#&4')))) { //code that shows the folder contents excludes these items. so want to exclude them here too to get the right index
                itemArray.push(item)
            }
        })

        var indexGo = itemArray.indexOf(folderName)
        var element = document.getElementById(divId)
        var contents = ""
        var newIndent = parseInt(indent) + 15
        var fullPath = newPath
        var statsHere = fs.statSync(fullPath)
        if (statsHere.isDirectory() === true) {
            var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
            contents = `<div>
                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'><img src="../clear-folder-fntawesome.svg" style="padding-right: 3px; height: 11pt; width: 9pt; vertical-align: text-top"></img>` + folderName + `</div>
                <div class="newItems"></div>
                </div>`
        } else {
            var newId = "**is-document**^^^" + fullPath + "^^^" + indent
            contents = `<div>
                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'>` + folderName + `</div>
                </div>`
        }

        if (divId === 'projectDirectory') { //its the project folder
            var contentsDiv = document.getElementById('folderContents')
        } else {
            var contentsDiv = element.nextElementSibling //not the project directory (so a subfolder). So structure is parent, then sibling where contents are

        }
        if (indexGo === 0) {
            contentsDiv.insertAdjacentHTML("afterbegin", contents)
        } else {
            var divBefore = contentsDiv.children[indexGo]
            if (divBefore) {
                divBefore.insertAdjacentHTML("beforebegin", contents)
            } else {
                contentsDiv.insertAdjacentHTML("afterbegin", contents)
            }
        }

        var highlightedDivs = document.getElementsByClassName('highlightFolderOrFile')
        while (highlightedDivs.length)
            highlightedDivs[0].classList.remove('highlightFolderOrFile')
        document.getElementById(newId).classList.add('highlightFolderOrFile')
    } catch (e) {
        console.log('error in adding new folder or doc to view')
    }
}


/*******************DELETE A FOLDER****************************/

async function deleteItem(e) {
    try {
        var fullId = e.target.id
        var item = document.getElementById(fullId)
        var idArray = fullId.split("^^^")
        var thePath = idArray[1]
        await trash([thePath]).then(() => {
            if (fullId.includes('is-directory')) {
                var newItems = item.nextElementSibling
                if (newItems) {
                    newItems.innerHTML = '' //remove items in newItems
                }
                item.remove()
            }
            item.remove()
            if (thePath.indexOf('project-description') > -1) {
                checkIfDescriptionExists()
            }

        });
    } catch (e) {
        console.log('error in delete item = ' + e)
        alert('Sorry, there was an error in deleting this item. Please try again.')
    }

}


/*************************************VIEW PRIOR VERSIONS *****************************************/

async function viewPriorVersionsFunction() {
    document.getElementById('showPriorCommits').innerHTML = ''
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.log().then(result => {
            var resultArray = result.all
            var totalNumber = resultArray.length
            var commitDiv = document.getElementById('showPriorCommits')
            var savedVersionsHeader = document.getElementById('savedVersionsOverview')
            savedVersionsHeader.style.display = "block"
            resultArray.forEach((commit) => {
                var versionNumber = totalNumber--
                var versionMessage = commit.message
                var dateTime = commit.date
                var commitNumber = commit.hash

                var dateObject = new Date(dateTime)
                var showDate = dateObject.toLocaleDateString('en-us', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
                var showTime = dateObject.toLocaleTimeString('en-us', {
                    timeStyle: 'short'
                })
                var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
                contents = `
                <div class="versionOverviewClass" onclick='showOldVersion("${commitNumber}", "${versionNumber}", "${showDate}", "${cleanedTime}", "${versionMessage}")'>
                    <div class="versionMessage">${versionMessage}</div>
                    <span class="versionNumber">Version ${versionNumber}</span>
                    <span class="versionDateTime">${showDate}</span><span> ${cleanedTime}</span>
                </div>   
                `
                commitDiv.insertAdjacentHTML("beforeEnd", contents)
            })
        })
        document.getElementById('showPriorVersions').style.display = 'block'
        document.getElementById('saveProjectVersion').style.display = 'none'
        document.getElementById('folderContents').style.display = "none"
        document.getElementById('closePriorVersionsView').addEventListener('click', () => {
            document.getElementById('showPriorVersions').style.display = 'none'
            document.getElementById('folderContents').style.display = "block"
            document.getElementById('showPriorCommits').innerHTML = ''
            document.getElementById('optionsAtBottom').style.display = 'block'
            document.getElementById('saveProjectVersion').style.display = 'block'
        })
        document.getElementById('optionsAtBottom').style.display = 'none'
    }
    catch (e) {
        console.log('error in view prior versions = ' + e)
        if (e.toString().indexOf('not a git repository') > -1) {
            alert('To view Prior Versions, please first save a project version.')
        } else {
            alert('Sorry, there was an error in viewing prior versions. Please try again.')
        }
    }
}
var treeName = 'n/a'
async function showOldVersion(commitNumber, versionNumber, date, time, notes) {
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        //prior to creating a new worktree, delete any worktree that's there
        var folderArray = await fs.readdirSync(projectFolderPath)
        /* remove any existing worktree in the project, prior to creating a new one. 
        Note: this means you can't view two different old versions at once. I think that is ok for now.
        */
        folderArray.forEach((item) => {
            if (item.includes('worktree3#&7#&1#&4')) { //if a folder exists that matches the worktree naming convention
                removeWorkTree(item)
            }
        })

        //done removing any existing worktree

        //now move on
        //create worktree, with different name then before
        var randomNumber = Math.floor(Math.random() * 10000)
        var randomMultiple = Math.floor(Math.random() * 500)
        var theNumber = randomNumber * randomMultiple
        treeName = theNumber.toString() + 'worktree3#&7#&1#&4'
        await git.raw('worktree', 'add', treeName).then(result => {
            if (result) {
                console.log(result)
                if (localStorage.getItem('working-trees-present')) {  //local storage array is to keep track of worktrees created, so as to delete them in the case the app is not shut down properly (they would be deleted on startup)
                    let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                    treeArray.push(projectFolderPath + '/' + treeName)
                    localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                    console.log('trees exist')
                } else {
                    let treeArray = []
                    treeArray.push(projectFolderPath + '/' + treeName)
                    localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                    console.log('trees didnt exist yet')
                }
            } else {
                console.log('error = ')
            }
        })
        //now should have a folder in the directory that is a copy of the directory, with its own git file.
        revertWorkTree(commitNumber, versionNumber, treeName, date, time, notes)
    } catch (e) {
        console.log('error in showOldVersion = ' + e)
        alert('Sorry, there was an error in viewing prior versions. Please try again.')
    }
}

/*****REMOVE WORKTREE CREATED IN THE PRIOR VERSION WINDOW WHEN CLOSE THE WINDOW***** */
ipcRenderer.on('close-worktree', (event, arg) => {
    removeWorkTree(arg)
})


async function removeWorkTree(treePath) {
    var thisTreeName = path.basename(treePath)
    console.log('inremove tree. name = ' + thisTreeName)
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })
        if (thisTreeName) {
            /*"--force" is included because its necessary if you are deleting a worktree with modified files.In this case, that is required: 1. user could change files(accidentally), 2. by adding a notation like "old" to the front of files you are modifying the folder.*/
            await git.raw('worktree', 'remove', thisTreeName, '--force').then((result) => {
                if (localStorage.getItem('working-trees-present')) {  //local storage array is to keep track of worktrees created, so as to delete them in the case the app is not shut down properly (they would be deleted on startup)
                    let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                    let theTreePath = projectFolderPath + '/' + thisTreeName
                    let index = treeArray.indexOf(theTreePath)
                    if (index > -1) {
                        treeArray.splice(index, 1)
                        localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                        console.log('local storage now = ' + localStorage.getItem('working-trees-present'))
                    }
                }
            }) //delete that folder
            await git.raw('worktree', 'prune').then((result) => { //removes info about worktrees which no longer exist
            })
        }
    } catch (e) {
        console.log('error in removework = ' + e)
    }
}

async function revertWorkTree(commitNumber, versionNumber, treeName, date, time, notes) {
    var theArray = []
    var treePath = projectFolderPath + '/' + treeName
    theArray.push(treePath)
    theArray.push(projectFolderName)
    theArray.push(versionNumber)
    theArray.push(date)
    theArray.push(time)
    theArray.push(notes)
    var infoToSend = JSON.stringify(theArray)
    try {
        await git.cwd(treePath).then(result => {
        })

        await git.checkout(commitNumber).then(result => {
            console.log('checkout result = ' + result)
            ipcRenderer.send('open-old-version-window', infoToSend)
        })


    } catch (e) {
        console.log('error in revert function = ' + e)
    }

}


/******************************************* COMPARE CHANGES *************************************************/

async function showCompareChangesFunction() {
    document.getElementById('showPriorCommitsForCompare').innerHTML = ''
    /****Refresh display of the versions that will be compared******************* */
    var versionSummaryNewer = `
      <span>Newer Version: </span>
                    <span id="laterVersionOverview">
                        <span class="selectedForChangesClass" id="laterVersionForChanges"></span>
                        <span class="versionNumberOverview">
                            <span class="versionWordLater"></span>
                            <span id="versionNumberLater">Current Changes</span>
                        </span>
                        <div id="versionMessageLater" style="display:none">n/a</div>
                        <span id="versionDateLater" style="display:none">n/a</span><span id="versionTimeLater"
                            style="display:none">n/a</span>
                        <span id="commitNumberLater" style="display: none">current-changes</span>
                    </span>
                    </span>
    `
    var versionSummaryOlder = `
                    <span>Older Version: </span>
                    <span id="earlierVersionOverview">
                    </span>
    `
    document.getElementById('displayNewerVersion').innerHTML = ''
    document.getElementById('displayNewerVersion').insertAdjacentHTML('afterbegin', versionSummaryNewer)
    document.getElementById('displayOlderVersion').innerHTML = ''
    document.getElementById('displayOlderVersion').insertAdjacentHTML('afterbegin', versionSummaryOlder)
    /*********Get the prior versions******** */
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd results' + JSON.stringify(result))
        })

        await git.log().then(result => {
            var resultArray = result.all
            var totalNumber = resultArray.length
            var commitForCompareDiv = document.getElementById('showPriorCommitsForCompare')
            var savedVersionsHeader = document.getElementById('savedVersionsOverview')
            savedVersionsHeader.style.display = "block"
            /**Load Current Change info into the prior versions list */
            var currentChangesContent = `
            <div class="versionOverviewClass selectedChangeClass" id="selectedChangeId1"
            onclick="selectVersionToViewChanges(event, 'current', 'Current Changes', 'current', 'n/a', 'n/a')">
                 <div class="versionMessage" id="currentChanges">Current locally saved changes</div>
                <span class="versionNumber" style="display:none">Current Changes</span>
                <span class="versionDateTime versionDate" style="display:none">n/a</span><span class="versionTime" style="display:none">n/a</span>
                <span class="commitNumber" style="display: none">current-changes</span>
            </div>
            `
            commitForCompareDiv.insertAdjacentHTML('beforeend', currentChangesContent)

            /***PRIOR VERSIONS LIST: Load all prior versions into the prior versions list** */
            for (var i = 0; i < resultArray.length; i++) {
                var commit = resultArray[i]
                var versionNumber = totalNumber--
                var versionMessage = commit.message
                var dateTime = commit.date
                var commitNumber = commit.hash

                var dateObject = new Date(dateTime)
                var showDate = dateObject.toLocaleDateString('en-us', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
                var showTime = dateObject.toLocaleTimeString('en-us', {
                    timeStyle: 'short'
                })
                var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
                /***CLEAN UP HERE: Do not need (probably) to have the params other than even in the selectversiontoviewchanges function */
                contents = `
                <div class="versionOverviewClass" onclick='selectVersionToViewChanges(event, "${commitNumber}", "${versionNumber}", "${showDate}", "${cleanedTime}", "${versionMessage}")'>
                    <div class="versionMessage">${versionMessage}</div>
                    <span class="versionNumberWord">Version </span><span class="versionNumber">${versionNumber}</span>
                    <span class="versionDateTime versionDate">${showDate}</span><span class="versionTime"> ${cleanedTime}</span>
                    <span class="commitNumber" style="display:none">${commitNumber}</span>
                </div>   
                `
                commitForCompareDiv.insertAdjacentHTML("beforeend", contents)

                /**SUMMARY HEADER: Take the first prior version, and add it to the summary header as the earlier version. The current changes are already listed as the later version */
                if (i === 0) {
                    //this is the insert at the top summary header.
                    //NOTE: the current change selection is already hard-coded as the later change for comparison in the html
                    var headerInsert = `
                    <span class="selectedForChangesClass" id="earlierVersionForChanges">
                        <span class="versionNumberOverview"><span id="versionWordEarlier">Version </span><span id="versionNumberEarlier">${versionNumber}</span></span>
                        <div id="versionMessageEarlier" style="display:none">${versionMessage}</div>
                        <span id="versionDateEarlier" style="display:none">${showDate}</span><span id="versionTimeEarlier" style="display:none"> ${showTime}</span>
                         <span id="commitNumberEarlier" style="display:none">${commitNumber}</span>
                    </span>   
                    `
                    document.getElementById('earlierVersionOverview').innerHTML = headerInsert

                    //this applies to the items in the list below
                    document.getElementById('showPriorCommitsForCompare').children[1].id = "selectedChangeId2"
                    document.getElementById('selectedChangeId2').classList.add('selectedChangeClass')
                }
            }
            document.getElementById('showViewPriorVersionsForCompare').style.display = 'block'
            document.getElementById('optionsAtBottom').style.display = "none"
            document.getElementById('saveProjectVersion').style.display = 'none'
            document.getElementById('folderContents').style.display = "none"
            document.getElementById('closeCompareChangesView').addEventListener('click', () => {
                document.getElementById('folderContents').style.display = 'block'
                document.getElementById('showViewPriorVersionsForCompare').style.display = 'none'
                document.getElementById('showPriorCommitsForCompare').innerHTML = ''
                document.getElementById('optionsAtBottom').style.display = "block"
                document.getElementById('saveProjectVersion').style.display = 'block'
            })
        })
    }
    catch (e) {
        console.log('error in show versions to compare = ' + e)
        if (e.toString().indexOf('not a git repository') > -1) {
            alert('To Compare Changes, please first save a project version.')
        } else {
            alert('Sorry, there was an error in comparing changes. Please try again.')
        }
    }
}

function selectVersionToViewChanges(event, commitNumber, versionNumber, showDate, showTime, versionMessage) {
    //Info on how this works:
    //To keep track of which versions are selected, we give them one of two ids: selectedChangeId1 and selectedChangeId2. The numbers on these ids do NOT correspond to which version is earlier and which is later. The numbers are there to just identify which versions are selected. When a new version is selected, the numbers shift, so that the new selection becomes selectedChangeId1, the prior selectedChangeId1 becomes selectedChangeId2, and the prior selectedChangeId2 loses its selection.
    //After the selection numbers are sorted out, then there is a separate process to determine which version will be listed as later (newer) and which as earlier(older). This process is redone every time there is a selection.

    //***MAKE SURE THE ID IS LINKED TO THE OVERVIEW CLASS OF THE ELEMENT (no matter where it was clicked) ********/
    try {
        if (event.target.classList.contains('versionOverviewClass')) {
            var selectedDiv = event.target
        } else {
            var selectedDiv = event.target.closest('.versionOverviewClass')
        }

        if ((selectedDiv.id !== 'selectedChangeId2') && (selectedDiv.id !== 'selectedChangeId1')) {
            //********SET THE IDS CORRECTLY ************/
            document.getElementById('selectedChangeId2').classList.remove('selectedChangeClass')
            document.getElementById('selectedChangeId2').id = ''
            document.getElementById('selectedChangeId1').id = 'selectedChangeId2'
            selectedDiv.id = 'selectedChangeId1'
            selectedDiv.classList.add('selectedChangeClass')

            //********Get the Version Number of the currently selected versions **************/
            var id1 = document.getElementById('selectedChangeId1')
            var id2 = document.getElementById('selectedChangeId2')
            var id1Version = document.querySelector('#selectedChangeId1 .versionNumber').textContent
            if (id1Version !== 'Current Changes') {
                var id1VersionNumber = parseInt(id1Version)
            } else {
                var id1VersionNumber = id1Version
            }
            var id2Version = document.querySelector('#selectedChangeId2 .versionNumber').textContent
            if (id2Version !== 'Current Changes') {
                var id2VersionNumber = parseInt(id2Version)
            } else {
                var id2VersionNumber = id2Version
            }

            var id1Message = document.querySelector('#selectedChangeId1 .versionMessage').textContent
            var id1Date = document.querySelector('#selectedChangeId1 .versionDate').textContent
            var id1Time = document.querySelector('#selectedChangeId1 .versionTime').textContent
            var id1CommitNumber = document.querySelector('#selectedChangeId1 .commitNumber').textContent

            var id2Message = document.querySelector('#selectedChangeId2 .versionMessage').textContent
            var id2Date = document.querySelector('#selectedChangeId2 .versionDate').textContent
            var id2Time = document.querySelector('#selectedChangeId2 .versionTime').textContent
            var id2CommitNumber = document.querySelector('#selectedChangeId2 .commitNumber').textContent

            //*****COMPARE THE VERSION NUMBERS******* */

            if (id2VersionNumber === 'Current Changes') { //then the first chosen item is the current changes
                var laterHeaderInsert = `
                <span class="selectedForChangesClass" id="laterVersionForChanges">
                    <span class="versionNumberOverview"><span id="versionWordLater"></span><span id="versionNumberLater">${id2VersionNumber}</span></span>
                    <div id="versionMessageLater" style="display:none">${id2Message}</div>
                    <span id="versionDateLater" style="display:none">${id2Date}</span><span id="versionTimeLater" style="display:none">${id2Time}</span>
                    <span id="commitNumberLater" style="display:none">${id2CommitNumber}</span>
                </span>   
                `
                document.getElementById('laterVersionOverview').innerHTML = laterHeaderInsert

                var earlierHeaderInsert = `
                <span class="selectedForChangesClass" id="earlierVersionForChanges">
                    <span class="versionNumberOverview"><span id="versionWordEarlier">Version </span><span id="versionNumberEarlier">${id1VersionNumber}</span></span>
                    <div id="versionMessageEarlier" style="display:none">${id1Message}</div>
                    <span id="versionDateEarlier" style="display:none">${id1Date}</span><span id="versionTimeEarlier" style="display:none">${id1Time}</span>
                    <span id="commitNumberEarlier" style="display:none">${id1CommitNumber}</span>
                </span>   
                `
                document.getElementById('earlierVersionOverview').innerHTML = earlierHeaderInsert

            } else if (id1VersionNumber === 'Current Changes') {
                var laterHeaderInsert = `
                <span class="selectedForChangesClass" id="laterVersionForChanges">
                    <span class="versionNumberOverview"><span id="versionWordLater"></span><span id="versionNumberLater">${id1VersionNumber}</span></span>
                    <div id="versionMessageLater" style="display:none">${id1Message}</div>
                    <span id="versionDateLater" style="display:none">${id1Date}</span><span id="versionTimeLater" style="display:none">${id1Time}</span>
                    <span id="commitNumberLater" style="display:none">${id1CommitNumber}</span>
                </span>   
                `
                document.getElementById('laterVersionOverview').innerHTML = laterHeaderInsert

                var earlierHeaderInsert = `
                <span class="selectedForChangesClass" id="earlierVersionForChanges">
                    <span class="versionNumberOverview"><span id="versionWordEarlier">Version </span><span id="versionNumberEarlier">${id2VersionNumber}</span></span>
                    <div id="versionMessageEarlier" style="display:none">${id2Message}</div>
                    <span id="versionDateEarlier" style="display:none">${id2Date}</span><span id="versionTimeEarlier" style="display:none">${id2Time}</span>
                    <span id="commitNumberEarlier" style="display:none">${id2CommitNumber}</span>
                </span>   
                `
                document.getElementById('earlierVersionOverview').innerHTML = earlierHeaderInsert

            } else if (id2VersionNumber > id1VersionNumber) { //no current changes selected
                var laterHeaderInsert = `
                <span class="selectedForChangesClass" id="laterVersionForChanges">
                    <span class="versionNumberOverview"><span id="versionWordLater">Version </span><span id="versionNumberLater">${id2VersionNumber}</span></span>
                    <div id="versionMessageLater" style="display:none">${id2Message}</div>
                    <span id="versionDateLater" style="display:none">${id2Date}</span><span id="versionTimeLater" style="display:none">${id2Time}</span>
                    <span id="commitNumberLater" style="display:none">${id2CommitNumber}</span>
                </span>   
                `
                document.getElementById('laterVersionOverview').innerHTML = laterHeaderInsert

                var earlierHeaderInsert = `
                <span class="selectedForChangesClass" id="earlierVersionForChanges">
                    <span class="versionNumberOverview"><span id="versionWordEarlier">Version </span><span id="versionNumberEarlier">${id1VersionNumber}</span></span>
                    <div id="versionMessageEarlier" style="display:none">${id1Message}</div>
                    <span id="versionDateEarlier" style="display:none">${id1Date}</span><span id="versionTimeEarlier" style="display:none">${id1Time}</span>
                    <span id="commitNumberEarlier" style="display:none">${id1CommitNumber}</span>
                </span>   
                `
                document.getElementById('earlierVersionOverview').innerHTML = earlierHeaderInsert

            } else if (id1VersionNumber > id2VersionNumber) { //no current changes selected
                var laterHeaderInsert = `
                <span class="selectedForChangesClass" id="laterVersionForChanges">
                    <span class="versionNumberOverview"><span id="versionWordLater">Version </span><span id="versionNumberLater">${id1VersionNumber}</span></span>
                    <div id="versionMessageLater" style="display:none">${id1Message}</div>
                    <span id="versionDateLater" style="display:none">${id1Date}</span><span id="versionTimeLater" style="display:none">${id1Time}</span>
                    <span id="commitNumberLater" style="display:none">${id1CommitNumber}</span>
                </span>   
                `
                document.getElementById('laterVersionOverview').innerHTML = laterHeaderInsert

                var earlierHeaderInsert = `
                <span class="selectedForChangesClass" id="earlierVersionForChanges">
                    <span class="versionNumberOverview"><span id="versionWordEarlier">Version </span><span id="versionNumberEarlier">${id2VersionNumber}</span></span>
                    <div id="versionMessageEarlier" style="display:none">${id2Message}</div>
                    <span id="versionDateEarlier" style="display:none">${id2Date}</span><span id="versionTimeEarlier" style="display:none">${id2Time}</span>
                    <span id="commitNumberEarlier" style="display:none">${id2CommitNumber}</span>
                </span>   
                `
                document.getElementById('earlierVersionOverview').innerHTML = earlierHeaderInsert
            }
        }
    } catch (e) {
        console.log('error in select versions to view changes = ' + e)
        alert('Sorry, there was an error in comparing changes. Please close this item and try again.')
    }
}

/**************************RUN COMPARE CHANGES***************/

document.getElementById('runChangesIntegrated').addEventListener('click', () => {
    runComparisonFunction('integrated')
})

/*
//block changes option removed for simplicity
document.getElementById('runChangesBlock').addEventListener('click', () => {
    runComparisonFunction('block')
})

*/


function runComparisonFunction(comparisonType) {
    try {
        var laterVersionNumber = document.getElementById('versionNumberLater').textContent
        var laterMessage = document.getElementById('versionMessageLater').textContent
        var laterDate = document.getElementById('versionDateLater').textContent
        var laterTime = document.getElementById('versionTimeLater').textContent
        var laterCommitNumber = document.getElementById('commitNumberLater').textContent

        var earlierVersionNumber = document.getElementById('versionNumberEarlier').textContent
        var earlierMessage = document.getElementById('versionMessageEarlier').textContent
        var earlierDate = document.getElementById('versionDateEarlier').textContent
        var earlierTime = document.getElementById('versionTimeEarlier').textContent
        var earlierCommitNumber = document.getElementById('commitNumberEarlier').textContent

        var laterVersionArray = {
            commitNumber: laterCommitNumber,
            versionNumber: laterVersionNumber,
            versionMessage: laterMessage,
            versionDate: laterDate,
            versionTime: laterTime,
        }

        //var earlierVersionArray = {}
        var earlierVersionArray = {
            commitNumber: earlierCommitNumber,
            versionNumber: earlierVersionNumber,
            versionMessage: earlierMessage,
            versionDate: earlierDate,
            versionTime: earlierTime
        }

        var arg1 = projectFolderPath
        var arg2 = JSON.stringify(laterVersionArray)
        var arg3 = JSON.stringify(earlierVersionArray)
        var arg4 = comparisonType //either integrated or block 
        ipcRenderer.send('open-compare-versions-window', arg1, arg2, arg3, arg4)
    } catch (e) {
        console.log('error in run comparison function = ' + e)
        alert("Sorry, there was an error running this comparison. Please try again.")
    }
}


/********GIT ACTIONS*************** */

async function saveGitVersion() {
    console.log('in save version')
    var text = document.getElementById('noteForSave').innerHTML.replaceAll('<div><br></div>', '\n\n').replaceAll('<div>', '').replaceAll('</div>', '') //textContent
    if (text.length < 1) {
        text = "new version saved"
    }
    document.getElementById('saveProjectItems').style.display = "none"
    document.getElementById('savingProgress').style.display = "inline-block"
    document.getElementById('saveProjectHeader').style.display = "none"
    try {


        /**STEPS FROM HERE: Create file with commit notes (including checking if already exists). Create file if necessary. Then, after notes file has been updated, run the commit */

        /*Make a file of commit notes:*/
        var commitTextFilePath = projectFolderPath + '/z-version-notes.md'
        fs.stat(commitTextFilePath, function (err, stat) {
            if (err == null) {
                //file exists
                fs.readFile(commitTextFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.log('error = ' + err)
                    } else {
                        var dateObject = new Date()
                        var showDate = dateObject.toLocaleDateString('en-us', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        var showTime = dateObject.toLocaleTimeString('en-us', {
                            timeStyle: 'short'
                        })
                        var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
                        var showTime = '**' + showDate + ' ' + cleanedTime + '**' + '\n\n'
                        var newData = showTime + text + '\n\n\n' + data
                        fs.writeFile(commitTextFilePath, newData, (err) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //********FILE UPDATED. NOW MAKE THE COMMIT****** */
                                doTheCommit(text)
                            }
                        })
                    }
                })
            } else if (err.code === 'ENOENT') {
                // file does not exist
                var dateObject = new Date()
                var showDate = dateObject.toLocaleDateString('en-us', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
                var showTime = dateObject.toLocaleTimeString('en-us', {
                    timeStyle: 'short'
                })
                var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
                var showTime = '**' + showDate + ', ' + cleanedTime + '**' + '\n\n'
                var newData = showTime + text + '\n\n\n'
                fs.writeFile(commitTextFilePath, newData, (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log('file created')
                        var indent = 0
                        var newIndent = parseInt(indent) + 15
                        var newId = "**is-document**^^^" + commitTextFilePath + "^^^" + indent
                        contents = `<div>
                                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${commitTextFilePath}", "${newIndent}")'>` + 'z-version-notes.md' + `</div>
                                </div>`
                        var contentsDiv = document.getElementById('folderContents')
                        contentsDiv.insertAdjacentHTML("beforeend", contents)
                        //********FILE CREATED. NOW MAKE THE COMMIT****** */
                        doTheCommit(text)
                    }
                })
            } else {
                console.log('Some other error: ', err.code);
            }
        });
        /*
        await git.raw('remote', 'get-url', '--push', 'origin').then(result => {  //thiswould be to push to github
            console.log('get remote result = ' + JSON.stringify(result))
            //if lists a remote at github that doesn't exist, will send back an error
            document.getElementById('remoteName').textContent = result
        })
        */

    }
    catch (e) {
        console.log('error = ' + e)
        alert("Sorry, there was an error saving this version. Please try again.")
    }
}

async function doTheCommit(text) { //Where the actual version commit is done.
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })
        await git.init().then(result => {
            //console.log('init result = ' + JSON.stringify(result))
        })

        await git.add('.').then(result => {
            //console.log('add result = ' + JSON.stringify(result))
        })

        await git.commit(text).then(result => {
            /*
            var overviewS = document.getElementById("ifNewVersionSaved")
            var overviewN = document.getElementById("ifNoNewVersion")
            var showResults = document.getElementById("showResults")
            if (result.summary.changes != "0") {
                overviewN.style.display = "none"
                showResults.textContent = JSON.stringify(result.summary)
                overviewS.style.display = "inline-block"
            } else {
                overviewS.style.display = "none"
                showResults.textContent = ""
                overviewN.style.display = "inline-block"
            }
            */

            /*
            
            document.getElementById('saveProjectItems').style.display = "none"
            document.getElementById('saveProjectHeader').style.display = "none"
            document.getElementById('sendOptions').style.display = 'block'
            document.getElementById('localSaveNotice').style.display = 'block'
            */
            document.getElementById('savingProgress').style.display = "none"
            document.getElementById('saveProjectHeader').style.display = "block"
            document.getElementById('noteForSave').textContent = ''
            document.getElementById('saveProjectItems').style.display = "block"
            document.getElementById('saveProjectHeader').style.display = "block"
            console.log('commit result = ' + JSON.stringify(result))
        })
    } catch (e) {
        console.log('error in do the commit = ' + e)
        if (e.toString().indexOf('installed') > -1) {
            ipcRenderer.send('open-get-git-window', '')
        } else {
            alert("Sorry, there was an error saving this version. Please try again.")
        }   
    }
}







/*************************************************************************************** */

/***************************** NOT CURRENTLY IN USE  *************************************/
/*
 //SAVING INDIVIDUAL FILES. NOT CURRENTLY IN USE.
 //receives info from main.js about the active window
 ipcRenderer.on('window-title', (event, data) => {
     document.getElementById('selectedDoc').textContent = data
     fileName = data
 })
 */



/****NOT IN USE: SEND PROJECT TO GITHUB**************** */

/*
Github commands:
   /*
        .add('./*')
        .commit("first commit!")
        .addRemote('origin', 'some-repo-url')
        .push(['-u', 'origin', 'master'], () => console.log('done'));
    ***
    github remote repo commands:

    touch README.md
    git init
    git add README.md
    git commit -m "first commit"
    git remote add origin git@github.com:alexpchin/<reponame>.git
    git push -u origin master

    */


async function showSendOptions() {
    try {
        document.getElementById('saveProjectItems').style.display = "none"
        document.getElementById('saveProjectHeader').style.display = "none"
        document.getElementById('sendOptions').style.display = "block"
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })
        await git.raw('remote', 'get-url', '--push', 'origin').then(result => {
            console.log('get remote result = ' + JSON.stringify(result))
            //if lists a remote at github that doesn't exist, will send back an error
            document.getElementById('remoteName').innerHTML = result
        })
    } catch (e) {
        console.log('error = ' + e)
    }
}

function closeSendView() {
    document.getElementById('sendOptions').style.display = "none"
    document.getElementById('saveProjectItems').style.display = "block"
    document.getElementById('saveProjectHeader').style.display = "block"
}

function openPushTarget() {
    var target = document.getElementById('remoteName').textContent
    shell.openExternal(target)
}

async function sendToGithubFunction() {
    const USER = 'NL33'
    const PASS = ''
    const REPO = 'github.com/nl33/remote-test-repo'
    const remote1 = `https://${USER}:${PASS}@${REPO}`
    const remote2 = 'https://nl33@github.com/nl33/remote-test-repo'
    var newRemoteUrl = 'https://github.com/IrSg/test-remote-repo.git'
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.raw('remote', '--v').then(result => {
            console.log('get remote result = ' + result)
        })


        /*if already has remote and want to change remote:

        await git.raw('remote', 'set-url', 'origin', newRemoteUrl).then(result => {
            console.log('setting new remote url result = ' + result)
        })
       */

        /*if no remote yet:
        await git.addRemote('origin', 'https://github.com/IrSg/test-remote-repo.git').then(result => {
            console.log('adding remote result = ' + result)
        })
*/

        /* first push of code to remote
                await git.raw("push", "-u", "origin", "master").then(result => {
                    console.log('result of first push = ' + JSON.stringify(result))
                    if (result){
                        document.getElementById('sendOptions').style.display = "none"
                        document.getElementById('saveProjectItems').style.display = "block"
                        document.getElementById('saveProjectHeader').style.display = "block"
                    } else if (error){
                        console.log('error in git push function = ')
                        console.log(error)
                    }
                })
        
                //needs -u, origin, main as first commit to remote.
                //using git.push("-u", "origin", "master") did not seem to work. git.push() probably works, but not for the first commit to the master
        */

        await git.push().then(result => {
            console.log('result of push = ' + JSON.stringify(result))
        })

    }
    catch (e) {
        console.log('error in sendToGithubFunction = ' + e)
    }
}











/*********APPLE SCRIPT / JXA***************** */
async function controlTheWindow() {

    try {
        await runJxa(`
    // evalAS :: String -> IO String
   
    const evalAS = s => {
        const
            a = Application.currentApplication(),
            sa = (a.includeStandardAdditions = true, a);
        return sa.doShellScript(
            ['osascript -l AppleScript <<OSA_END 2>/dev/null']
            .concat([s])
            .concat('OSA_END')
            .join('\n')
        );
    };
    var frontAppName = Application("System Events").processes.whose({frontmost: {'=': true }})[0].name();
    var frontApp = Application(frontAppName);
        var insert = 'bounds of first window of application (path to frontmost application as text)'
          return evalAS(insert);
       `
        )
    } catch (e) {
        console.log('error = ' + e)
    }
}
/*
    async function getFrontNote(){
        try {
            await runJxa(`
                  (() => {
            'use strict';

            // evalAS2 :: String -> IO a
            const evalAS2 = s => {
                const a = Application.currentApplication();
                const sa = (a.includeStandardAdditions = true, a);                
                return sa.runScript(s);
            };
    	
            return evalAS2("use scripting additions\n\
                tell application "Notes"
                set noteName to name of item 1 of(get selection)
            end tell
            ");
            })();
          `)

        } catch (error) {
            console.log('error in get front note = ' + error)
        }

    }
    */
/*
  await runJxa(`
      var frontAppName = Application("System Events").processes.whose({frontmost: {'=': true }})[0].name();
      console.log('front app name = ' + frontAppName)
      var frontApp = Application(frontAppName); //gets the application with that name
     var info = frontApp.windows[0].path()
      console.log('info = ' + info)
      frontApp.windows[0].bounds = {
      "x": 80,
      "y": 80,
      "width": 50,
      "height": 50
      }
 
      console.log('done')
  `)
  */

/* working function
var its = se.processes.byName('iTunes');
 
 
 
async function controlTheWindow() {
    await runJxa(`
     const wordApp = Application("Microsoft Word")
    //wordDoc.activate()
    wordApp.windows[0].bounds = {
      "x": 2,
      "y": 4,
      "width": 200,
      "height": 200
    }
  `)
}
//this one puts the first window of foreground app in a position:
   await runJxa(`
        var frontAppName = Application("System Events").processes.whose({frontmost: {'=': true }})[0].name();  //gets the name of the process that is currently in front
        var frontApp = Application(frontAppName); //gets the application with that name
        frontApp.windows[0].bounds = {
        "x": 2,
        "y": 4,
        "width": 200,
        "height": 200
        }
    `)
 
*/

/****************FUNCTIONS TO CONVERT WORD DOCS TO MD ON GIT SAVE ******************/
/*These functions are not currently in use.
The purpose of these functios is to 1. determine last time git file was saved, 2. go through and determine if any word docs have been saved since that time (ie, they are more updated then the last git file), and 3. take those word docs and create markdown file equivalents of them. 
*/
async function checkGitChangeTime(theFilePath) { //check the last time the git file was created
    var newStat = promisify(fs.stat)
    console.log('a. check changes function')
    //if a doc is md, txt, html, etc.--> then I don't need to create a copy of it.
    //if a doc is a word doc (and specific others), then I need to create a copy of it.
    //so one strategy is to find all the word docs in a project, and then see if they have been updated, and then update the copy if they have
    var lastSaveTime
    var gitFile = theFilePath + '/.git'
    if (gitFile) {
        await newStat(gitFile).then((stats, err) => {
            lastSaveTime = stats.mtime
            console.log('b. last save time = ' + lastSaveTime)
            return checkChangesFunction(theFilePath, lastSaveTime) //once have the last updated time, run the function to see what folders have changed since then
            // }).catch((e) => {
            //   console.log('error = ' + e)
        })
    } else {
        lastSaveTime = 0
        return checkChangesFunction(theFilePath, lastSaveTime) //once have the last updated time, run the function to see what folders have changed since then
    }
}


/**THe below function runs a loop. When it analyzes and converts a word doc, that goes on a different track and happens slower. That is ok
 the question is: how to call the next stage (git actions), only once all word docs have been addressed?
 Potential Answer:
 in the first loop, don't do the asynchronous work. use that work to get all the filePaths for word docs that need to be worked on.
 Then, for all those filepaths, do the asynchronous magic work.
 once you've done so for all the paths in the word array, then and only then call the git function
 */
var wordDocs = []
var count = 0
async function checkChangesFunction(theFilePath, lastSaveTime) {
    var newStat = promisify(fs.stat)
    var projectFolder = theFilePath
    var projectContents = await fs.readdirSync(projectFolder)
    count++
    if (count === 1) { //only do this the first time you run through this array, so only do this for the top line of the directory. This will add a fake name at the end of the project contents (not actually adding a file--just for purposes of the loop below). It's a way to know when we've reached the end of the project contents
        var fakeFileName = 'zzz3%$#j488*MN3#@1q9*mxSzp9L0(*g'
        projectContents.push(fakeFileName)
    }
    for (var i = 0; i < projectContents.length; i++) {

        if ((projectContents[i] != 'zzz3%$#j488*MN3#@1q9*mxSzp9L0(*g') && (projectContents[i] != ".DS_Store") && (projectContents[i] != ".git")) {
            var filePath = path.join(projectFolder, projectContents[i]); //get full path of item in the project we're focused on
            console.log('1. filepath = ' + filePath)
            await newStat(filePath).then((stats, err) => {  //gets stats then. and convert fs.stat to a promise that resolves to be sure: 1. it does the analysis of the relevant file before moving on the loop and 2. it resolves, so it does move on when it's done
                if (err) {
                    throw (err)
                }
                let timeModified = stats.mtime //get modified time of item
                if (timeModified > lastSaveTime) { //has it been modified since the last git save? If so, we need to look closer.
                    if (fs.statSync(filePath).isDirectory() === true) { //if a directory, then run this again, until you get to a document
                        //note it may not get here aagain if no contents
                        console.log('2a. file path = ' + filePath + ", **is a directory")
                        return checkChangesFunction(filePath, lastSaveTime)
                    } else { //if it's a file, then see if a word doc. If so, perform magic. If not, then no action necessary cause git can handle file as is.
                        //console.log('in a document')
                        var extension = path.extname(filePath)
                        if (extension.includes('doc')) {
                            wordDocs.push(filePath)
                            console.log('2.b word doc = ' + filePath)
                            return 'done'
                        } else {
                            console.log('2ba. doc but not word doc ')
                            return 'done'
                        }
                    }
                } else { //if it has not been modified since the last git save, then we are done with this item in the loop
                    console.log('2c. has not been modified since last git save')
                    return 'done'
                }

            }).catch((e) => {
                console.log('error hereo= ' + JSON.stringify(e))
            })  //end stat

        } else if (projectContents[i] === 'zzz3%$#j488*MN3#@1q9*mxSzp9L0(*g') {
            console.log('^^^^^^^^^^END LOOP THROUGH PROJECT CONTENTS************')
            console.log('word doc lenght = ')
            console.log(wordDocs.length)

            let promises = []
            for (let i = 0; i < wordDocs.length; i++) {
                promises.push(mammothFunction(wordDocs[i]))
                //mammothFunction(wordDocs[i])
            }


            Promise.all(promises).then(function (result) {
                console.log('*&*&*&*&*&*& promise all done *&*&*&*&*&*&*&*&*&*&*&*&*&*&')
                saveGitVersion()
            })


        }//end if not ds_store or git
    } //end projectContents loop
} //end check Changes Function

function mammothFunction(wordDocPath) {
    return new Promise((resolve, reject) => {
        mammoth.convertToHtml({ path: wordDocPath }).then(function (result) {
            var htmlWord = result.value
            var data = turndownService.turndown(htmlWord)
            var dataCleaned = data.replace(/<!--.*?-->/s, "");  //at this point, have converted the word doc to markdown, and removed the first commented out code that word docs have that take up a lot of space but are not necessary from the markdown version
            var removeDocExtension = wordDocPath.replace(/\.[^/.]+$/, "")
            var markDownPath = removeDocExtension + '.md'
            writeFile(markDownPath, dataCleaned, (err) => {
                if (err) {
                    console.log('error = ' + err)
                } else {
                    resolve(dataCleaned)   //completed the conversion for the doc. sends it back to promise.all(promises)
                }
            })
        })
    })
}