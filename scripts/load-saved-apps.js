/*
This script is currently not in use.
Purpose of this script: allow user to save apps as default apps, so they appear on the users' nav window every time, whether open or not. The benefit is that they would not need to use mission control at all then (if they use mission control to open apps in the first place, like I do).

General functionality:
1. right click app, and say: Add to saved apps.
2. save relevant information to local storage about that app. That information likely should correspond to the information in the activeApps array returned from navigator-jxa.
    - my first idea was to just get the info from the dom and compare against what's been loaded in the dom, but that gets confusing with things like index and unixid.
    -better to just add the saved apps to activeapps to start. and then load them just like other apps.

3. Probably then add them to activeApps in the navigator-jxa function.

4. one item to be figured out: they won't have a unixId when they show up in the nav window, because they are not opened. Unix Id is not important for opening an app, but is important for opening its windows.
    -so, get unix id after opening the app.
    -how?
        - load savedApps without a unixId (or say: 'n/a' for unixId)
        - when open app, at that point, check if unixId. If not, then at that time return the unixId, and add that to the information about the element and its children
*/

//starting code:

var loadedApps = [] //maybe not necessary.  keeps track of which apps have been loaded into the dom. After apps have loaded, we check the savedApps array, and any apps from savedApps not yet loaded (because they are not in the loadedApps array), get loaded then.

//would reset at every startLoop()

async function addToSavedApps() {
    savedApps = []
    var contentToAdd = {
        appName: 'Music',
        appContent:
            `
      <div id="index=1" style="margin-bottom: 5px" class="appOverview">
        <div tabindex="1" class="appUpDetails keyTabHere">
        <img style="height: 36px; width: 36px; vertical-align: middle" class="notChromeTab " src="../icons/Macintosh HD:System:Applications:Music.app:.png" name="Music">
            <span style="margin-left: 3px; cursor: pointer" class="appName names">Music</span>
        </div>
        <ul class="nextItems nonChromeNextItems" id="nextItems+index=1+refreshNumber=0"></ul>
     </div>
`
    }
    savedApps.push(contentToAdd)
    localStorage.setItem('saved-apps', JSON.stringify(savedApps))
}

async function loadSavedApps() {
    let savedApps = JSON.parse(localStorage.getItem('saved-apps'))
    for (var i = 0; i < savedApps.length; i++) {
        var savedApp = savedApps[i]
        var savedAppName = savedApp.name
        var alreadyThere = false
        for (var i = 0; i < loadedApps.length; i++) {
            if (loadedApps[i] === savedAppName) {
                alreadyThere = true
                console.log('already loaded = ' + savedAppName)
            }
            break
        }
        if (alreadyThere === false) {

        }
    }
}
