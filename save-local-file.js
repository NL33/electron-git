const path = require('path');
const fs = require('fs');
const { ipcRenderer, clipboard } = require('electron');
const { Http2ServerRequest } = require('http2');
const scriptJS = require('../script.js')
var wordPath = '/Users/sean/Desktop/companycd/electron-git/znext.md'

var newDirectory = '/Users/sean/Desktop/electron-tester/big-plans'

var openDoc = '/Users/sean/Desktop/word-convert-test.docx'
const axios = require('axios');
const { brotliDecompressSync } = require('zlib');

window.onload = function () {
    var saveCommit = document.getElementById('saveButton')
    saveCommit.addEventListener('click', (event) => {
        getFormatAndStoreHTML()
    })
    var save = document.getElementById('saveFileButton');
    save.addEventListener('click', (event) => {
        let stuff = clipboard.readBuffer()
        console.log(stuff)
        clipboard.writeBuffer(stuff)
        //ipcRenderer.send('open-dialog', '')
        //showDialog()
       // addToFile()
       //createDirectory()
       //getTheWindow()
       //getFormatAndStore()
     // getDiscourseStuff()
      //  getFormatAndStore()
       // getFormatAndStoreHTML()
    })
    
} //end window onload function


function getFormatAndStoreHTML() {
    let formats = clipboard.availableFormats()
    if (formats.includes("text/html")) {
        console.log('includes html')
        let storageResult = clipboard.readHTML()
        clipboard.writeHTML(storageResult)
      //  writeFile(storageResult)
        //localStorage.setItem("copiedText", fileData);
       // let storageResult = localStorage.getItem("copiedText")
       // writeFile(storageResult)
       //clipboard.writeHTML(storageResult)
        console.log('saved html to clipboard no local storage')

    } else {
        console.log('includes text')
        let fileData = clipboard.readText()
        localStorage.setItem("copiedText", fileData);
        let storageResult = localStorage.getItem("copiedText")
        clipboard.writeText(storageResult)
        console.log('saved text to clipboard')
    }
}

function getFormatAndStore() {
    let formats = clipboard.availableFormats()
    console.log('formats = ' + formats)
    if (formats.includes("text/rtf")) {
        console.log('incudes rtf')
        let fileData = clipboard.readRTF()
        //writeFile(fileData)
       
     //   localStorage.setItem("copiedText", fileData);
       // let storageResult = localStorage.getItem("copiedText")
         //let body = document.getElementById("bodyId")
         //body.innerHTML = fileData
    //
        clipboard.writeRTF(fileData)
        console.log('saved RTF to clipboard on window!')
    } else if (formats.includes("text/html")) {
        console.log('includes html')
        let fileData = clipboard.readHTML()
        writeFile(fileData)
        /*
        localStorage.setItem("copiedText", fileData);
        let storageResult = localStorage.getItem("copiedText")
        clipboard.writeHTML(storageResult)
        console.log('saved html to clipboard')
        */
    } else {
        console.log('includes text')
        let fileData = clipboard.readText()
        writeFile(fileData)
        /*
        localStorage.setItem("copiedText", fileData);
        let storageResult = localStorage.getItem("copiedText")
        clipboard.writeText(storageResult)
        console.log('saved text to clipboard')
        */
    }
}

function writeFile(data1){
    console.log('in write file')
    var directory = '/Users/sean/Desktop/electron-repos'
    var docToSave = '/Users/sean/Desktop/electron-repos/big-picture-options.html'
    var doc = docToSave
    fs.writeFile(doc, data1, (err) => {
        if (err) throw err;
        console.log('added to doc!');
    })
    gitSaveNew(directory)
    /*
    fs.readFile(doc, 'utf8', function (err, data) {
        console.log('in read file')
        let stuff = data
       // let body = document.getElementById("bodyId")
        //body.innerHTML = stuff
       
        clipboard.writeHTML(data)
        console.log('write html--done')
    })
    */
}


async function gitSaveNew(directory) {
    var text = document.getElementById('saveNote').textContent

    //sets up directory at: /Users/sean/Desktop/git-tester
    try {
        await git.cwd(directory).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.init().then(result => {
            //console.log('init result = ' + JSON.stringify(result))
        })

        await git.add('.').then(result => {
            //console.log('add result = ' + JSON.stringify(result))
        })

        await git.commit(text).then(result => {
            var overviewS = document.getElementById("ifNewVersionSaved")
            var overviewN = document.getElementById("ifNoNewVersion")
            var showResults = document.getElementById("showResults")
            if (result.summary.changes != "0") {
                overviewN.style.display = "none"
                showResults.textContent = JSON.stringify(result.summary)
                overviewS.style.display = "inline-block"
            } else {
                overviewS.style.display = "none"
                showResults.textContent = ""
                overviewN.style.display = "inline-block"
            }
            console.log('commit result = ' + JSON.stringify(result))
        })

    }
    catch (e) {
        console.log('error = ' + e)
    }
}


function writeRTFFile(data) {
    console.log('in write file')
    var doc = docToSave
    // var doc = '/Users/sean/Desktop/word-convert-test-folder/word-convert-test.rtf'
    fs.writeFile(doc, data, (err) => {
        if (err) throw err;
        console.log('added!');
    })


    fs.readFile(doc, 'utf8', function (err, data) {
        clipboard.writeRTF(data)
    })

}


function getDiscourseStuff() {
    // topic id = 397
    //post_id = 562
    console.log('in get discourse stuff')
    //let url = 'https://community.racetosaturn.com/posts/562/revisions/4.json'
    //to get revision data: response.data.data.body_changes.inline 
   // let url = 'https://go.racetosaturn.com/t/406.json?include_raw=true'
    let url = 'https://go.racetosaturn.com/raw/411'
    //to get text = response.data.post_stream.posts[0].cooked
    axios.get(url, {
        params: {
        }
    })
        .then(function (response) {
            console.log('response = ')
            console.log(response)
            let data = response.data
            let body = document.getElementById("bodyId")
            body.innerHTML = data
            clipboard.writeHTML(data)
            /*
            let data = response.data.post_stream.posts[0].raw
            // let data = response.data.body_changes.side_by_side
            console.log('data = ' + data)
            let body = document.getElementById("bodyId")
            body.innerHTML = data
            */
          //  clipboard.writeHTML(response)
        })
        .catch(function (error) {
            console.log(error)
        })
        .then(function () {
            //always executed
        })
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
    var doc = '/Users/sean/Desktop/word-convert-test.rtf'
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