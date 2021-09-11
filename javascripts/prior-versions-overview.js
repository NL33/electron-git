const { ipcRenderer } = require('electron')
const { writeFile, fstat } = require('fs')
const fs = require("fs")
const simpleGit = require('simple-git')
const git = simpleGit()

var projectFolderPath
var projectFolderName

var resultArray
/***NEXT:
--just did styling for showing either compare versions or open versions in same window
--next: close prior version window when run show changes
--next: styling of compare versions window, borrowing from saved versions window (box shadow and larger window)
--then, run compare changes and issue spot that.
--then, colored icons for main window

 */

window.onload = function () {
    projectFolderPath = window.process.argv.slice(-2)[0]
    projectFolderName = window.process.argv.slice(-2)[1]
    viewPriorVersionsFunction()
    document.getElementById('projectName').textContent = projectFolderName
    document.getElementById('projectNameCompare').textContent = projectFolderName
    document.getElementById('processingMessage').style.display = 'none'
    document.getElementById('showPriorVersions').style.display = 'block'
}

function openPriorVersionsFunction() {
    console.log('clicked')
    document.getElementById('showPriorVersions').style.display = 'block'
    document.getElementById('showViewPriorVersionsForCompare').style.display = 'none'
}
var compareRun = false

function compareVersionsFunction() {
    document.getElementById('showPriorVersions').style.display = 'none'
    if (compareRun === false) {
        showCompareChangesFunction(resultArray)
        compareRun = true
    } else {
        document.getElementById('showViewPriorVersionsForCompare').style.display = 'block'
    }
}

async function viewPriorVersionsFunction() {
    document.getElementById('showPriorCommits').innerHTML = ''
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.log().then(result => {
            resultArray = result.all
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



/*******************COMPARE CHANGES************** */


async function showCompareChangesFunction(resultArray) {
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
    }
    catch (e) {
        console.log('error in show versions to compare = ' + e)
        if (e.toString().indexOf('not a git repository') > -1) {
            alert('To Compare Changes, please first save a project version.')
        } else {
            //   alert('Sorry, there was an error in comparing changes. Please try again.')
        }
    }
}

function selectVersionToViewChanges(event, commitNumber, versionNumber, showDate, showTime, versionMessage) {
    //Info on how this works:
    //To keep track of which versions are selected, we give them one of two ids: selectedChangeId1 and selectedChangeId2. The numbers on these ids do NOT correspond to which version is earlier and which is later. The numbers are there to just identify which versions are selected. When a new version is selected, the numbers shift, so that the new selection becomes selectedChangeId1, the prior selectedChangeId1 becomes selectedChangeId2, and the prior selectedChangeId2 loses its selection.
    //After the selection numbers are sorted out, then there is a separate process to determine which version will be listed as later (newer) and which as earlier(older). This process is redone every time there is a selection.

    //***MAKE SURE THE ID IS LINKED TO THE OVERVIEW CLASS OF THE ELEMENT (no matter where it was clicked) ********/
    document.getElementById('selectVersionsHeader').style.display = 'none'
    document.getElementById('savedVersionsOverview').style.marginTop = '40px'
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
        //   alert('Sorry, there was an error in comparing changes. Please close this item and try again.')
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



