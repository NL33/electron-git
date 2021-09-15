const { exec } = require('child_process');

/**This code runs the Jxa in the app */
function runJxaFunction(fn, ...arguments) {
    try {
        fn = fn + '', arguments = `const args = ${JSON.stringify(arguments)};`;
        const start = fn.indexOf('{') + 1
        const code = JSON.stringify(`(${fn.slice(0, start) + arguments + fn.slice(start)})()`).replace(/\\n/g, '');
        return new Promise((resolve, reject) => exec(
            `osascript -l JavaScript -e ${code}`,
            (error, stdout, stderr) => error ? reject(stderr) : resolve(stdout)
        ));
        } catch(e){
            console.log('error in runJXAFunction = ' + e)
        }
}


/***GET LIST OF OPEN WINDOWS AND APPS******* */
module.exports.macActive = function () {
    return runJxaFunction(() => {
        try {
            var apps = Application("System Events").processes.whose({ backgroundOnly: { '=': false } });
            var result = [];

            for (let i = 0; i < apps.length; i++) {
                if (!apps[i].windows.length) continue;


                var name = apps[i].file.name().replace('.app', '');
                var path = apps[i].file.path().replace(/:+$/, '').replace(/:/g, '/').replace('MacOS', '');
                var unixId = apps[i].unixId();
                var bundleId = apps[i].bundleIdentifier();

                var windows = [];
                for (let z = 0; z < apps[i].windows.length; z++) {

                    let tabs = false;
                    if (name === 'Google Chrome') tabs = Application(name).windows[z].tabs().map((tab, tabPos) => ({
                        name: tab.name(),
                        url: tab.url(),
                        position: tabPos + 1,
                        favicon: tab.execute({ javascript: "var links = document.head.querySelectorAll('link'); var link = ''; for (let i = 0; i < links.length; i++) if (['icon', 'shortcut icon', 'apple-touch-icon'].includes(links[i].getAttribute('rel'))) { link = links[i].href; break; } link;" }),
                    }));
                    windows.push({ name: apps[i].windows[z].name(), position: z, tabs });
                }
                result.push({ name, path, windows, unixId, bundleId });
            }
            return JSON.stringify(result);
        } catch (e) {
            throw Error('something went wrong in retrieving the active windows = ' + e);
        }
    });
}


/*****SELECT ITEM FROM LIST, AND HAVE THAT ITEM BE FOCUSED IN APP****** */
module.exports.macFocus = function (unixId, windowIndex = 0, tabIndex = false) {
    return runJxaFunction(() => {
        try {
            const unixId = args[0], windowIndex = args[1], tabIndex = args[2];
            let process = Application('System Events').processes.whose({ unixId, backgroundOnly: { '=': false } });
            if (!process.length) throw Error('process doesnt exist');
            process = process[0];
            const name = process.name().toString();
            if (process.windows.length - 1 < windowIndex) throw Error('window doesnt exist');
            process.windows[windowIndex].actions['AXRaise'].perform();

            if (tabIndex === false) return true;

            if (name === 'Google Chrome') {
                const window = Application(name).windows[windowIndex];
                if (tabIndex === false || window.tabs.length < tabIndex || tabIndex <= 0) throw Error('tab doesnt exist');
                window.activeTabIndex = tabIndex;
            }
            return true;
        } catch (e) {
            throw Error('something went wrong');
        }
    }, unixId, windowIndex, tabIndex);
}


