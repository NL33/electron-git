const { ipcRenderer, ipcMain, clipboard, shell, remote } = require('electron')
const { Menu, MenuItem } = remote
const { mkdir, writeFile, fstat } = require('fs')
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
var laterCommitNumber
var earlierCommitNumber
var wordDocPath
/*****Button Set Up *****/
window.onload = function () {
    projectFolderPath = window.process.argv.slice(-3)[0]
    laterVersionInfo = JSON.parse(window.process.argv.slice(-3)[1])
    earlierVersionInfo = JSON.parse(window.process.argv.slice(-3)[2])
    document.getElementById('testDiffWord').addEventListener('click', () => {
        getChangedFilesFunction()
    })

}


/*******GIT DIFF WITH WORD  **************/
/*Sample docs

main-folder/llc-agreement.docx
stockholders-agreement.docx

*/
async function getChangedFilesFunction() {
    console.log('in get changed files function')
    laterCommitNumber = laterVersionInfo.commitNumber
    earlierCommitNumber = earlierVersionInfo.commitNumber
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        //*create a work tree which is going to match the most recent commit. 
        var randomNumber = Math.floor(Math.random() * 10000)
        var randomMultiple = Math.floor(Math.random() * 500)
        var theNumber = randomNumber * randomMultiple
        var treeName = theNumber.toString() + 'worktree3#&7#&1#&4'
        await git.raw('worktree', 'add', treeName).then(result => {
            if (result) {
                console.log(result)
                revertTree(treeName, earlierCommitNumber)
            } else {
                console.log('error = ')
            }
        })
    } catch (error) {
        console.log('error in get changed files function = ' + error)
    }
}

async function revertTree(treeName, commitNumber) {
    console.log('in revert tree function')
    let treePath = projectFolderPath + '/' + treeName
    try {
        await git.cwd(treePath).then(result => {
        })

        await git.checkout(commitNumber).then(result => {
            console.log('checkout result = ' + result)
            convertWordDoc(treePath)
        })


    } catch (e) {
        console.log('error in revert function = ' + e)
    }
}

async function convertWordDoc(treePath) {
    var doc1 = 'main-folder/llc-agreement.docx'
    let wordDocPath = treePath + '/' + doc1
    /*steps: START HERE********
    -take the word doc in the worktree, and get the html
    -then get the markdown
    -take the markdown path, and replace any forward slashes with a code (so node doesn't think we have to create a new directory where the slashes were)
    -then write file IN A SEPARATE NEW FOLDER IN THE MAIN PROJECT FILE--outside the worktree (STILL needs to be done), and put the markdown file there--givename, like "older". START HERE
    -then, revert the worktree to the other commit you are focused on.
    -then do the same process, putting the new markdown file in the same folder (name like "newer")
    -then run git diff --word-dif focused on these two files.
    repeat for each file
    */
    return new Promise((resolve, reject) => {
        mammoth.convertToHtml({ path: wordDocPath }).then(function (result) {
            var htmlWord = result.value
            var data = turndownService.turndown(htmlWord)
            //now have a markdown 
            var dataCleaned = data.replace(/<!--.*?-->/s, "");  //at this point, have converted the word doc to markdown, and removed the first commented out code that word docs have that take up a lot of space but are not necessary from the markdown version
            var removeDocExtension = doc1.replace(/\.[^/.]+$/, "")
            //file at this point: /Users/sean/Desktop/git-app-test-docs/word-diff-test/383180worktree3#&7#&1#&4/main-folder/llc-agreement
 
            var markDownDoc = removeDocExtension + '.md'
            var markDownDocPathChanged = markDownDoc.replace(/\//g, '135#&579-135#&579') //take the path of the word doc, and remove any "/". This is bc the forward slash means a directory. We want all the word docs for comparison to go into a temporary folder we create. If the forward slashes continue to be there, node will read them as their own directories. This means we would have to create a new directory for each of these when we run the md conversion (we do writeFile(...)--which you can only do into pre-existing directories), which would be too cumbersome. So instead we change out the forward slash for a complex code--which is the same across docs, so we can know later where we made the change, and can change back
            var markDownDocPath = projectFolderPath + '/newTempFolder784321/' + markDownDocPathChanged
            var newFolderPath = projectFolderPath + '/newTempFolder784321'
            if (fs.existsSync(newFolderPath)){
                console.log('it already exists')
            } else {
                console.log('it doesnt exist')
                fs.mkdirSync(newFolderPath, (err) => { /***Start here: what if the subfolder doesn't exist? */
                    if (err) {
                        console.log('error in creating directory = ' + err)
                    } else {
                        console.log('new directory created')
                        createMarkDownFile(markDownDocPath)
                    }
                })
            }
            writeFile(markDownDocPath, dataCleaned, (err) => {
                if (err) {
                    console.log('error in write file action = ' + err)
                } else {
                    resolve(dataCleaned)   //completed the conversion for the doc. sends it back to promise.all(promises)
                }
            })
        })
    })
}

function createMarkDownFile(markDownDocPath){
    console.log('in create markdownfile')
  
}

/********* GIT DIFF TESTING ******* */

document.getElementById('gitDiffWord').addEventListener('click', () => {
    gitDiffFunctionWord() //function to do integrated word test
})


async function gitDiffFunctionWord() {
    laterCommitNumber = laterVersionInfo.commitNumber
    earlierCommitNumber = earlierVersionInfo.commitNumber
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.diffSummary().then(result => {
            console.log('first summary = ' + JSON.stringify(result))
            result.files.forEach((item) => {
                var file = item.file
                var newId = '#' + file
                var contents = `<div><a href="${newId}">${file}</a><div>`
                document.getElementById('diffWordSummary').insertAdjacentHTML('afterbegin', contents)
            })
            // document.getElementById('showDiffWord').innerHTML = JSON.stringify(result)
        })
        if (laterCommitNumber !== 'current-changes') {
            await git.raw('diff', '--word-diff', earlierCommitNumber, laterCommitNumber).then(result => {
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
            await git.raw('diff', '--word-diff', earlierCommitNumber).then(result => { //current
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
    gitDiffFunctionTop() //function to do comparison one on top of the other, using diff2html
})

async function gitDiffFunctionTop() {
    laterCommitNumber = laterVersionInfo.commitNumber
    earlierCommitNumber = earlierVersionInfo.commitNumber
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        if (laterCommitNumber !== 'current-changes') {
            await git.raw('diff', earlierCommitNumber, laterCommitNumber).then(result => {
                doTopDiffFunction(result)
            })
        } else {
            await git.raw('diff', earlierCommitNumber).then(result => { //current changes v earlier commit
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

async function doTopDiffFunction(result) {
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

*/






