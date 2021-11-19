const { exec, execFile } = require('child_process');
const fs = require('fs')

/*****GET LIST OF APPS, WINDOWS, AND TABS********/
module.exports.macActive = async function (chromePosition) {
    return runJxaFunction(() => {
        try {
            apps = Application("System Events").processes.whose({ backgroundOnly: { '=': false } });
            var chromePosition = args[0];
            if (chromePosition === 'chromeFirst') {
                return JSON.stringify({
                    paths: apps.file.path(), /*the names of the apps*/
                    unixId: apps.unixId(),
                    windows: apps.windows.name(), /*the names of the windows*/
                    icons: []
                });
            } else {
                return JSON.stringify({ /*reverse() is present here so that the arrays are in the reverse order ofwhen the app is opened. That then allows loading the windows with "afterbegin" and the display tracks the order or opening. which allows chrome to come in at "beforeend" and therefore show up last*/
                    paths: apps.file.path().reverse(), /*the names of the apps*/
                    unixId: apps.unixId().reverse(),
                    windows: apps.windows.name().reverse(), /*the names of the windows*/
                    icons: []
                });
            };
        } catch (e) {
            throw Error('something went wrong in mac active = ' + e);
        }
    }, chromePosition);
}

module.exports.chromeTabs = async function (number) {
    return runJxaFunction(() => {
        try {
            let tabs = false;
            const theNumber = args[0];
            tabs = Application('Google Chrome').windows[theNumber].tabs().map((tab, tabPos) => ({
                name: tab.name(),
                chromeWindowId: Application('Google Chrome').windows[theNumber].id(),
                chromeWindowNumber: theNumber,
                url: tab.url(),
                tabNumber: tabPos,
                content: '',/*tab.execute({ javascript: "document.body.innerText" }),*/
                favicon: '', /*tab.execute({ javascript: "var links = document.head.querySelectorAll('link'); var link = undefined; for (let i = 0; i < links.length; i++) if (['icon', 'shortcut icon', 'apple-touch-icon'].includes(links[i].getAttribute('rel'))) { link = links[i].href; break; } link;" }),*/
                /* REMOVED content and favicon for now because they execute javascript, and for that to work the user has to enable "Allow Javascript from Apple Events" at chrome > view > developer. Removed these while I consider whether this is a concern and whether there alternatives"*/
            }));
            return JSON.stringify(tabs);
        } catch (e) {
            throw Error('Chrome tabs issue = ' + e);
        }
    }, number)

}

/*****FOCUS ON APP, WINDOW, OR TAB ************/
module.exports.macFocusAppName = function (unixId, name) {
    return runJxaFunction(() => {
        try {
            var name = args[1];
            Application(name).launch();
            Application(name).activate();
            var summary = "focus app done: appName= " + name;
            return summary;
        } catch (e) {
            throw Error('Focus on app name issue = ' + e);
        }
    }, unixId, name);
}

//var result = await runJxa((unixId, name) => {

module.exports.macFocusWindow = function (unixId, windowName, windowNumber, appName) {
    return runJxaFunction(() => {
        try {
            const unixId = args[0], windowName = args[1], windowNumber = args[2], appName = args[3];
            var summary = "focusWindow complete";
            let process = Application('System Events').processes.whose({ unixId, backgroundOnly: { '=': false } })[0];
            if (!process.length) throw Error('process doesnt exist');
            var theWindowsNames = process.windows.name();
            var theLength = theWindowsNames.length;
            var windowIndex = undefined;

            for (var i = 0; i < theLength; i++) {
                if (theWindowsNames[i] === windowName) {
                    windowIndex = i;
                    break;
                };
            };
             summary = "focus window done: name= " + windowName + "; unixId= " + unixId +  "; windowIndex=" + windowIndex;
            if ((windowIndex != undefined)) {
                process.windows[windowIndex].actions['AXRaise'].perform(); /*Focus action*/
            } else {
                Application(appName).launch();
                Application(appName).activate();
                summary = "no index in focusWindow. Call app name: " + appName;

            };
            return summary;
        } catch (e) {
            throw Error('Focusing windows issue = ' + e);
        }
    }, unixId, windowName, windowNumber, appName);
}

module.exports.macFocusChromeTab = function (unixId, chromeWindowId, chromeTabName) {
    return runJxaFunction(() => {
        try {
            const unixId = args[0], chromeWindowId = args[1], chromeTabName = args[2];
            let process = Application('System Events').processes.whose({ unixId, backgroundOnly: { '=': false } })[0];
            const chrome = Application('Google Chrome');
            for (var i = 0; i < chrome.windows.length; i++) {
                var window = chrome.windows[i];
                var windowId = window.id();
                if (windowId === chromeWindowId) {
                    var tabNames = window.tabs.title();
                    for (k = 0; k < tabNames.length; k++) {
                        if (tabNames[k] === chromeTabName) {
                            window.activeTabIndex = k + 1;
                            process.windows[i].actions['AXRaise'].perform();
                        }
                    }
                }
            };
            return chromeWindowId;
        } catch (e) {
            throw Error('Focusing Chrome tabs issue = ' + e)
        }
    }, unixId, chromeWindowId, chromeTabName)
}

/**********CLOSE WINDOW, AND TAB *****************/

module.exports.macCloseApp = function (name) {
    return runJxaFunction(() => {
        try {
            const name = args[0];
            Application(name).quit();
            return true
        } catch (e) {
            throw Error('Close app issue = ' + e);
        }
    }, name);
}


module.exports.macCloseWindow = function (unixId, windowName, windowNumber, appName) {
    return runJxaFunction(() => {
        try {
            const unixId = args[0], windowName = args[1], windowNumber = args[2], appName = args[3];
            let process = Application('System Events').processes.whose({ unixId, backgroundOnly: { '=': false } })[0];
            if (!process.length) throw Error('process doesnt exist');
            var theWindowsNames = process.windows.name();
            var theLength = theWindowsNames.length;
            var windowIndex = undefined;

            for (var i = 0; i < theLength; i++) {
                if (theWindowsNames[i] === windowName) {
                    windowIndex = i;
                    break;
                };
            };
            if ((windowIndex != undefined)) {
                /*process.windows[windowIndex].close();*/ /*Focus action*/
                /*Application('Notion').windows[windowIndex].close();*/
                Application(appName).windows[windowIndex].close();
            } else {
                throw Error('No window index in closing window attempt.');
            };
            return true;
        } catch (e) {
            return Error('Close window issue = ' + e);
        }
    }, unixId, windowName, windowNumber, appName);
}

module.exports.macCloseChromeTab = function (chromeWindowId, chromeTabName) {
    return runJxaFunction(() => {
        try {
            const chromeWindowId = args[0], chromeTabName = args[1];
            const chrome = Application('Google Chrome');
            for (var i = 0; i < chrome.windows.length; i++) {
                var window = chrome.windows[i];
                var windowId = window.id();
                if (windowId === chromeWindowId) {
                    var tabNames = window.tabs.title();
                    for (k = 0; k < tabNames.length; k++) {
                        if (tabNames[k] === chromeTabName) {
                            var tabIndex = k;
                            chrome.windows[i].tabs[tabIndex].close();
                        }
                    }
                }
            };
            return true;
        } catch (e) {
            throw Error('Close Chrome tab issue = ' + e)
        }
    }, chromeWindowId, chromeTabName)
}

function runJxaFunction(fn, ...arguments) {
    fn = fn + '', arguments = `const args = ${JSON.stringify(arguments)};`;
    const start = fn.indexOf('{') + 1
    const code = JSON.stringify(`(${fn.slice(0, start) + arguments + fn.slice(start)})()`).replace(/\\n/g, '');
    let data = code
    return new Promise((resolve, reject) => exec(
        `osascript -l JavaScript -e ${code}`,
        (error, stdout, stderr) => error ? reject(stderr) : resolve(stdout)
    ));
}



