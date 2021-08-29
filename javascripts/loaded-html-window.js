

var contentToLoad
var filePath
window.onload = function () {
    console.log('loaded the file' + window.location.search)
    var params = window.location.search.split('queryParam870988=') //THIS DOESN"T WORK. HAVE TO FIND ANOTHER WAY
    
    filePath = params[1]//window.process.argv.slice(-2)[0]
    console.log('file path = ' + filePath)
    window.electron.send("toMain", filePath);
   // contentToLoad = params[2]//window.process.argv.slice(-2)[1]


    
    
}      
window.electron.receive("fromMain", (data) => {
    console.log(`Received ${data} from main process = ` + data);
    document.getElementById('htmlContentHere').innerHTML = contentToLoad
});
async function sendTheFilePath(){
try {
    /*
    window.postMessage({
        myTypeField: "toMain1",
        data: filePath
    })
    */
  
  
    
} catch(e){
    console.log('error in sending the file path for html window = ' + e)
    //alert('Sorry, there was an error opening this file. Please try again.')
}
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
/* TURNED OFF FORNOW UNTIL SECURE WAY TO DO THIS.
ipcRenderer.on('focused-window-to-save', (event, data) => { //NOTE: This will get data to save file. But what if the basic window is opened
    var updatedContent = document.getElementById('htmlContentHere').innerHTML
    window.API.writeTheFile(filePath, updatedContent)
    
})
*/
