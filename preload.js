const {
    contextBridge,
    ipcRenderer
} = require("electron");

/***Load HTML WINDOW */
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "electron", {
    send: (channel, data) => { //receives from renderer. sends to main
        // whitelist channels
        let validChannels = ["toMain"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receiveFromMainSendToRenderer: (channel, func) => { //receives from main, sends to renderer
        let validChannels = ["fromMain"];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, func);
        }
    }
}
);


/** THIS ALSO WORKS:
process.once('loaded', () => {
    window.addEventListener('message', event => {
        // do something with custom event
        const message = event.data;

        if (message.myTypeField === 'toMain1') {
            ipcRenderer.send('toMain', message);
        }
    });
});
*/










/*
var API = function () {
    const { fs} = require('fs');

    API.readTheFile = async function (filePath) {
        console.log('now in read the file')
        try {
           await fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.log(err)
                    alert('')
                } else {
                    return data
                }
            })
        } catch (e) {
            console.log('error in reading file.')
            alert('Sorry, there was a problem opening this file. Please try again.')
        }
    }
}

window.api = new API();
*/






/*
This is from Electron starter guide:

window.addEventListener('DOMContentLoaded', () => { //define an event listener that tells you when the web page has loaded
    const replaceText = (selector, text) => { //define a utility function used to set the text of the placeholders in index.html
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) { //loop through componsents whose version you want to display
        replaceText(`${type}-version`, process.versions[type]) //call replace text to look up the version placeholders in index.html and set their text value to the values from process.versions
    }
})



Corresponded to the index.html code:

<body style="background: white;">
    <h1 id="helloEl">Hello Worlds!</h1>
    <p>
        We are using Node.js <span id="node-version"></span>,
        Chromium <span id="chrome-version"></span>,
        and Electron <span id="electron-version"></span>.
    </p>
    <input>
</body>

*/
