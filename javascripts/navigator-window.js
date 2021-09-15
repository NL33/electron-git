const { macActive } = require('../scripts/navigator-jxa');
const addIcons = require('../scripts/navigator-add-icons');
const cards = require('../scripts/card');
const { exec } = require('child_process');

/****THIS IS THE JS FILE THAT GETS CALLLED when the app opens */
console.log('call this window')
async function loop() {
    console.log('in the loop')
    let activeApps = await macActive().then(d => JSON.parse(d));

    /*
    // EXCLUDING OWN APP
    //temp, better to filter in jxa by pid.
    //therefore we need to pid of the main process, with ipc com.
   code: activeApps = activeApps.filter(x => x.bundleId !== 'com.github.Electron');
   */
    activeApps = await addIcons(activeApps, 'icons');
    console.log('apps = ')
   console.log(activeApps)

    cards(activeApps.map(x => ({
        appName: x.name,
        appIcon: `../../${x.icon}`,
        windows: x.windows,
        unixId: x.unixId,
    })));
    
}

loop().catch(e => console.log(e));




/*
testMacActive().then((result)=>{
    console.log('here are the apps')
    console.log(result)
})
async function testMacActive(){
    const runJxa = require('run-jxa')
    var result = await runJxa(() => {
        const apps = Application("System Events").processes.whose({ backgroundOnly: { '=': false } });
        return apps
    }, [])
    return result
}

function runJxaFunction(fn, ...arguments) {
    try {
        fn = fn + '', arguments = `const args = ${JSON.stringify(arguments)};`;
        const start = fn.indexOf('{') + 1
        const code = JSON.stringify(`(${fn.slice(0, start) + arguments + fn.slice(start)})()`).replace(/\\n/g, '');
        return new Promise((resolve, reject) => exec(
            `osascript -l JavaScript -e ${code}`,
            (error, stdout, stderr) => error ? reject(stderr) : resolve(stdout)
        ));
    } catch (e) {
        console.log('error in runJXAFunction = ' + e)
    }
}
*/