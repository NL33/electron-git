const { ipcRenderer, ipcMain, clipboard, remote } = require('electron')
const { writeFile, fstat } = require('fs')
const fs = require("fs")
const simpleGit = require('simple-git')
const git = simpleGit()

var projectFolderPath
var projectFolderName
/***NEXT:

3. then, add compare versions to overview window
 */

window.onload = function () {
    projectFolderPath = window.process.argv.slice(-2)[0]
    projectFolderName = window.process.argv.slice(-2)[1]
    viewPriorVersionsFunction()
    document.getElementById('projectName').textContent = projectFolderName
    document.getElementById('processingMessage').style.display = 'none'
    document.getElementById('showPriorVersions').style.display = 'block'
}

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
            if (item.includes('worktree3a7c1e4g7')) { //if a folder exists that matches the worktree naming convention
                removeWorkTree(item)
            }
        })

        //done removing any existing worktree

        //now move on
        //create worktree, with different name then before
        var randomNumber = Math.floor(Math.random() * 10000)
        var randomMultiple = Math.floor(Math.random() * 500)
        var theNumber = randomNumber * randomMultiple
        treeName = theNumber.toString() + 'worktree3a7c1e4g7'
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


/***REMOVE WORK TREE *********/
//this action is normally taken care of in main-window.js--when the old version window (where the old version files are shown, not this overview window) main.js sends call to the main window to close the worktree. This function is here mostly for error catching--if you try to open another showoldversion window when another one already exists--that shouldn't be possible, but in case something weird happened on startup or the like:
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

