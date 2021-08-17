const { ipcRenderer, ipcMain, clipboard, shell, remote } = require('electron')
const fs = require("fs")

var contentToLoad
var filePath
window.onload = function () {
    console.log('loaded the file')
    filePath = window.process.argv.slice(-2)[0]
    contentToLoad = window.process.argv.slice(-2)[1]
    document.getElementById('htmlContentHere').innerHTML = contentToLoad
    contentEditableFunction()
}      

function contentEditableFunction(){
    var divs = document.getElementsByTagName('a')
    for (var i = 0; max = divs.length; i++){
        divs[i].contentEditable = "false"
    }
    console.log('done')
}


/***************SAVE HTML FILE CHANGES ************ */

ipcRenderer.on('focused-window-to-save', (event, data) => { //NOTE: This will get data to save file. But what if the basic window is opened
    var updatedContent = document.getElementById('htmlContentHere').innerHTML
    fs.writeFile(filePath, updatedContent, function (err) {
        if (err) {
            console.log(err)
        } else {
           alert('File Saved')
        }
    })
   
})
