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
       //createDirectory()
       //getTheWindow()
       getFormatAndStore()
       
    })
} //end window onload function


function getFormatAndStore(){
    let formats = clipboard.availableFormats()
    console.log('formats = ' + formats)
    if (formats.includes("text/rtf")){
        console.log('includes RTF')
        let fileData = clipboard.readRTF()
        localStorage.setItem("copiedText", fileData);
        let storageResult = localStorage.getItem("copiedText")
        clipboard.writeRTF(storageResult)
        console.log('saved rtf to clipboard')
    } else if (formats.includes("text/html")) {
        console.log('includes html')
        let fileData = clipboard.readHTML()
        localStorage.setItem("copiedText", fileData);
        let storageResult = localStorage.getItem("copiedText")
        clipboard.writeHTML(storageResult)
        console.log('saved html to clipboard')
    } else {
        console.log('includes text')
        let fileData = clipboard.readText()
        localStorage.setItem("copiedText", fileData);
        let storageResult = localStorage.getItem("copiedText")
        clipboard.writeText(storageResult)
        console.log('saved text to clipboard')
    }
}

function storeItemLocalStorage(){
    let fileData = clipboard.readHTML()
    localStorage.setItem("copiedText", fileData);
    console.log('local storage saved')
    let storageResult = localStorage.getItem("copiedText")
    console.log('local storage result = ')
    clipboard.writeHTML(storageResult)
    console.log('saved to clipboard')
}

function openFile(){
    var doc = '/Users/sean/Desktop/word-convert-test.docx'
    fs.open(doc, (err)=>{
        if (err) {
            console.log(err)
        } else {
            console.log('opened')
        }
    })
}

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
    let fileData = clipboard.readRTF()
    let filePath = '/Users/sean/Desktop/word-convert-test-folder/word-convert-test.txt'
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