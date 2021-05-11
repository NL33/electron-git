const path = require('path');
const fs = require('fs');
const { ipcRenderer, clipboard } = require('electron');
var wordPath = '/Users/sean/Desktop/companycd/electron-git/znext.md'

window.onload = function () {
    var newDirect = document.getElementById('createDirectory')
    newDirect.addEventListener('click', (event) => {
        createDirectory()
    })
    

} //end window onload function

function createDirectory() {
    console.log('click')
    var newDirectory = '/Users/sean/Desktop/amazing-directory'
    if (!fs.existsSync(newDirectory)) {
        fs.mkdirSync(newDirectory);
    }
}

function addToFile() {
    var code = '******4hn8tjanfw1*****'
    fs.appendFile(wordPath, code, (err) => {
        if (err) throw err;
        console.log('added!');
    })
}

function saveFile() {
    let fileData = clipboard.readRTF()
    let filePath = '/Users/sean/Desktop/word-convert-test-folder/word-convert-test.txt'
    fs.writeFile(filePath, fileData, (err) => {
        if (err) throw err;
        console.log('Saved!');
    })
}

function openFile() {
    var doc = '/Users/sean/Desktop/word-convert-test.rtf'
    fs.open(doc, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('opened')
        }
    })
}