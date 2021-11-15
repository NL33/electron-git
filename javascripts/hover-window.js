const { ipcRenderer, ipcMain } = require('electron')
var hovered = true
window.onload = function(){
    window.addEventListener("mousemove", function (event) {
        console.log('hoverererer')
        if (hovered === true){
            console.log('show open')
            ipcRenderer.send('open-nav-window', '')
            hovered = false
        }
        
    })
}

