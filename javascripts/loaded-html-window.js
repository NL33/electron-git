const { ipcRenderer, ipcMain, clipboard, shell, remote } = require('electron')

var contentToLoad
var filePath
window.onload = function () {
    console.log('loaded the file')
    filePath = window.process.argv.slice(-2)[0]
    contentToLoad = window.process.argv.slice(-2)[1]
    document.getElementById('htmlContentHere').innerHTML = contentToLoad
}      