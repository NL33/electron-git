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

let spawn = require("child_process").spawn
var cp = require("child_process");
const { promisify } = require('util')

var diff2html = require("diff2html").Diff2Html

var projectFolderPath
var laterVersionInfo
var earlierVersionInfo
/*****Button Set Up *****/
window.onload = function () {
   projectFolderPath = window.process.argv.slice(-3)[0] 
   laterVersionInfo = JSON.parse(window.process.argv.slice(-3)[1])
   earlierVersionInfo = JSON.parse(window.process.argv.slice(-3)[2])
   console.log('project path = ' + projectFolderPath)
   console.log('later Version INfo = ' + JSON.stringify(laterVersionInfo))  /***START HERE */

}


/*******GIT DIFF WITH WORD  **************/

function getChangedFilesFunction(){

}

/********* GIT DIFF TESTING ******* */

document.getElementById('gitDiffWord').addEventListener('click', () => {
    gitDiffFunctionWord()
})


async function gitDiffFunctionWord() {
    var laterCommit = laterVersionInfo.commitNumber
    var earlierCommit = earlierVersionInfo.commitNumber
    console.log('later commit = ' + laterCommit)
    console.log('earlier commit = ' + earlierCommit)
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.diffSummary().then(result => {
            console.log('first summary = ' + JSON.stringify(result))
            result.files.forEach((item)=>{
                var file = item.file
                var newId = '#' + file
                var contents = `<div><a href="${newId}">${file}</a><div>`
                document.getElementById('diffWordSummary').insertAdjacentHTML('afterbegin', contents)
            })
           // document.getElementById('showDiffWord').innerHTML = JSON.stringify(result)
        })
        if (laterCommit !== 'current-changes') {
            await git.raw('diff', '--word-diff', earlierCommit, laterCommit).then(result => {
                console.log(result)
                var red = result.replace(/\[-/g, '<del style="color: #c00">')
                var endred = red.replace(/-]/g, '</del>')
                console.log('2')
                //var green = endred.replace(/{\+/g, '<ins style="color: #0c0">')//lighter green color
                //var green = endred.replace(/{\+/g, '<ins style="color: #009900">') //dark green color
                var green = endred.replace(/{\+/g, '<ins style="color: #0066cc; font-weight: bold">')  //blue color
                var endgreen = green.replace(/\+}/g, '</ins>')
                var resultArray = endgreen.split('diff --git a/')
                console.log('3')
                for (var i = 1; i < resultArray.length; i++) {
                    var fileName = resultArray[i].split(" ")[0]
                    var contents = `
                    <hr style="width: 95%; border: 2px solid  #32cd53; margin-bottom: 15px; margin-top: 15px; border-radius: 15px;">
                    <div id=${fileName}>
                        <div style="font-weight: bold; font-size: 14pt; margin-top: 0px; margin-bottom: 10px;white-space: pre-wrap">${fileName}</div>
                        <div style="white-space: pre-wrap">${resultArray[i]}</div>
                    </div>
                    `
                    console.log('4')
                    document.getElementById('showDiffWord').insertAdjacentHTML('afterbegin', contents)
                }
            })
        } else {
            await git.raw('diff', '--word-diff', earlierCommit).then(result => { //current
                console.log(result)
                var red = result.replace(/\[-/g, '<del style="color: #c00">')
                var endred = red.replace(/-]/g, '</del>')
                console.log('2')
                //var green = endred.replace(/{\+/g, '<ins style="color: #0c0">')//lighter green color
                //var green = endred.replace(/{\+/g, '<ins style="color: #009900">') //dark green color
                var green = endred.replace(/{\+/g, '<ins style="color: #0066cc; font-weight: bold">')  //blue color
                var endgreen = green.replace(/\+}/g, '</ins>')
                var resultArray = endgreen.split('diff --git a/')
                console.log('3')
                for (var i = 1; i < resultArray.length; i++) {
                    var fileName = resultArray[i].split(" ")[0]
                    var contents = `
                    <hr style="width: 95%; border: 2px solid  #32cd53; margin-bottom: 15px; margin-top: 15px; border-radius: 15px;">
                    <div id=${fileName}>
                        <div style="font-weight: bold; font-size: 14pt; margin-top: 0px; margin-bottom: 10px;white-space: pre-wrap">${fileName}</div>
                        <div style="white-space: pre-wrap">${resultArray[i]}</div>
                    </div>
                    `
                    console.log('4')
                    document.getElementById('showDiffWord').insertAdjacentHTML('afterbegin', contents)
                }
            })
        }
    } catch (e) {
        console.log('error in git diff word function = ')
        console.log(e)
    }
}


document.getElementById('gitDiffTop').addEventListener('click', () => {
    gitDiffFunctionTop()
})

async function gitDiffFunctionTop() {
    var laterCommit = laterVersionInfo.commitNumber
    var earlierCommit = earlierVersionInfo.commitNumber
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        if (laterCommit !== 'current-changes'){
            await git.raw('diff', earlierCommit, laterCommit).then(result => {
                doTopDiffFunction(result)
            })
        } else {
            await git.raw('diff', earlierCommit).then(result => { //current changes v earlier commit
                doTopDiffFunction(result)
            }).then(result => { //run diff of current version against prior version
                doTopDiffFunction(result)
            })
        }
    } catch (e) {
        console.log('error in git diff top function = ')
        console.log(e)
    }
}

async function doTopDiffFunction(result){
    //with diffHTML
 try {
     const Diff2html = require('diff2html');
    const diffJson = await Diff2html.parse(result);
     const diffString = result
     const diffHtml = await Diff2html.html(diffJson, { drawFileList: true });
     document.getElementById('showDiffTop').innerHTML = await diffHtml
 } catch (e) {
     console.log('error in doTopDiffFunction = ')
     console.log(e)
 }
}
            /*
//with diff2htmlUI
const configuration = { drawFileList: true, matching: 'lines' };
const targetElement = document.getElementById('displayGitDiff')
const diff2htmlUi = new Diff2HtmlUI(targetElement, diffJson, configuration);
diff2htmlUi.draw();
diff2htmlUi.highlightCode();
*/
/*
 } catch (e){
     console.log('error in doTopDiffFunction = ')
     console.log(e)
 }

}












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
 /******START HERE********* */
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