

var contentToLoad
var filePath
window.onload = function () {
    console.log('loaded the file')
    filePath = window.process.argv.slice(-2)[0]
    contentToLoad = window.process.argv.slice(-2)[1]
    document.getElementById('htmlContentHere').innerHTML = contentToLoad
}      

/* TURNING THIS FUNCTION OFF.
WHY? Because it allows links in the loaded html to be clickable, in a way that would open up the link in the electron window. This is a potential security concern. 
function contentEditableFunction(){
    var divs = document.getElementsByTagName('a')
    for (var i = 0; max = divs.length; i++){
        divs[i].contentEditable = "false"
    }
    console.log('done')
}
*/


/***************SAVE HTML FILE CHANGES ************ */
/* TURNED OFF FORNOW UNTIL SECURE WAY TO DO IT
See z-later-next.md and security.md
ipcRenderer.on('focused-window-to-save', (event, data) => { //NOTE: This will get data to save file. But what if the basic window is opened
    var updatedContent = document.getElementById('htmlContentHere').innerHTML
    window.API.writeTheFile(filePath, updatedContent)
    
})
*/
