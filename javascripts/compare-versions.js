const { ipcRenderer, ipcMain, clipboard, shell, remote } = require('electron')
const { Menu, MenuItem } = remote
const { mkdir, writeFile, fstat } = require('fs')
const fs = require("fs")
var path = require('path')
const simpleGit = require('simple-git')
const git = simpleGit()
var TurndownService = require('turndown')

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
let comparisonType
let wordDocPath
let revertTreeFunctionCounter = 0
let treeName
let mammothCounter
let mammothNeedsToRun
let wordDocsArray = []
let diffIntegrated = true
let diffBlocks = false
/************************Button Set Up ***********************/
window.onload = function () {
    projectFolderPath = window.process.argv.slice(-4)[0]
    laterVersionInfo = JSON.parse(window.process.argv.slice(-4)[1])
    earlierVersionInfo = JSON.parse(window.process.argv.slice(-4)[2])
    comparisonType = window.process.argv.slice(-4)[3] //either integrated or block
    if (comparisonType === 'integrated') {
        gitDiffFunctionIntegrated()
    } else {
        gitDiffFunctionBlock()
    }
}


/*************************** CREATE COMPARISONS WITH GIT DIFF ******************************* */

/*************INTEGRATED DIFF ******************** */
let areThereWordDocs = false

async function gitDiffFunctionIntegrated() {
    diffIntegrated = true
    diffBlocks = false
    laterCommitNumber = laterVersionInfo.commitNumber
    earlierCommitNumber = earlierVersionInfo.commitNumber
    let showFullDoc = false
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })


        //first get the name of all changed files:
        if (laterCommitNumber !== 'current-changes') {
            await git.raw('diff', '--name-only', earlierCommitNumber, laterCommitNumber, (error, result) => {
                if (error) {
                    console.log('error in name only diff = ' + error)
                } else {
                    showChangedDocNames(result)
                }
            })
        } else { //summary for current changes against earlier commit number
            await git.raw('diff', '--name-only', earlierCommitNumber, (error, result) => {
                if (error) {
                    console.log('error in name only diff = ' + error)
                } else {
                    showChangedDocNames(result)
                }
            })
        }

        //then show the actual changes:
        if (laterCommitNumber !== 'current-changes') {
            await git.raw('diff', '--word-diff', earlierCommitNumber, laterCommitNumber).then(result => {
                showIntegratedDiffResult(result, 'summary')
            })
        } else {
            await git.raw('diff', '--word-diff', earlierCommitNumber).then(result => {
                showIntegratedDiffResult(result, 'summary')
            })
        }

    } catch (e) {
        console.log('error in git diff word function = ')
        console.log(e)
    }
}

/*****SHOW CHANGED DOC NAMES ********** */
function showChangedDocNames(result) {
    wordDocsArray = []
    var resultArray = result.split('\n')
    resultArray.forEach((file) => {
        if (file.length) {
            var newId1 = '#' + file
            if (newId1.slice(newId1.length - 3) === 'doc') { //when printing the doc names at the top, for word docs, set the id to be the name of the file with the doc or docx extension removed. This way, we can link it to the converted document (which will have an md extension)
                var newId = newId1.slice(0, - 4) //minus 4 to remove extension name and period.
            } else if (newId1.slice(newId1.length - 4) === 'docx') {
                var newId = newId1.slice(0, - 5)
            } else {
                var newId = newId1
            }
            var contents = `
            <div>
               <span><a href="${newId}">${file}</a></span>
               <span class="showThisDocClass" onclick='diffSingleFile("${file}")'>Show Full Document</span>
            </div>`

            if (path.extname(file).includes('doc')) {
                document.getElementById('diffFileNameSummary').insertAdjacentHTML('beforeend', contents)
                //we have a word doc here
                if (file.substring(0, 2) !== '~$') {
                    areThereWordDocs = true
                    wordDocsArray.push(file)
                }
            } else {
                document.getElementById('diffFileNameSummary').insertAdjacentHTML('afterbegin', contents)
            }
        }
    })
    if (areThereWordDocs === true) {
        startWordDiffProcess() //if there are word docs in the changed files, run the function to convert those to md and show the changes among those
    }
}




/****************** SHOW INTEGRATED DIFF ******************* */

function showIntegratedDiffResult(result, type) { //type can be full file ("full") or summary of changes
    var red = result.replace(/\[-/g, '<del style="color: #c00">')
    var endred = red.replace(/-]/g, '</del>')
    //var green = endred.replace(/{\+/g, '<ins style="color: #0c0">')//lighter green color
    //var green = endred.replace(/{\+/g, '<ins style="color: #009900">') //dark green color
    var green = endred.replace(/{\+/g, '<ins style="color: #0066cc; font-weight: bold">')  //blue color
    var endgreen = green.replace(/\+}/g, '</ins>')
    var resultArray = endgreen.split('diff --git a/') //split the results up every time there is a diff --git a/. The result of this is to 
    for (var i = 1; i < resultArray.length; i++) {
        var fileName = resultArray[i].split(" ")[0] //get the filename
        //the diff result produces a summary before showing the changes. The summary ends with "@@ [change numbers] @@". Goal is to remove this summary and go right at the changes themselves. The way we do this is to remove the text up to the second occurence of "@@":
        var firstOccurence = resultArray[i].indexOf("@@") //get the index of first occurence of "@@"
        var secondOccurence = (resultArray[i].indexOf("@@", firstOccurence + 1))//get the index of "@@", starting from the first occurence (in other words, get the second occurence)
        var showResults1 = resultArray[i].substring((secondOccurence + 2)) //show the substring starting at the second occurence+2 (because its two characters, so start where they begin, then add two)
        var breaks = /\@\@(.*?)\@\@/gm;
        var showResults = showResults1.replace(breaks, '[.........]<br>') //in the text, replace '@@ diff calculations @@'
        if ((fileName.slice(fileName.length - 3) !== 'doc') && (fileName.slice(fileName.length - 4) !== 'docx')) { //print changes only if not a word document. If a word document, printing changes handled separately in "startWordDiffProcess()"
            var contents = `
                        <hr style="width: 95%; border: 2px solid  #32cd53; margin-bottom: 15px; margin-top: 15px; margin-left: 0px; border-radius: 15px;">
                        <div id=${fileName}>
                            <div style="font-weight: bold; font-size: 14pt; margin-top: 0px; margin-bottom: 2px;white-space: pre-wrap">${fileName}</div>
                            <div style="white-space: pre-wrap">${showResults}</div>
                        </div>
                   `
            if (type === 'summary') {
                document.getElementById('showDiff').insertAdjacentHTML('afterbegin', contents)
            } else {
                document.getElementById('showDiff').style.display = 'none'
                document.getElementById('showFullFile').insertAdjacentHTML('afterbegin', contents)
                document.getElementById('backToSummaryButton').style.display = "inline-block"
                document.getElementById('backToSummaryButton').addEventListener('click', () => {
                    document.getElementById('showDiff').style.display = "inline-block"
                    document.getElementById('showFullFile').innerHTML = ''
                    document.getElementById('backToSummaryButton').style.display = "none"
                })
            }
        }
    }
}



//*******************IF FOR SINGLE FILE: For when showing "full document" changes *********************** */
let showFullDoc = false
async function diffSingleFile(file) {
    showFullDoc = false //showDoc=false is just for diffing micro word docs. Why? For non-micro-word-docs, it's just one other function, and we can include the specification of singleFile ('full') in the param, and it's more efficient. For micro-word docs, there are multiple functions to get through until this specification is relevant, and it's less efficient to carry this param through those functions (where they are not used until the end function)

    if (!(path.extname(file).includes('doc'))) { //f not word file
        var filePath = projectFolderPath + '/' + file
        try {
            await git.cwd(projectFolderPath).then(result => {
                // console.log('cwd resultss' + JSON.stringify(result))
            })

            if (showFullDoc === false) { //integrated diff
                if (laterCommitNumber !== 'current-changes') {
                    await git.raw('diff', '--word-diff', '-U9999999', earlierCommitNumber, laterCommitNumber, filePath).then(result => {
                        //with -U99999, will produce up to 99,999 lins around the changes in the output
                        showIntegratedDiffResult(result, 'full')
                    })
                } else {
                    await git.raw('diff', '--word-diff', '-U9999999', earlierCommitNumber).then(result => {
                        showIntegratedDiffResult(result, 'full')
                    })
                }
            } else { //block dif

                if (laterCommitNumber !== 'current-changes') {
                    await git.raw('diff', '-U9999999', earlierCommitNumber, laterCommitNumber, filePath).then(result => {
                        doTopDiffFunction(result, 'full')
                    })
                } else {
                    await git.raw('diff', '-U9999999', earlierCommitNumber).then(result => {
                        doTopDiffFunction(result, 'full')
                    })
                }
            }
        } catch (e) {
            console.log('error in git diff one file function = ')
            console.log(e)
        }
    } else {//if it is a micro word file
        if (file.substring(0, 2) !== '~$') {
            revertTreeFunctionCounter = 0  //will have to start process again
            mammothCounter = 0
            mammothNeedsToRun = 0
            writeFileRun = 0
            wordDocsArray = [file]
            showFullDoc = true
            startWordDiffProcess() //if there are word docs in the changed files, run the function to convert those to md and show the changes among those
        } else {
            //it's a temp file word created when the doc was open. We don't want to diff it
            alert("This is a temp file that Microsoft Word created. It is not a useable file.")
        }
    }
}



/*************************GIT DIFF WITH MICROSOFT WORD  *****************************/

async function startWordDiffProcess() {
    mammothCounter = 0
    laterCommitNumber = laterVersionInfo.commitNumber
    earlierCommitNumber = earlierVersionInfo.commitNumber
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })
        var randomNumber = Math.floor(Math.random() * 10000)
        var randomMultiple = Math.floor(Math.random() * 500)
        var theNumber = randomNumber * randomMultiple
        treeName = theNumber.toString() + 'worktree3#&7#&1#&4'
        await git.raw('worktree', 'add', treeName).then(result => {   //^1. Create WorkTree (one that will be the basis for both versions). Recall that the worktree to start is just a copy of the current project directory. You have to revert it to go to the prior versions of the directory
            if (result) {
                let oldTempFolder = projectFolderPath + '/tempFolder7843OLD'
                createTempFolders(oldTempFolder, treeName, earlierCommitNumber) //^2. create the temporary folders for old and new
            } else {
                console.log('error = ')
            }
        })
    } catch (error) {
        console.log('error in get changed files function = ' + error)
    }
}

function createTempFolders(tempFolder, treeName, earlierCommitNumber) {
    let tempOld = projectFolderPath + '/tempFolder7843OLD'
    let tempNew = projectFolderPath + '/tempFolder7843NEW'
    if (fs.existsSync(tempFolder)) {  //^3. if temp folder old doesn't exist, create it. Then create temp folder new if tempfoldernew doesn't exist. 
        if (tempFolder === tempOld) { //if oldTempFolder already exists, and the function is about the old folder, then create the new folder
            createTempFolders(tempNew, treeName, earlierCommitNumber)
        } else { //if the temp folder that exists is the new temp folder, then both folders already exist, so now start reverting the worktree, starting with the earlier commit number
            revertTree(treeName, earlierCommitNumber)
        }
    } else { //if temp folder doesn't exist
        fs.mkdir(tempFolder, (err) => {
            if (err) {
                console.log('error in creating directory = ' + err)
            } else {
                if (tempFolder === tempOld) {
                    createTempFolders(tempNew, treeName, earlierCommitNumber)
                } else {
                    revertTree(treeName, earlierCommitNumber)
                }
            }
        })
    }
}

async function revertTree(treeName, commitNumber) {
    try {
    revertTreeFunctionCounter++
    try {
        if (commitNumber !== 'current-changes') { //if not = current-changes, then it is a git commit number
            let treePath = projectFolderPath + '/' + treeName
            await git.cwd(treePath).then(result => {
            })

           await git.checkout(commitNumber).then(result => { //^4. checkout the tree to the commit number (first, the older ones, then, after the older files are created, the newer ones ). 
                convertWordDoc(treePath)
            })
        } else { //the later version is the current non-committed changes.
            convertWordDoc(projectFolderPath)
        }
    } catch (e) {
        console.log('error in revert function = ' + e)
    }
} catch(e){
    console.log('error in revert tree function = ' + e)
}
}

let numberOfWordDocsToConvert

async function convertWordDoc(treeOrMainPath) {
    try {
    let wordDocArray = wordDocsArray//^5. for each word doc that changed, convert the version that is in the current checked out tree. We get the wordDocsArray from the git diff summary action 
    numberOfWordDocsToConvert = wordDocArray.length
    mammothNeedsToRun = (wordDocArray.length) * 2  //mamoth needs to convert the old version and the new version of each world file. so mammoth needs to run the amount of the word docs, times 2
    var turndownService = new TurndownService()
    /**Set turndown service (markdown conversion) styling */
    /****CONVERT THE DOCS**** */
    for (let i = 0; i < wordDocArray.length; i++) {
        if (diffBlocks === false) { /******************For Integrated Diff ******************************/
            var wordDocPath = treeOrMainPath + '/' + wordDocArray[i] //NOTE: This does not exist if there is not an old or new version of the word doc. So need to make sure wordDocPath exists before moving on
            try {
              var statsObj =  fs.statSync(wordDocPath)
               if (statsObj) {  //check if file at worddoc path exists
             //   if (err == null) { //if no error in checking for the word file in either the old or new worktree, then the word file exists in the spot we are checking, so proceed
                    var options = {
                        styleMap: [
                            "u => u"  //by default, mammoth takes an underline, and strips it away (out of concern of getting it confused with links). The stylemap adds it back in, by making clear that an underline tag should stay as an underline tag. This tag then gets picked up in the conversionto md.
                        ]
                    };
                    turndownService.addRule('', { //catch bold
                        filter: 'strong',
                        replacement: function (content) {
                            return '<strong>' + content + '</strong>'
                        }
                    })
                    turndownService.addRule('', { //catch italics
                        filter: 'em',
                        replacement: function (content) {
                            return '<em>' + content + '</em>'
                        }
                    })
                    turndownService.addRule('', {  //catch underlines
                        filter: 'u',
                        replacement: function (content) {
                            return '<u>' + content + '</u>'
                        }
                    })
                    turndownService.addRule('', {  //strike through
                        filter: 's',
                        replacement: function (content) {
                            return '<s>' + content + '</s>'
                        }
                    })
                    turndownService.addRule('', {  //heading 1
                        filter: 'h1',
                        replacement: function (content) {
                            return '<h1>' + content + '</h1>'
                        }
                    })
                    turndownService.addRule('', {  //heading 2
                        filter: 'h2',
                        replacement: function (content) {
                            return '<h2>' + content + '</h2>'
                        }
                    })
                    turndownService.addRule('', {  //heading 2
                        filter: 'h3',
                        replacement: function (content) {
                            return '<h3>' + content + '</h3>'
                        }
                    })
                    turndownService.addRule('', {  //table
                        filter: 'table',
                        replacement: function (content) {
                            return '<table>' + content + '</table>'
                        }
                    })
                    turndownService.addRule('', {  //tr
                        filter: 'tr',
                        replacement: function (content) {
                            return '<tr>' + content + '</tr>'
                        }
                    })
                    turndownService.addRule('', {  //th
                        filter: 'td p',
                        replacement: function (content) {
                            return '<em>' + content + '</em>'
                        }
                    })
                    turndownService.addRule('', {  //th
                        filter: 'td',
                        replacement: function (content) {
                            return '<td>' + content + '</td>'
                        }
                    })

                    turndownService.addRule('', {  //th
                        filter: 'th',
                        replacement: function (content) {
                            return '<th>' + content + '</th>'
                        }
                    })
                    mammoth.convertToHtml({ path: wordDocPath }, options).then(function (result, error) { //^6. convert the word docs to html. This will be happening async--so different docs will be being converted in parallel.
                        //Note: the mammoth conversion is what slows the process of getting the results down. If you want to try to speed things up, this would be the focus
                       if (error) {
                           console.log('mammoth error = ' + error)
                       } else {
                        mammothCounter++
                        var htmlWord = result.value
                        var data = turndownService.turndown(htmlWord)
                        //now have a markdown 
                        var dataCleaned = data.replace(/<!--.*?-->/s, "");  //at this point, have converted the word doc to markdown, and removed the first commented out code that word docs have that take up a lot of space but are not necessary from the markdown version
                        var removeDocExtension = wordDocArray[i].replace(/\.[^/.]+$/, "")
                        //example file at this point: /Users/username/Desktop/git-app-test-docs/word-diff-test/383180worktree3#&7#&1#&4/main-folder/llc-agreement
                        var markDownDoc = removeDocExtension + '.md'
                        var markDownDocPathChanged = markDownDoc.replace(/\//g, '135#&579-135#&579')
                        //take the path of the word doc, and remove any "/". This is bc the forward slash means a directory. We want all the word docs for comparison to go into a temporary folder we create. If the forward slashes continue to be there, node will read them as their own directories. This means we would have to create a new directory for each of these when we run the md conversion (we do writeFile(...)--which you can only do into pre-existing directories), which would be too cumbersome. So instead we change out the forward slash for a complex code--which is the same across docs, so we can know later where we made the change, and can change back
                        if (revertTreeFunctionCounter === 1) { //based on how many times revert tree has run. if run just once, then we are in the old setting. If run twice, then we are in the new setting.   
                            var markDownDocPath = projectFolderPath + '/tempFolder7843OLD/' + markDownDocPathChanged
                        } else {
                            var markDownDocPath = projectFolderPath + '/tempFolder7843NEW/' + markDownDocPathChanged
                        }
                        writeFileFunction(markDownDocPath, dataCleaned)
                    }
                    })
             
                } else  {
                    mammothNeedsToRun = mammothNeedsToRun - 1 //because one file is not there, there is one less word doc to convert
                    var markDownDocPath = 'no-path'
                    var dataCleaned = ''
                    writeFileFunction(markDownDocPath, dataCleaned)
                } 
       
         //   })//end fs.stat
            } catch (e) {
                console.log('error in fs stat function (probably means file is not there--that is ok, just want to move on then to the next part of the function flow)= ' + e)
                mammothNeedsToRun = mammothNeedsToRun - 1 //because one file is not there, there is one less word doc to convert
                var markDownDocPath = 'no-path'
                var dataCleaned = ''
                writeFileFunction(markDownDocPath, dataCleaned)
            }

        } else { //****************************for block diff*************************
            var wordDocPath = treeOrMainPath + '/' + wordDocArray[i]
            mammoth.extractRawText({ path: wordDocPath }).then(function (result) { //^6. convert the word docs to html. This will be happening async--so different docs will be being converted in parallel.
                mammothCounter++

                var mammothResult = result.value
                var data = mammothResult
                //now have a markdown 
                var dataCleaned = data.replace(/<!--.*?-->/s, "").replace('<br>', 'HITHERE');  //at this point, have converted the word doc to markdown, and removed the first commented out code that word docs have that take up a lot of space but are not necessary from the markdown version
                var removeDocExtension = wordDocArray[i].replace(/\.[^/.]+$/, "")
                //example file at this point: /Users/username/Desktop/git-app-test-docs/word-diff-test/383180worktree3#&7#&1#&4/main-folder/llc-agreement
                var markDownDoc = removeDocExtension + '.md'
                var markDownDocPathChanged = markDownDoc.replace(/\//g, '135#&579-135#&579')
                //take the path of the word doc, and remove any "/". This is bc the forward slash means a directory. We want all the word docs for comparison to go into a temporary folder we create. If the forward slashes continue to be there, node will read them as their own directories. This means we would have to create a new directory for each of these when we run the md conversion (we do writeFile(...)--which you can only do into pre-existing directories), which would be too cumbersome. So instead we change out the forward slash for a complex code--which is the same across docs, so we can know later where we made the change, and can change back
                if (revertTreeFunctionCounter === 1) { //based on how many times revert tree has run. if run just once, then we are in the old setting. If run twice, then we are in the new setting.   
                    var markDownDocPath = projectFolderPath + '/tempFolder7843OLD/' + markDownDocPathChanged
                } else {
                    var markDownDocPath = projectFolderPath + '/tempFolder7843NEW/' + markDownDocPathChanged
                }
                writeFileFunction(markDownDocPath, dataCleaned)
            })
        }
    }
} catch(e){
    console.log('error in convert word doc = ' + convertWordDoc)
}
}

let writeFileRun = 0

async function writeFileFunction(markDownDocPath, dataCleaned) {
    try {
    var folderOld = projectFolderPath + '/tempFolder7843OLD/'
    var folderNew = projectFolderPath + '/tempFolder7843NEW/'
    if ((markDownDocPath) && (markDownDocPath !== 'no-path')) { //it would be no-path if there is not a word doc at this location (because there either wasn't an old version, or not a new version, of that word doc). So no need to write the file in that case. We still are in this function irrespective to keep going with the flow of comparing all word docs that need to be compared
        writeFile(markDownDocPath, dataCleaned, (err) => {//^7. send the file to the temp folder
            writeFileRun++
            console.log('write file run = ' + writeFileRun)
            console.log('numberOfWordDocsToConvert = ' + numberOfWordDocsToConvert)
            console.log('mammoth counter = ' + mammothCounter)
            console.log('mammoth needs to run = ' + mammothNeedsToRun)
            console.log('revert tree function counter = ' + revertTreeFunctionCounter)
            //NOTE: after revert tree function has been run twice, we look again at whether the word file is in the new tree. (it might or might not have been in the old tree). As a result, these numbers can change, becasue we could remove items from mammoth needs to run and numberofdocs to convert
            if (err) {
                console.log('error in write file action = ' + err)
            } else {
                //let oldFolderLength = fs.readdirSync(folderOld).length
                //if ((oldFolderLength === numberOfWordDocsToConvert) && (writeFileRun === numberOfWordDocsToConvert) && (revertTreeFunctionCounter < 2)) { //use to be that I wanted to be sure the old folder had enough docs in it prior to moving on--but, how to know how many docs should be there when there might not be an old or new version of the docs, which changes the number that needs to be in the old or new folder
                if ((writeFileRun >= numberOfWordDocsToConvert) && (revertTreeFunctionCounter < 2)) {
                    //finished older conversion, now do the second conversion for the later version
                    revertTree(treeName, laterCommitNumber)
                } else {
                    //  let newFolderLength = fs.readdirSync(folderNew).length
                    // if ((newFolderLength === numberOfWordDocsToConvert) && (oldFolderLength === numberOfWordDocsToConvert) && (mammothCounter === mammothNeedsToRun) && (writeFileRun === mammothNeedsToRun)) {
                    if (writeFileRun >= mammothNeedsToRun) {
                        //at this stage, we should have determined how many files 
                        //done converting all word docs. Should have all word docs converted to md docs and in the temp folders. Ready for next step
                        //in theory, we should know we are done when newFolderLength = numberOfWordDocsToConvert. However, in testing, this number seemed to increase faster than having the workable docs in there. Not clear why. So I've added these additional checks to be sure that we only run the diff on the folders after the folders are ready
                        diffTheTempFolders()
                    } else {
                        //still needs to run mammoth convert function
                    }
                }
            }
        })
    } else { //don't need to write the file (because no file there), but still move on.
        writeFileRun++
        console.log('5^^ dont write the file and do move on')
        console.log('write file run = ' + writeFileRun)
        console.log('numberOfWordDocsToConvert = ' + numberOfWordDocsToConvert)
        console.log('mammoth counter = ' + mammothCounter)
        console.log('mammoth needs to run = ' + mammothNeedsToRun)


        
        //let oldFolderLength = fs.readdirSync(folderOld).length
        //if ((oldFolderLength === numberOfWordDocsToConvert) && (writeFileRun === numberOfWordDocsToConvert) && (revertTreeFunctionCounter < 2)) { //use to be that I wanted to be sure the old folder had enough docs in it prior to moving on--but, how to know how many docs should be there when there might not be an old or new version of the docs, which changes the number that needs to be in the old or new folder
        if ((writeFileRun >= numberOfWordDocsToConvert) && (revertTreeFunctionCounter < 2)) {
            //finished older conversion, now do the second conversion for the later version
            revertTree(treeName, laterCommitNumber)
        } else {
          //  let newFolderLength = fs.readdirSync(folderNew).length
           // if ((newFolderLength === numberOfWordDocsToConvert) && (oldFolderLength === numberOfWordDocsToConvert) && (mammothCounter === mammothNeedsToRun) && (writeFileRun === mammothNeedsToRun)) {
            if (writeFileRun >= mammothNeedsToRun) {
                //done converting all word docs. Should have all word docs converted to md docs and in the temp folders. Ready for next step
                //in theory, we should know we are done when newFolderLength = numberOfWordDocsToConvert. However, in testing, this number seemed to increase faster than having the workable docs in there. Not clear why. So I've added these additional checks to be sure that we only run the diff on the folders after the folders are ready
                diffTheTempFolders()
            } else {
                //still needs to finish running the mammoth convert function
            }
        }
    }
} catch(e){
    console.log('error in write file function = ' + e)
}
}

    async function diffTheTempFolders() {
        try {
        var folderOld = projectFolderPath + '/tempFolder7843OLD/'
        var folderNew = projectFolderPath + '/tempFolder7843NEW/'
        if (showFullDoc === false) {
            var uOption = '-U' //default git diff U, showing 3 lines of context around a change
        } else {
            var uOption = '-U9999999' //goal is to show the whole doc, so show all lines of content 
        }
        try {
            await git.cwd(projectFolderPath).then(result => {
            })
            if (diffBlocks === false) { //*****************INTEGRATED DIFF***************** */
                await git.raw('diff', '--no-index', '--word-diff', uOption, folderOld, folderNew, (error, result) => {
                    if (result){
                        var red = result.replace(/\[-/g, '<del style="color: #c00">')//.replaceAll('<del style="color: #c00"><', '<')
                        var endred = red.replace(/-]/g, '</del>')
                        //var green = endred.replace(/{\+/g, '<ins style="color: #0c0">')//lighter green color
                        //var green = endred.replace(/{\+/g, '<ins style="color: #009900">') //dark green color
                        var green = endred.replace(/{\+/g, '<ins style="color: #0066cc; font-weight: bold">')  //blue color
                        var endgreen = green.replace(/\+}/g, '</ins>')
                        //var endgreen2 = endgreen1.replaceAll('**_', '<span style="font-weight: bold">').replaceAll('_**', '</span>')
                        // var endgreen = endgreen2.replaceAll('**_', '<span style="font-weight: bold">').replaceAll('_**', '</span>')
                        var resultArray = endgreen.split('diff --git a/')
                        for (var i = 1; i < resultArray.length; i++) {
                            var fileNameRaw = resultArray[i].split(" ")[0]
                            var fileName1 = fileNameRaw.replace('135#&579-135#&579', '/')  //show original folder structure
                            if (fileName1.includes("tempFolder7843OLD/")) {
                                var fileName2 = fileName1.split("tempFolder7843OLD/").pop() //to show the file name without the tempFolder and preceding stuff, that would be confusing to view.
                            } else {
                                var fileName2 = fileName1.split("tempFolder7843NEW/").pop()
                            }
                            var fileName = fileName2.slice(0, -3) //remove md extension name in the id so that it can link to the header (which is a word doc filename with extension removed)
                            var firstOccurence = resultArray[i].indexOf("@@") //get the index of first occurence of "@@"
                            var secondOccurence = (resultArray[i].indexOf("@@", firstOccurence + 1))//get the index of "@@", starting from the first occurence (in other words, get the second occurence)
                            var showResults1 = resultArray[i].substring((secondOccurence + 2)) //show the substring starting at the second occurence+2 (because its two characters, so start where they begin, then add two)
                            var breaks = /\@\@(.*?)\@\@/gm;
                            var showResults = showResults1.replace(breaks, '[.........]<br>')
                            var contents = `
                            <hr style="width: 95%; border: 2px solid  #32cd53; margin-bottom: 15px; margin-top: 15px; margin-left: 0px; border-radius: 15px;">
                            <div id=${fileName}>
                                <div style="font-weight: bold; font-size: 14pt; margin-top: 0px; margin-bottom: 2px;  white-space: pre-wrap">${fileName}</div>
                                <div style="white-space: pre-wrap">${showResults}</div>
                            </div>
                            `
                            if (showFullDoc === false) {
                                document.getElementById('showDiff').insertAdjacentHTML('beforeend', contents)
                            } else {
                                document.getElementById('showDiff').style.display = 'none'
                                document.getElementById('showFullFile').insertAdjacentHTML('afterbegin', contents)
                                document.getElementById('backToSummaryButton').style.display = "inline-block"
                                document.getElementById('backToSummaryButton').addEventListener('click', () => {
                                    document.getElementById('showDiff').style.display = "inline-block"
                                    document.getElementById('showFullFile').innerHTML = ''
                                    document.getElementById('backToSummaryButton').style.display = "none"
                                })
                            }
                        }
                    } //end if result
                    removeWorkTreeFromWordComparison()
                })
            } else { /*****************BLOCK DIFF*************************** */
                await git.raw('diff', '--no-index', uOption, folderOld, folderNew, (error, result) => {
                    if (showFullDoc === false) {
                        doTopDiffFunction(result, 'summary')
                    } else {
                        doTopDiffFunction(result, 'full')
                    }
                    removeWorkTreeFromWordComparison()
                })
            }

        } catch (error) {
            console.log('error in comparing the temporary folders = ' + error)
        }
    } catch(e){
        console.log('error in diff the temp folders = ' + e)
    }
    }

    async function removeWorkTreeFromWordComparison() {
        fs.readdir(projectFolderPath, (err, files) => {
            if (err) {
                console.log(err)
            } else {
                files.forEach(file => {
                    if (file.includes('worktree3#&7#&1#&4')) {
                        git.raw('worktree', 'remove', file, '--force').then((result) => {
                            git.raw('worktree', 'prune')
                            var folderOld = projectFolderPath + '/tempFolder7843OLD/'
                            var folderNew = projectFolderPath + '/tempFolder7843NEW/'
                            fs.rm(folderOld, { recursive: true }, (err) => {

                                if (err) {
                                    //error here could occur if there are left over worktrees that haven't been removed before running the new function (example: worktree created to do a word comparison, but app stopped before complete). If mroe than one worktree left over, would then run the remove the old temp folder twice. In that case, the temp folder won't be there on the second run through, creating an error. However, this catches the error, so no concern
                                } else {
                                    //tempfolderold deleted
                                }
                            })
                            fs.rm(folderNew, { recursive: true }, (err) => {
                                if (err) {
                                    //error in removing temp folder. could be bc tempfolder already removed.
                                } else {
                                    //tempfolder new deleted
                                }
                            })
                        })
                    }
                })
            }
        })
    }








    /****************BLOCK DIFF***************************** */

    /**********NOTE: REMOVED BUTTON FOR NOW (Aug20,2021) TO JUST DO THE INTEGRATED DIFF. THat seems more natural for non-coders, and I prefer to simplify for now. Simplify choices for users, and simplify coding requirements */

    async function gitDiffFunctionBlock() { //for file summary [full file handled under diffSingleFile()]
        diffIntegrated = false
        diffBlocks = true
        wordDocsArray = []
        let areThereWordDocs = false
        laterCommitNumber = laterVersionInfo.commitNumber
        earlierCommitNumber = earlierVersionInfo.commitNumber
        try {
            await git.cwd(projectFolderPath).then(result => {
                // console.log('cwd resultss' + JSON.stringify(result))
            })

            if (laterCommitNumber !== 'current-changes') {
                await git.raw('diff', earlierCommitNumber, laterCommitNumber).then(result => {
                    doTopDiffFunction(result, 'summary')
                    var resultArray = result.split('diff --git a/')
                    wordDocsTopArray = []
                    for (var i = 0; i < resultArray.length; i++) {
                        var fileName = resultArray[i].split(" ")[0] //get the filename
                        if (path.extname(fileName).includes('doc')) {
                            //we have a word doc here
                            if (fileName.substring(0, 2) !== '~$') {
                                areThereWordDocs = true
                                wordDocsArray.push(fileName)
                            }
                        }
                    }
                    if (areThereWordDocs === true) {
                        startWordDiffProcess() //if there are word docs in the changed files, run the function to convert those to md and show the changes among those
                    }
                })
            } else {
                await git.raw('diff', earlierCommitNumber).then(result => { //current changes v earlier commit
                    doTopDiffFunction(result, 'summary')
                    var resultArray = result.split('diff --git a/')
                    wordDocsTopArray = []
                    for (var i = 0; i < resultArray.length; i++) {
                        var fileName = resultArray[i].split(" ")[0] //get the filename
                        if (path.extname(fileName).includes('doc')) {
                            //we have a word doc here
                            if (fileName.substring(0, 2) !== '~$') {
                                areThereWordDocs = true
                                wordDocsArray.push(fileName)
                            }
                        }
                    }
                    if (areThereWordDocs === true) {
                        startWordDiffProcess() //if there are word docs in the changed files, run the function to convert those to md and show the changes among those
                    }
                })
            }
        } catch (e) {
            console.log('error in git diff top function = ' + e)
        }
    }
    var topDiffCounter = 0
    async function doTopDiffFunction(result, type) {
        topDiffCounter++
        var removeLaterListCounter = 0
        try {
            const Diff2html = require('diff2html');
            const diffJson = await Diff2html.parse(result);
            const diffString = result
            const diffHtml = await Diff2html.html(diffJson, { drawFileList: true, diffStyle: 'word' });
            var contents = await diffHtml

            //NOTE: IN the block diff situation, steps: 1. show the whole diff, 2. get the files from the diff TOC, and 3. adjust file listing. In the integrated diff, steps: 1. run summary diff to show file names, and show them, then 2. run diff, and show full diff.
            //Why the difference? In the block diff, we use diff2html, which does the file TOC automatically. So we show the whole diff first (including the doc TOC), then get the filenames from the TOC In the integrated diff, we need to produce the file TOC with a separate diff -name-only process. 

            /****SHOW THE DIFF******* */
            if (type === 'summary') {
                document.getElementById('showDiff').insertAdjacentHTML('beforeend', contents)
            } else {
                document.getElementById('showDiff').style.display = 'none'
                document.getElementById('showFullFile').insertAdjacentHTML('afterbegin', contents)
                document.getElementById('backToSummaryButton').style.display = "inline-block"
                document.getElementById('backToSummaryButton').addEventListener('click', () => {
                    document.getElementById('showDiff').style.display = "inline-block"
                    document.getElementById('showFullFile').innerHTML = ''
                    document.getElementById('backToSummaryButton').style.display = "none"
                })
            }

            /***MANIPULATE THE FILE LISTING AT THE TOP***/
            if (topDiffCounter < 2) { //we can run this function at least twice in the case that there are normal docs and micro-word docs; but we only want to adjust the TOC once.
                var tocFiles = document.querySelectorAll('.d2h-file-list-line')
                for (var i = 0; i < tocFiles.length; i++) {
                    var selectedDiv = tocFiles[i] //this is the TOC file listing
                    var fileNameDiv = selectedDiv.querySelector('.d2h-file-name')
                    var fileName = fileNameDiv.textContent
                    if (path.extname(fileName).includes('doc')) {
                        var newId = '#' + fileNameDiv.textContent.replace('.docx', '').replace('.doc', '')
                        // fileNameDiv.href = '#' + cleanName
                        //var fileListHeader = selectedDiv.closest('.d2h-file-list')
                        // fileListHeader.insertAdjacentElement('beforeend', selectedDiv)
                        let contents = `
                    <div>
                    <span><a href="${newId}">${fileName}</a></span>
                    <span class="showThisDocClass" onclick='diffSingleFile("${fileName}")'>Show Full Document</span>
                    </div>`
                        document.getElementById('diffFileNameSummary').insertAdjacentHTML('beforeend', contents)
                    } else {
                        var newId = '#' + fileName
                        let contents = `
                    <div>
                    <span><a href="${newId}">${fileName}</a></span>
                    <span class="showThisDocClass" onclick='diffSingleFile("${fileName}")'>Show Full Document</span>
                    </div>`
                        document.getElementById('diffFileNameSummary').insertAdjacentHTML('afterbegin', contents)

                    }
                }

                if (fileNameDiv.textContent.includes('tempFolder7843NEW')) {
                    removeLaterListCounter++
                    if (removeLaterListCounter === 1) {
                        selectedDiv.closest('.d2h-file-list-wrapper').remove()
                        //this will remove the toc div for the converted word docs. Why? diff2html immediately prints a TOC of docs, prior to our converting the word docs. We have manipulated that to reference the converted word docs, so we already have a TOC. After the conversion is done, diff2html would print a second toc for the new word docs (because we run doTopDiffFunction twice, and append the contents into #showDiff above). So without further action, there would be two TOCs. This remove() action removes the second TOC.
                        //we want to run it only once, because there is only one TOC to remove. Otherwise, it would run for each file into the tocFiles array, which is unecessary (maybe harmless, but def unnecessary)
                    }
                }
            }

            /****ADJUST FILE NAME BEFORE DIFF IF FROM A WORD CONVERSION****** */
            var fileHeaders = document.querySelectorAll('.d2h-file-wrapper .d2h-file-name')
            //remove reference to tempfolders and remove .md extension for any file that is from a word conversion to md.
            for (var i = 0; i < fileHeaders.length; i++) {
                let fileHeader = fileHeaders[i]
                if (path.extname(fileHeader.textContent).includes('doc')) {
                    fileHeader.closest(".d2h-file-wrapper").style.display = 'none'
                }
                if (fileHeader.textContent.includes('tempFolder7843NEW')) {
                    let currentContent = fileHeader.textContent
                    let clean1 = currentContent.split('tempFolder7843NEW}/')[1]
                    let clean2 = clean1.replace('135#&579-135#&579', '/').replace('.md', '') //this is the file name, without reference to temp folder, and without extension name
                    fileHeader.textContent = clean2
                    fileHeader.closest(".d2h-file-wrapper").id = clean2 //change the id to the file name, so can link to it from the TOC, which has the href = the file

                }

            }
        } catch (e) {
            console.log('error in doTopDiffFunction = ')
            console.log(e)
        }
    }
