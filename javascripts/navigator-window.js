const { exec, execFile, spawn, spawnSync } = require('child_process');
const { macActive, chromeTabs, macFocusWindow, macFocusAppName, macFocusChromeTab, macCloseWindow, macCloseApp, macCloseChromeTab } = require('../scripts/navigator-jxa');
const { searchKeyDown, keyDownFunction } = require('../scripts/navigator-keyboard-functions')
const addIcons = require('../scripts/navigator-add-icons');
const { ipcRenderer, ipcMain } = require('electron')
menuFunction()
var activeApps = []
var theTabs = ''
var chromeFunctionRun = 0
var columnChoice
var chromePosition = 'n/a'
var newWindow = 'yes'
var chromeApps
var hideNavWindowVar = false
var runIconError
var okToRunStartLoop = true
var refreshNumber = 0  //this number is added to the id of next items, so windows are added to the right apps (the apps that are new on that refresh)
var chromeTabResults = [] /*Chrome tab results is an array where we put the tab results from the chromeFunction. In the chromeFunction, each Chrome window returns an array of its tabs. For each window, we put its array in chromeTabResults. And each tab is itself an array. So, chromeTabResults is an array = 
[
  {
  [window0 tab 0], [window0 tab1]...
}, 
{
  [window1 tab0], [window1, tab1]...
}
]
*/
startLoop()

window.onload = function(){
    document.getElementById('nameSearch').focus()//addEventListener('keydown', searchKeyDown)
}
/**Hide Nav when hover away from it, but only after successfully focused on a window eachtime; so=hover away one time, then stop hover functionality, until start again after successfully focus a window********************/
async function hideNavWindow() {
    document.getElementById('nameSearch').textContent = ''
    activeElementText = ''
    //clear search
    //document.getElementById('nameSearch').textContent = '' //NOTE: this is a slower process--so it makes it appear there is a delay in clearing the search results. Seems to (possibly) only makea difference when you call for the nav window while another process--like a prior window that has been called--is loading. If the prior called window is done loading, then (possibly) the clearing out process looks smooth
    var hiddenDivs = document.querySelectorAll('.hideDiv')
    for (var c = 0; c < hiddenDivs.length; c++) {
        hiddenDivs[c].classList.remove('hideDiv')
    }
   // setTimeout(() => {
        ipcRenderer.send('minimize-nav-window', '')
    //}, 1);
    
    /* NOTE: This code below is from when the flow was: 1. select app/window/tab to focus on and 2. only when THEN move mouse off nav window, hide the nav window. You wouldneed to set hideNavWindowVar to true in the focus app/window/tab functions. This worked well. Issue was that if you were not using your mouse, and just using keys, this would not be called. So you would select an item to focus on, and nav window would stay.
    window.addEventListener('mouseout', goFunction = function (evt) {
        if (hideNavWindowVar === true) {
            if (evt.toElement == null && evt.relatedTarget == null) {
                console.log('hover away now')
                hideNavWindowVar = false
                document.getElementById('nameSearch').textContent = ''
                var hiddenDivs = document.querySelectorAll('.hideDiv')
                for (var c = 0; c < hiddenDivs.length; c++) {
                    console.log('remove hidden divs')
                    hiddenDivs[c].classList.remove('hideDiv')
                }
                ipcRenderer.send('minimize-nav-window', '')
                window.removeEventListener('mouseout', goFunction)
               
            }
        }
    });
    */
}

/*****LOAD APPS, WINDOWS, AND TABS ***************/

var activeElementText = ''

ipcRenderer.on('run-loop-function', (event, arg) => {
    document.getElementById('nameSearch').focus() //goal here is that whenever the navigator window goes from hidden to in view, the search box is focused
   if (okToRunStartLoop){
        startLoop()
   }
})

ipcRenderer.on('hide-nav-window', (event, arg) => {
    //clear search
    document.getElementById('nameSearch').textContent = ''
    var hiddenDivs = document.querySelectorAll('.hideDiv')
    for (var c = 0; c < hiddenDivs.length; c++) {
        hiddenDivs[c].classList.remove('hideDiv')
    }
})

function minimizeWindow() { //currently not called--instead of closing when you focus on a window, now close either: 1. when navigate off window or 2. when do keycode to call it up
    ipcRenderer.send('minimize-nav-window', '')
}

async function startLoop() {
    window.addEventListener('error', function (e) {
       // console.log('we got an error in the taboos = ' + e);
        if (e.target.classList.contains('chromeTabIcon')){
           // if (!e.target.parentElement.parentElement.parentElement.classList.contains('oldApp')){
                chromeImageError(e)
         //   }
        }
    }, true);
    okToRunStartLoop = false
    document.getElementById('errorMessage').textContent = ''
    try {
        console.log('*****run start loop')
        hideNavWindowVar = false
        chromeApps = 0
        ipcRenderer.send('focus-the-window', '')
        await loop()

        //this is to catch errors in loading chrome tabs
        var tabIcons = document.querySelectorAll('.chromeTabIcon')
        for (var aa = 0; aa < tabIcons.length; aa++) {
            var id = tabIcons[aa].id
            document.getElementById(id).addEventListener('error', chromeImageError)
        }

        console.log('***Done with loop')
        if (newWindow === 'yes') {
            document.getElementById('loadingMessage').style.display = 'none'
            document.getElementById('breatheOverviewDiv').style.display = 'none'
            document.getElementById('nameSearch').style.display = 'block'
           document.getElementById('nameSearch').focus()
        }

        var tApps = document.querySelectorAll('.appOverview')
        activeElementText = document.activeElement.textContent //get currently focused element right before we transition to the updated results. And then below (where we check "matched") focus that element after the new results show
        for (var j = 0; j < tApps.length; j++) {
            var el = tApps[j]
            if (!el.children[1].classList.contains('chromeNextItems')) {
                if (el.classList.contains('oldApp')) {
                    el.remove()
                } else {
                    el.classList.remove('hideWhileLoading')
                }
            } else {
                chromeApps++
                if (chromeApps > 1) {
                    el.remove()
                    
                    //Goal: Each time you refresh the page, leave the first chrome app, and remove the others. Why?
                    //chrome tabs get added to the first chrome app window that appears.
                    //so above, that removes the first chrome app, which gets rid of all the tabs under it.
                    //So don't get rid of that first chrome app. But leave the others.
                    
                } else {
                    el.classList.remove('hideWhileLoading')
                    el.classList.remove('oldWindow')
                }
            }
        }

        var tWindows = document.querySelectorAll('.windowName')
        for (var s = 0; s < tWindows.length; s++) {
            var el = tWindows[s]
            if (el.classList.contains('oldWindow')) {
                el.remove()
            } else {
                el.classList.remove('hideWhileLoading')
            }
        }

        var tTabs = document.querySelectorAll('.tabOverview')
        for (var b = 0; b < tTabs.length; b++) {
            var el = tTabs[b]
            if (el.classList.contains('oldTab')) {
                el.remove()
            } else {
                el.classList.remove('hideWhileLoading')
            }
        }

        if (newWindow !== 'yes') {
            document.getElementById('theTitle').textContent = 'Navigator'
            var matched = 'no'
            var divs = document.querySelectorAll('span')
            if (activeElementText.length > 0) {
                for (var m = 0; m < divs.length; m++) {
                    if (divs[m].textContent.trim() === activeElementText.trim()) {
                        divs[m].parentElement.focus()
                        matched = 'yes'
                        break
                    }
                }
            }
            if (matched === 'no') {
                document.getElementById('nameSearch').focus()
            }
        }
     
        if (document.getElementById('nameSearch').textContent.length > 0) {
            searchNamesFunction()
        }
        newWindow = 'no' //at end of first loading, change newWindow to 'no'. it will stay like that until another closing and reopening of app
        ipcRenderer.send('nav-loading-complete', '')
        okToRunStartLoop = true
    } catch (e) {
        console.log('error in start loop function = ' + e)
        var theMessage1 = `Looks like the Navigator encountered an error when starting up.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
        var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
        document.getElementById('errorMessage').textContent = theMessage
    }
}


/***************** LOOP FUNCTION ***************************** */
async function loop() {
    try {
        if (newWindow === 'yes') { //new window = app has just been opened, so a full loading
            document.getElementById('loadingMessage').style.display = 'block'
            document.getElementById('breatheOverviewDiv').style.display = 'block'
            document.getElementById('nameSearch').style.display = 'none'
        } else {
            refreshNumber++
            document.getElementById('theTitle').textContent = 'Updating ...'
        }

        var theApps = document.querySelectorAll('.appOverview')
        for (var w = 0; w < theApps.length; w++) {
            theApps[w].classList.add('oldApp')
        }

        var theWindows = document.querySelectorAll('.windowName')
        for (var t = 0; t < theWindows.length; t++) {
            theWindows[t].classList.add('oldWindow')
        }

        var theTabs = document.querySelectorAll('.tabOverview')
        for (var k = 0; k < theTabs.length; k++) {
            theTabs[k].classList.add('oldTab')
        }

        getChromePosition()
        getColumnPreference()

        try {
            activeApps1 = await macActive(chromePosition).then(d => JSON.parse(d));
            chromeFunctionRun = 0
            activeApps = await addIcons(activeApps1,  'icons');
            if (!activeApps) {
                activeApps = activeApps1
            }
        } catch (e){
            console.log('error in loop getting apps = ' + e)
            var theMessage1 = `Looks like the Navigator encountered an error getting your app info.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
            var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
            document.getElementById('errorMessage').textContent = theMessage
        }

      
        for (var i = 0; i < activeApps.paths.length; i++) { //Get name of all apps and put it into DOM
            try {
            var appNameRaw = activeApps.paths[i].replace(/:+$/, '').replace(/:/g, '/').replace('MacOS', '').replace('.app', '')
            var appName = appNameRaw.split('/').at(-1)
            var unixId = activeApps.unixId[i]
            var indexId = 'index=' + i
            var icon = '../' + activeApps.icons[i] 
            var iconId = 'iconId='+indexId + '+' + refreshNumber + '**' + appName
            var nextItemsId = 'nextItems+' + indexId + '+refreshNumber=' + refreshNumber
            if (appName.includes("Race to Saturn")){
                var source = '../assets/rts-iconr.png'
                var iconContent = `
                     <img style="height: 37px; width: 37px; vertical-align: middle" id="${iconId}" notChromeTab" src="${source}"></  img>
                `
            } else if (!icon){ 
                var appNameArray = appName.trim().split(' ')
                var firstLetter = appNameArray.at(-1).charAt(0)
                var iconContent = `
                  <span class="appIconSub" id="${iconId}">${firstLetter}</span>
                `
            } else if (icon.indexOf('undefined') > -1) {
                var appNameArray = appName.trim().split(' ')
                var firstLetter = appNameArray.at(-1).charAt(0)
                var iconContent = `
                  <span class="appIconSub"  id="${iconId}">${firstLetter}</span>
                `
            } else {
                var iconContent = `
            <img style="height: 37px; width: 37px; vertical-align: middle" id="${iconId}" notChromeTab" src="${icon}"></img>
            `
             }

            if ((appName.trim().toLowerCase().includes('google chrome')) || (appName.trim().toLowerCase().includes('googlechrome'))) {
                var extraClass = 'chromeNextItems'

            } else {
                var extraClass = "nonChromeNextItems"
            }
            var content = `
            <div id="${indexId}" class="appOverview hideWhileLoading">
            <div tabindex="1" class="appDetails  thisAppName keyTabHere" >
                ${iconContent}
                <span style="margin-left: 3px; cursor: pointer" class="appName names" >${appName}</span>
            </div>
            <ul class="nextItems ${extraClass}" id="${nextItemsId}"></ul>
            </div>
  `
            if (chromePosition === 'chromeLast') { //change order depending on selection of chrome position
                if (extraClass === 'chromeNextItems') {
                    document.getElementById('showResults').insertAdjacentHTML('beforeend', content)
                } else {
                    document.getElementById('showResults').insertAdjacentHTML('afterbegin', content)
                }
            } else {
                if (extraClass === 'chromeNextItems') {
                    document.getElementById('showResults').insertAdjacentHTML('afterbegin', content)
                } else {
                    document.getElementById('showResults').insertAdjacentHTML('beforeend', content)
                }
            }

            var iconImage = document.getElementById(iconId)
            iconImage.addEventListener('error', imageError)
            iconImage.appName = appName
            var element = document.querySelector('.thisAppName')
            element.addEventListener('click', focusApp)
            element.addEventListener('keydown', keyDownFunction)
            var children = element.children
            element.name = appName
            element.unixId = unixId
            element.parentId = indexId
            element.status = 'app'
            element.classList.remove('thisAppName')
            for (var l = 0; l < children.length; l++) {
                var child = children[l]
                child.name = appName
                child.unixId = unixId
                child.parentId = indexId
                child.status = 'app'
            }
            } catch(e){
                var theMessage1 = `Looks like the Navigator encountered an error loading your apps and windows.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
                var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
                document.getElementById('errorMessage').textContent = theMessage
            }
        }

        for (var j = 0; j < activeApps.windows.length; j++) { //for each app  (j = app number):
            var windows = activeApps.windows[j]
            var appNameRaw1 = activeApps.paths[j].replace(/:+$/, '').replace(/:/g, '/').replace('MacOS', '').replace('.app', '')
            var appName1 = appNameRaw1.split('/').at(-1)
            var unixId = activeApps.unixId[j]
            var position = activeApps.windows[j]
            if (windows != null) {
                if ((windows.length > 0) && (windows != 'undefined')) {
                    for (var k = 0; k < windows.length; k++) {  //get the windows of each app, and put it into DOM (k = window number within app)
                        let window = windows[k]
                        let windowShow = window
                        if (window){
                            if (window.indexOf('—') > -1) {
                                let windowArray = window.split('—')
                                let windowFirst = windowArray[1]
                                let windowSecond = windowArray[0]
                                windowShow = windowFirst + ' — ' + windowSecond

                            }
                        }
                        if (window != null) {
                            if ((window.length > 0) && (window != 'undefined') && (!window.startsWith('Find in page'))  && ( window !== 'Updating ...')) {
                                /*Why include "window doesn't start with "Find in Page"? The Find in page window shows up in chrome if you are doing a control+f / search on the page. The Mac treats it as it's own window. So it would show up in the results, but be confusing to the user (who wouldn't expect the find box to be a window) and makes it complicated to focus correctly. So I've removed it
                                Why not updating: to prevent the RtS window showing up with title "Updating", which was confusing people*/
                                var content = `
                                <li class="thisOne windowName windowTabName names notChromeTab keyTabHere hideWhileLoading" tabindex="1"><span style="color: black; margin-left: -7px">${windowShow}</span></li>
                        `
                                if ((appName1.toLowerCase().includes('google chrome')) && ((window.toLowerCase().includes('google chrome')) || (window.includes('googlechrome')))) {
                                    await chromeFunction(j, k, unixId, window)
                                } else {
                                    var nextItemsId = 'nextItems+' + 'index=' + j + '+refreshNumber=' + refreshNumber //why refresh number? Because nextItemsId without it would be just the index number of the app itself; and on refresh, there can be two entries for the app at the time the windows are loaded. So the window will be added to the first id--the first app appearance, and this app is removed 
                                    document.getElementById(nextItemsId).insertAdjacentHTML('beforeend', content)
                                    var element = document.querySelector('.thisOne')
                                    element.addEventListener('click', focusWindow)
                                    element.addEventListener('keydown', keyDownFunction)
                                    element.appName = appName1
                                    element.name = window
                                    element.number = k
                                    element.unixId = unixId
                                    element.parentId = nextItemsId
                                    element.status = 'window'
                                    document.querySelector('.thisOne').classList.remove('thisOne')
                                    var children2 = element.children
                                    for (var l = 0; l < children2.length; l++) {
                                        var child = children2[l]
                                        child.appName = appName1
                                        child.name = window
                                        child.number = k
                                        child.unixId = unixId
                                        child.parentId = nextItemsId
                                        child.status = 'window'
                                    }
                                }
                            }
                            }
                        }
                    }
            } else {
                // console.log('no windows')
                document.getElementById('index=' + j).style.display = 'none'
                if (newWindow === 'yes') {
                    document.getElementById('loadingMessage').style.display = 'none'
                    document.getElementById('breatheOverviewDiv').style.display = 'none'
                    document.getElementById('nameSearch').style.display = 'block'
                    document.getElementById('nameSearch').focus()
                }
            }
        }
    } catch (e) {
        console.log('error in loop function generally = ' + e)
        var theMessage1 = `Looks like the Navigator encountered an error gathering your app info.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
        var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
        document.getElementById('errorMessage').textContent = theMessage
    }
}

/****************** END LOOP FUNCTION ************************************ */

async function chromeFunction(chromeAppNumber, chromeWindowNumberInput, unixId, windowName) {
    try {
        chromeFunctionRun++
        var chromeWindowNumber = chromeFunctionRun - 1
        /* Why chromeFunctionRun?
        this is supposed to help us identify the right Chrome Window Number. Normally, the chromeWindowNumberInput, received from the loop function, would be fine. 
        But, if there is a search window box open on a chrome tab, then the Mac treats it as it's own window. The Loop function runs through all windows--so these search boxes get added to the loop length. So, when there is a search box (1 or more), the chromeWindowNumberInput includes these boxes, and gives a window number we don't want to use.
        
        In the loop function, we correct for this by only calling the chromeFunction if it is NOT one of those search boxes (see code that excludes if "Find in page" starts the window name). And the loop function calls the chromeFunction syncronously. So the number of times the chromeFunction is called corresponds to the Chrome window number, without the search box windows counted. And this is what we want.
        */
        let theTabs1 = await chromeTabs(parseInt(chromeWindowNumber))//.then(d => (d));
        //console.log('chrome window number = ' + chromeWindowNumber)
        theTabs = JSON.parse(theTabs1)
        chromeTabResults.push(theTabs)
        //var nextItemsId = 'nextItems+index=' + chromeAppNumber //no longer used for chrome tabs. left in for reference. Using class "chromeNextItems" instad
        for (var m = 0; m < theTabs.length; m++) {
            runIconError = 1
            var thisTab = theTabs[m]
            var theIcon = thisTab.favicon /*THIS IS NOT Active right now. The code for this relies on executing javascript from Apple Events. Still under consideration*/
           // console.log('loading chrome tab = ' + thisTab.name)
            var chromeWindowId = thisTab.chromeWindowId
            let idN = 'tabNumber' + m + 'windowNumber' + chromeAppNumber + 'refreshNumber = ' + refreshNumber
           // if ((theIcon === undefined) || (theIcon === null)) {
                var url1 = thisTab.url.split('/')[2]
                var useIcon = 'https://' + url1 + '/favicon.ico'
            //} else {
              //  useIcon = theIcon
           // }


            var tabId = chromeWindowNumber + '+' + m
            content = `
            <div style="margin-left: 0px; display: flex; cursor: pointer" class="tabOverview thisTab keyTabHere hideWhileLoading" id="${tabId}" tabindex="1">
              <img style="height: 26px; width: 26px; vertical-align: middle; float: left" src="${useIcon}" id="${idN}" class="chromeTabIcon"></img>
              <span style="margin-left: 10px; cursor: pointer; float: right;" class="chromeTabs windowTabName names">${thisTab.name}</span>
            </div>
      `
            /*removed: <div class="nextItems" style="margin-left: 50px; margin-top: 3px" id="${nextItemsId}"></div> */
            document.querySelector('.chromeNextItems').insertAdjacentHTML('beforeend', content) //using 'chromeNextItems' as the relevant spot to put in the chrome tabs. the alternative is using the app index that corresponds to chrome, but there have been times when that index number was not reliable. This has happened to me when using script editor / dictionary / google chrome (lookng up google chrome details in the script)
            
            var iconImage = document.getElementById(idN) //this item and next two about iconImage were previously there for error catching of tab icon. This is now done with adding the error event listener to the window itself in the startloop function. So these are likely no longer necessary.
            //iconImage.addEventListener('error', chromeImageError)
            iconImage.tabName = thisTab.name

            /*
            document.getElementById(idN).onerror = () => {
                console.log('icon error for ' + thisTab.name)
                if (runIconError != 2) {
                    console.log('should replace for ' + thisTab.name)
                    document.getElementById(idN).src = '../icons/Macintosh HD:Applications:Google Chrome.app:.png'
                    runIconError = 2
                }
            }
            */
            var element = document.querySelector('.thisTab')
            element.addEventListener('click', focusChromeTab)
            element.addEventListener('keydown', keyDownFunction)
            var children = element.children
            element.name = windowName
            element.number = chromeWindowNumber
            element.unixId = unixId
            element.chromeWindowId = chromeWindowId
            element.chromeTabName = thisTab.name
            element.parentId = tabId
            element.status = 'chromeTab'
            element.classList.remove('thisTab')
            for (var j = 0; j < children.length; j++) {
                var child = children[j]
                child.name = windowName
                child.number = chromeWindowNumber
                child.unixId = unixId
                child.chromeWindowId = chromeWindowId
                child.chromeTabName = thisTab.name
                child.parentId = tabId
                child.status = 'chromeTab'
            }
        }//end m loop
        //document.querySelector('.thisOne').classList.remove('thisOne')
    } catch (e) {
        console.log('error in chrome function = ' + e)
        var theMessage1 = `Looks like the Navigator encountered an error getting your Chrome tab info.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
        var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
        document.getElementById('errorMessage').textContent = theMessage
    }
}

function imageError(e){
    var appNameArray = e.target.appName.trim().split(' ')
    var firstLetter = appNameArray.at(-1).charAt(0)
    var iconContent = `
                  <span style="font-size: 14pt; width: 32px; height: 32px; border-radius: 12px; border: 2px solid #3399ff; display: inline-block; text-align: center; line-height: 32px" id="${e.target.id}" >${firstLetter}</span>
                `
    var parent = e.target.parentElement
    e.target.remove()
    parent.insertAdjacentHTML('afterbegin', iconContent)
}

function chromeImageError(e){
    //console.log('run chrome image error for ' + e.target.id)
    try {
        if (e.target.nextElementSibling){
            var tabName = e.target.nextElementSibling.textContent
            //var tabNameArray = e.target.src.replace('www', '').split('ps://')
        //    var tabNameArray1 = e.target.tabName.trim().split(' ')
            var firstLetter = tabName.charAt(0).toUpperCase() //tabNameArray.at(-1).charAt(0)
            var iconContent = `
                        <span style="" class="chromeIconSub" id="${e.target.id}" >${firstLetter}</span>
                        `
            var parent = e.target.parentElement
            e.target.remove()
            parent.insertAdjacentHTML('afterbegin', iconContent)
        }
    } catch (e){
        console.log('error for chrome image issue= ' + e)
    }
}

/*********************COLUMN AND CHROME PREFERENCES ***************** */

/***** COLUMN VIEW PREFERENCE *********** */

function getColumnPreference() {
    columnChoice = localStorage.getItem('columnView')
    if (columnChoice === 'yes-columns') {
        document.getElementById('showResults').classList.add('columnView')
    }
}

ipcRenderer.on('change-column-preference', (event, arg) => {
    changeColumns();
})

function changeColumns() {
    if (columnChoice === 'yes-columns') {
        document.getElementById('showResults').classList.remove('columnView')
        localStorage.setItem('columnView', 'no-columns')
        columnChoice = 'no-columns'
    } else {
        document.getElementById('showResults').classList.add('columnView')
        localStorage.setItem('columnView', 'yes-columns')
        columnChoice = 'yes-columns'
    }
}
/****CHROME Position******* */

function getChromePosition() {
    chromePosition = localStorage.getItem('chromePosition')
}

ipcRenderer.on('change-chrome-position', (event, arg) => {
    changeChromePosition();
})

function changeChromePosition() {
    if ((chromePosition === 'chromeLast') || (chromePosition === 'n/a')) {  //chrome position = n/a would be for when app is first starting and have not changed chrome position. goes to default, which is last.
        chromePosition = 'chromeFirst'
        localStorage.setItem('chromePosition', 'chromeFirst')
        startLoop()

    } else {
        chromePosition = 'chromeLast'
        localStorage.setItem('chromePosition', 'chromeLast')
        startLoop()

    }
}

/*****FOCUS ON APPS, WINDOWS, AND TABS ******* */

async function focusApp(e) {
    var unixId = e.target.unixId
    var name = e.target.name
    hideNavWindowVar = true
    hideNavWindow()
    macFocusAppName(unixId, name).then((result, error) => {
        if (result) {
            console.log(result)
            //hideNavWindowVar = true. Removed hover function for apps, because it was closing window when mouse moved at all after focusing on an app. And to see if its better to not automatically close nav window after focus then hover
            //hideNavWindow()
        } else {
            console.log('error = ' + error)
        }
    }).catch((e) => {
        console.log('error in appjs focus app function = ' + e)
        var theMessage1 = `Looks like the Navigator encountered an error focusing an app.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
        var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
        document.getElementById('errorMessage').textContent = theMessage
    })

}

async function focusWindow(e) {
   // return 'done'
    var unixId = e.target.unixId
    var windowName = e.target.name
    var windowNumber = e.target.number
    var appName = e.target.appName.trim()
    hideNavWindowVar = true
    hideNavWindow()
    macFocusWindow(unixId, windowName, windowNumber, appName).then((result, error) => {
        if (result) {
            console.log(result)
        } else {
            console.log('error = ' + error)
        }
    }).catch((e) => {
        console.log('error in appjs focus window function = ' + e)
        var theMessage1 = `Looks like the Navigator encountered an error focusing a window.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
        var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
        document.getElementById('errorMessage').textContent = theMessage
    })
}

function focusChromeTab(e) {
    var unixId = e.target.unixId
    var theChromeWindowId = e.target.chromeWindowId
    var chromeTabName = e.target.chromeTabName
    hideNavWindowVar = true
    hideNavWindow()
    macFocusChromeTab(unixId, theChromeWindowId, chromeTabName).then((result, error) => {
        if (result) {
            console.log('chrome tab result = ' + result)
        } else {
            console.log('error = ' + error)
        }
    }).catch((e) => {
        console.log('error in appjs focus chrome tab function = ' + e)
        var theMessage1 = `Looks like the Navigator encountered an error focusing a Chrome tab.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
        var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
        document.getElementById('errorMessage').textContent = theMessage
    })
}

/****CLOSE WINDOWS AND TABS *********/

function closeWindow(target1) {
    try {
        var target = JSON.parse(target1)
        var unixId = target.unixId
        var windowName = target.name
        var windowNumber = target.number
        var appName = target.appName
        var parentId = target.parentId
        var theParent = document.getElementById(parentId)
        if (theParent.childElementCount < 2) {
            macCloseApp(appName).then((result, error) => {
                if (result) {
                    console.log('result = ' + result)
                    theParent.parentElement.remove()
                    //e.target.remove()
                } else {
                    console.log('error = ' + error)
                }
            })
        } else {
            macCloseWindow(unixId, windowName, windowNumber, appName).then((result, error) => {
                if (result === true) {
                    var child = theParent.children[windowNumber]
                    child.remove()
                } else {
                    alert('Sorry. Windows for ' + appName + ' are not able to be closed here.')
                    console.log('error in close window app js = ' + error)

                }
            })
        }
    } catch (e) {
        console.log('error in close window functon  = ' + e)
        var theMessage1 = `Looks like the Navigator encountered an error closing a window.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
        var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
        document.getElementById('errorMessage').textContent = theMessage
    }
}

function closeTab(target1) {
    try {
        var target = JSON.parse(target1)
        var tabNumber = target.number
        var chromeWindowId = target.chromeWindowId
        var chromeTabName = target.chromeTabName
        var parentId = target.parentId
        var theParent = document.getElementById(parentId)
        if (theParent.parentElement.childElementCount < 2) {
            macCloseApp('Google Chrome').then((result, error) => {
                if (result) {
                    theParent.parentElement.parentElement.remove()
                    //e.target.remove()
                } else {
                    console.log('error = ' + error)
                }
            })
        } else {
            macCloseChromeTab(chromeWindowId, chromeTabName).then((result, error) => {
                if (result) {
                    console.log('result of close tab function = ' + result)
                    theParent.remove()
                } else {
                    console.log('error = ' + error)
                }
            })
        }
    } catch (e) {
        console.log('error in close window functon  = ' + e)
        var theMessage1 = `Looks like the Navigator encountered an error closing a tab.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
        var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
        document.getElementById('errorMessage').textContent = theMessage
    }
}

/**SEARCH NAMES** */

function searchNamesFunction() {
    try {
        var hiddenDivs = document.querySelectorAll('.hideDiv')
        for (var c = 0; c < hiddenDivs.length; c++) {
            hiddenDivs[c].classList.remove('hideDiv')
        }
        var enteredText = (document.getElementById('nameSearch').textContent).toLowerCase().trim()

        //search through app names
        var appNameDivs = document.querySelectorAll('.appName')
        for (var b = 0; b < appNameDivs.length; b++) {
            var theAppNameText = (appNameDivs[b].textContent).toLowerCase()
            if (theAppNameText.indexOf(enteredText) === -1) {
                appNameDivs[b].parentElement.classList.add('hideDiv') /*this would be the div with class: "appDetails" of the specific app*/
            }
        }

        //search through window names and tab names
        var windowTabNameDivs = document.querySelectorAll('.windowTabName')
        for (var a = 0; a < windowTabNameDivs.length; a++) {
            var theText = (windowTabNameDivs[a].textContent).toLowerCase()
            if (theText.indexOf(enteredText) === -1) {
                if (windowTabNameDivs[a].classList.contains('chromeTabs')) {
                    windowTabNameDivs[a].parentElement.classList.add('hideDiv') //This is the div "tabOverview" for the specific chrome tab. Note chrome tab dom display is structured differently than other window display--there is a parent window on topof the tab icon and tab name
                } else {
                    windowTabNameDivs[a].classList.add('hideDiv') //corresponds to the windowName div of the specific window
                }
            } else { //un-hide the app names
                if (windowTabNameDivs[a].classList.contains('chromeTabs')) {
                    windowTabNameDivs[a].parentElement.parentElement.previousElementSibling.classList.remove('hideDiv') //corresponds to div "tabOverview" for the specific chrome tab. Prior "search app" loop has hidden the app names, so if there is a chrome tab match, we want to un-hide the app.
                    // Note that the chrome tab text search below will normally include the name of the tab itself, so it will probably make this line unnecessary--because there will be a match to the name of the tab in that text search, which will take care of showing the
                } else {
                    windowTabNameDivs[a].parentElement.previousElementSibling.classList.remove('hideDiv')  //. From the "search through app names" action above, the app name has potentially been hidden. So, if the window is a match, remove the hideDiv from the appName. this would be the div with class: "appDetails" of the specific app.  
                }
            }
        }

        //search through chrome tab text

        for (let i = 0; i < chromeTabResults.length; i++) {
            var windowTabs = chromeTabResults[i]
            for (let j = 0; j < windowTabs.length; j++) {
                var tab = windowTabs[j]
                var content = tab.content
                if (content.toLowerCase().indexOf(enteredText) > -1) {
                    var chromeNameDiv = document.querySelector('.chromeNextItems').previousElementSibling //corresponds to the appDetails div that contains the div for the chrome icon and chrome app name
                    chromeNameDiv.classList.remove('hideDiv') //if a tab shows up in search results, show the Chrome app name..
                    var theTabId = tab.chromeWindowNumber + '+' + tab.tabNumber
                    document.getElementById(theTabId).classList.remove('hideDiv') //corresponds to the tabOverview div for the specific tab
                }
            }
        }
    } catch (e) {
        console.log('error in search names function = ' + e)
       // var theMessage1 = `Looks like the Navigator encountered an error doing a search.  Sorry about that. You can press Command+1 to reload and try again.   Here's the error (get ready for techno-speak): ${e}`
     //   var theMessage = theMessage1.replace('error: Error: Error:', 'error:')
    //    document.getElementById('errorMessage').textContent = theMessage /*Turned off because seems to happen every time, but without consequence*/
    }
}

/**END SEARCH NAMES** */


/***MENU Function ******/
function menuFunction() {
    window.addEventListener('contextmenu', (e) => {
        if (e.target.status === 'window') {
            e.preventDefault()
            var target = JSON.stringify(e.target)
            ipcRenderer.send('show-context-menu-window-name', target)
        }

        if (e.target.status === 'chromeTab') {
            e.preventDefault()
            var target = JSON.stringify(e.target)
            ipcRenderer.send('show-context-menu-chrome-tab', target)
        }
    })
}

ipcRenderer.on('close-window-name', (event, arg) => {
    var target = arg
    closeWindow(target)
})

ipcRenderer.on('close-tab', (event, arg) => {
    var target = arg
    closeTab(target)
})


/****project focus ********/

function projectWindow() {
    ipcRenderer.send('open-main-window', '')
}

