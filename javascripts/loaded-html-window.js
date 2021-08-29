var filePath
window.onload = function () {
    var params = window.location.search.split('queryParam870988=') //Get the params from Main process
    
    filePath = params[1]

    window.electron.send("toMain", filePath); //send file path to preload.js, which sends it to main
}      

window.electron.receiveFromMainSendToRenderer('fromMain', (event, data) => { //receives data from preload.js, which got it from main
    try {
    document.getElementById('htmlContentHere').innerHTML = data
    } catch(e){
        console.log('error in loading html (could be just some images missing, which is ok) = ' + e)
    }
});



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
/* TURNED OFF FORNOW UNTIL SECURE WAY TO DO THIS.
ipcRenderer.on('focused-window-to-save', (event, data) => { //NOTE: This will get data to save file. But what if the basic window is opened
    var updatedContent = document.getElementById('htmlContentHere').innerHTML
    window.API.writeTheFile(filePath, updatedContent)
    
})
*/
