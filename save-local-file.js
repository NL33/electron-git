const path = require('path');
const fs = require('fs');
const { ipcRenderer, clipboard } = require('electron')

window.onload = function () {
    var save = document.getElementById('saveFileButton');
    save.addEventListener('click', (event) => {
        //ipcRenderer.send('open-dialog', '')
        //showDialog()
        // Resolves to a Promise<Object>
        saveFile()
    })
} //end window onload function


function saveFile(){
    let fileData = clipboard.readText()
    let filePath = '/Users/sean/Desktop/electron-tester/apple-note.txt'
    fs.writeFile(filePath, fileData,(err)=>{
        if (err) throw err;
        console.log('Saved!');
    })
}

ipcRenderer.on('file-selected', (event, file) => {
    // Stating whether dialog operation was cancelled or not.
   // console.log(file.canceled);
    console.log('in file selected')
   // console.log(content)

    if (!file.canceled) {
        console.log(file.filePath.toString());

        // Creating and Writing to the sample.txt file
        fs.writeFile(file.filePath.toString(),
            'This is a Sample File', function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
    }
})



/*
 var filePath = file.filePath.toString()
        console.log('file path = ' + filePath)
        const content = fs.readFileSync(filePath).toString();

*/




/*
fs.writefile(filepath/filename, data to go in file, callback)
https://www.geeksforgeeks.org/node-js-fs-writefile-method/


*/