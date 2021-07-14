const { ipcRenderer, ipcMain } = require('electron')

function openMain(){
    ipcRenderer.send('open-main-window', '')
}

