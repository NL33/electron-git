const { ipcRenderer } = require("electron")
//const { shell } = require('electron')
//const { exec } = require("child_process");
//const { keyboard, Key, getActiveWindow } = require("@nut-tree/nut-js");
//const window1 = window
const simpleGit = require('simple-git')
const git = simpleGit()
var element

window.onload = function () {
    element = document.getElementById("saveButton")

    element.addEventListener("click", () => {
        gitSaveNew()
      //  enterKey()
    })
}

async function gitSaveNew() {
    var text = document.getElementById('saveNote').textContent
    const homeDir = require('os').homedir();
    const desktopDir = `${homeDir}/Desktop`;
    var folderG = desktopDir + '/git-tester'
    //sets up directory at: /Users/sean/Desktop/git-tester
    try {
        await git.cwd(folderG).then(result => {
            console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.init().then(result => {
            console.log('init result = ' + JSON.stringify(result))
        })

        await git.add('.').then(result => {
            console.log('add result = ' + JSON.stringify(result))
        })

        await git.commit(text).then(result => {
            console.log('fourth commit result = ' + JSON.stringify(result))
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


