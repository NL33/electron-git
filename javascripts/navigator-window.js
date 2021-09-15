const { macActive } = require('../../scripts/navigator-jxa');
const addIcons = require('../../scripts/navigator-add-icons');
const cards = require('../cards');


/****THIS IS THE JS FILE THAT GETS CALLLED when the app opens */

//update windows and making multiple cards would be super easy with angular (because two way binding)
//with angular i would just change array order without update calls, I would update on page enter.
//uses google fonts and icons
//bug when clicking tabs from different windows because the reload doesnt happen
//bug when you switch spaces while it loops over windows. reason: windows change
//updates with setInterval and with page reload on window click
async function loop() {
    console.log(1);
    let activeApps = await macActive().then(d => JSON.parse(d));
    // EXCLUDING OWN APP
    //temp, better to filter in jxa by pid.
    //therefore we need to pid of the main process, with ipc com.
    activeApps = activeApps.filter(x => x.bundleId !== 'com.github.Electron');
    activeApps = await addIcons(activeApps, 'icons');
    cards(activeApps.map(x => ({
        appName: x.name,
        appIcon: `../../${x.icon}`,
        windows: x.windows,
        unixId: x.unixId,
    })));
}

loop().catch(e => alert(e));
setInterval(() => {
    loop().catch(e => alert(e))
}, 5 * 1000);