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

let projectFolderPath
let laterVersionInfo
let earlierVersionInfo
let laterCommitNumber
let earlierCommitNumber
let wordDocPath
let functionCounter = 0
let treeName
let mammothCounter
let mammothNeedsToRun
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

async function getChangedFilesFunction() {
    console.log('in get changed files function')
    mammothCounter = 0
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
        treeName = theNumber.toString() + 'worktree3#&7#&1#&4'
        await git.raw('worktree', 'add', treeName).then(result => {   //^1. Create WorkTree (one for both versions)
            if (result) {
                let oldTempFolder = projectFolderPath + '/newTempFolder7843OLD'
                createTempFolders(oldTempFolder, treeName, earlierCommitNumber) //^2. For earlier commit: go to revert tree function. done afte worktree is created (sync timing = good)
            } else {
                console.log('error = ')
            }
        })
    } catch (error) {
        console.log('error in get changed files function = ' + error)
    }
}

function createTempFolders(tempFolder, treeName, earlierCommitNumber){
    console.log('in createTempFolders')
    let tempOld = projectFolderPath + '/newTempFolder7843OLD'
    let tempNew = projectFolderPath + '/newTempFolder7843NEW'
    if (fs.existsSync(tempFolder)) {
        if (tempFolder === tempOld) {
            console.log('1')
            createTempFolders(tempNew, treeName, earlierCommitNumber)
        } else {
            console.log('2')
            revertTree(treeName, earlierCommitNumber)
        }
    } else {
        fs.mkdir(tempFolder, (err) => { //^7b. If the temp folder directory doesn't exist yet, create it first, then make then send the new md file into it.
            if (err) {
                console.log('error in creating directory = ' + err)
            } else {
                if (tempFolder === tempOld) {
                    console.log('3')
                    createTempFolders(tempNew, treeName, earlierCommitNumber)
                } else {
                    console.log('4')
                    revertTree(treeName, earlierCommitNumber)
                }
            }
        })
    }
}







async function revertTree(treeName, commitNumber) {
    functionCounter++
    console.log('in revert tree function')
    let treePath = projectFolderPath + '/' + treeName
    try {
        await git.cwd(treePath).then(result => {
        })

        await git.checkout(commitNumber).then(result => { //^3. checkout the tree to the commit number (first, the older one). sync timing = good.
            console.log('checkout result = ' + result)
            convertWordDoc(treePath) //^4. go to convert word function based on the current tree. sync timing = good.
        })

    } catch (e) {
        console.log('error in revert function = ' + e)
    }
}

async function convertWordDoc(treePath) {
    let wordDocArray = ['main-folder/llc-agreement.docx', 'stockholders-agreement.docx'] //^5. for each word doc that changed, convert the version that is in the current checked out tree. sync timing = good.

    mammothNeedsToRun = (wordDocArray.length) * 2  //mamoth needs to convert the old version and the new version of each world file. so mammoth needs to run the amount of thw word docs, times 2
   for (let i=0; i < wordDocArray.length; i++){
  //START HERE: Try without doing promise. It's ok for mammoth to convert asyncronously. The key is that you have some way to tell when it has fully run. NExt step will be to run the git diff comparison of all the docs, but can't do that until we know the conversions are all done.

  //maybe: put a counter in the mamoth result, and then only go to next step once the counter hits the length of the array?
        let wordDocPath = treePath + '/' + wordDocArray[i]
        //console.log('in convertworddoc promise for  = ' + wordDocArray[i])
        mammoth.convertToHtml({ path: wordDocPath }).then(function (result) { //^6. convert the word docs to html. This will be happening async--so different docs will be being converted in parallel. That is ok.
           console.log('MAMMOTH converted for = ' + wordDocPath)
            mammothCounter++
            var htmlWord = result.value
            var data = turndownService.turndown(htmlWord)
            //now have a markdown 
            var dataCleaned = data.replace(/<!--.*?-->/s, "");  //at this point, have converted the word doc to markdown, and removed the first commented out code that word docs have that take up a lot of space but are not necessary from the markdown version
            var removeDocExtension = wordDocArray[i].replace(/\.[^/.]+$/, "")
            //file at this point: /Users/sean/Desktop/git-app-test-docs/word-diff-test/383180worktree3#&7#&1#&4/main-folder/llc-agreement
            var markDownDoc = removeDocExtension + '.md'
            var markDownDocPathChanged = markDownDoc.replace(/\//g, '135#&579-135#&579')
            if (functionCounter === 1){ //based on how many times revert tree has run. if run just once, then we are in the old setting. If run twice, then we are in the new setting.   
                var markDownDocPath = projectFolderPath + '/newTempFolder7843OLD/' + markDownDocPathChanged
                var newFolderPath = projectFolderPath + '/newTempFolder7843OLD'
               
            } else {
                var markDownDocPath = projectFolderPath + '/newTempFolder7843NEW/' + markDownDocPathChanged
                var newFolderPath = projectFolderPath + '/newTempFolder7843NEW'
            }
            writeFileFunction(markDownDocPath, dataCleaned)
             //take the path of the word doc, and remove any "/". This is bc the forward slash means a directory. We want all the word docs for comparison to go into a temporary folder we create. If the forward slashes continue to be there, node will read them as their own directories. This means we would have to create a new directory for each of these when we run the md conversion (we do writeFile(...)--which you can only do into pre-existing directories), which would be too cumbersome. So instead we change out the forward slash for a complex code--which is the same across docs, so we can know later where we made the change, and can change back
            
          
 
        })
   }
}

async function writeFileFunction(markDownDocPath, dataCleaned){
    console.log('FILE TO WRITE = ' + markDownDocPath)
    writeFile(markDownDocPath, dataCleaned, (err) => {//^8. send the md file to the temp folder
        if (err) {
            console.log('error in write file action = ' + err)
        } else {
            if (functionCounter === 1) {
                console.log('finished older conversion, now do the second conversion')
               // if (mammothCounter === (mammothNeedsToRun / 2)){
                    revertTree(treeName, laterCommitNumber)
               // }
               
            } else {
                console.log('done with conversion of older and new word docs')
                if (mammothCounter === mammothNeedsToRun) {
                    console.log('all done. mammoth counter equals word-doc-array. NOW YOU CAN RUN THE GIT DIFF OF THE TWO NEW FOLDERS')
                } else {
                    console.log('not done yet--mammoth counter does not equal worddocarray. mammoth counter = ' + mammothCounter + '; mammoth needs to run = ' + mammothNeedsToRun)
                }
            }
            //resolve(dataCleaned)   //completed the conversion for the doc. 
        }
    })
 /**************START HERE
 1. create worktree.
 2. for each commit being compared, create reversion of worktree to that number.
 3. loop through each word doc, creating a md version of old and new.

  I jsut added an array of docs to loop through under convert word function.

  issue then is tracking the mammoth conversion (async), then the writeFile conversion (async). It's ok for these to run in parallel for differnt docs. The key is to be sure that when you run the diff of the two new temp folders, that the process has fully run.

  NEXT: 
  --check to be sure the process has fully run--make sure the steps work so they go in right order.
  --right now the array of word docs is hardcoded--instead, get the docs that changed from the diff summary
  --run the diff on the two folders
  --integrate that with the diff of all non-word docs

 */


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
        const diffHtml = await Diff2html.html(diffJson, { drawFileList: true, diffStyle: 'word' });
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






