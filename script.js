const { ipcRenderer } = require("electron")
//const { shell } = require('electron')
//const { exec } = require("child_process");
//const { keyboard, Key, getActiveWindow } = require("@nut-tree/nut-js");
//const window1 = window
const simpleGit = require('simple-git')
const git = simpleGit()
var element

window.onload = function () {
    element = document.getElementById("header")

    element.addEventListener("click", () => {
        checkDirectory()
      //  enterKey()
    })
}



async function gitSaveNew() {
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

        await git.commit('this is the fourth commit').then(result => {
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


