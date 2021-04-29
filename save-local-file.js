const path = require('path');
const fs = require('fs');
const { ipcRenderer, clipboard } = require('electron')
var wordPath = '/Users/sean/Desktop/companycd/electron-git/znext.md'

var newDirectory = '/Users/sean/Desktop/electron-tester/big-plans'

window.onload = function () {
    var save = document.getElementById('saveFileButton');
    save.addEventListener('click', (event) => {
        //ipcRenderer.send('open-dialog', '')
        //showDialog()
       // addToFile()
       createDirectory()
    })
} //end window onload function


function createDirectory(){
    if (!fs.existsSync(newDirectory)) {
        fs.mkdirSync(newDirectory);
    }
}

function addToFile(){
    var code = '******4hn8tjanfw1*****'
    fs.appendFile(wordPath,code, (err)=>{
        if (err) throw err;
        console.log('added!');
    })
}

function saveFile(){
    let fileData = clipboard.readHTML()
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