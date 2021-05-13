
//const { shell } = require('electron')
//const { exec } = require("child_process");
//const { keyboard, Key, getActiveWindow } = require("@nut-tree/nut-js");
//const window1 = window
const simpleGit = require('simple-git')
const git = simpleGit()
var element
var showDirectory 
var selectedPath

window.onload = function () {
    console.log('loaded')
    const homeDir = require('os').homedir();
    const desktopDir = `${homeDir}/Desktop`;
    
    var selectedPath = desktopDir + '/git-tester'
    showDirectory = document.getElementById("directory")
    showDirectory.textContent = selectedPath
    
    element = document.getElementById("saveButton")
    element.addEventListener("click", () => {
        gitSaveNew(selectedPath)
      //  enterKey()
    })

    document.getElementById('file-input').addEventListener('change', function () {
        if (this.files[0].path) {
            selectedPath = this.files[0].path
            showDirectory.textContent = selectedPath
            document.getElementById("file-input").style.display = "none"
        }
    });

    document.getElementById("changeFolder").addEventListener('click', function() {
        console.log('clicked')
        document.getElementById("file-input").style.display = "inline"
        document.getElementById("changeFolder").style.display = "none"
        document.getElementById("closeChoose").style.display = "inline-block"
    })

    document.getElementById("closeChoose").addEventListener('click', function () {
        document.getElementById("file-input").style.display = "none"
        document.getElementById("changeFolder").style.display = "inline-block"
        document.getElementById("closeChoose").style.display = "none"
    })

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

async function gitViewOld(){

}

async function gitRevertToOld(){

}


