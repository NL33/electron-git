const { ipcRenderer } = require("electron")
//const { shell } = require('electron')
//const { exec } = require("child_process");
//const { keyboard, Key, getActiveWindow } = require("@nut-tree/nut-js");
//const window1 = window
const simpleGit = require('simple-git')
const git = simpleGit()
var element

window.onload = function () {
    element = document.getElementById("helloEl")

    element.addEventListener("click", () => {
        checkDirectory()
      //  enterKey()
    })
}

ipcRenderer.on("git-commands", function(event, data){
    //gitCommands()
    getTheWindow()
    
})

async function getTheWindow(){
    //await Window.
    // var foregroundWindow = await getActiveWindow()
    //await foregroundWindow.title.then(result => {
    //    console.log('active win = ' + result)
    //})
   // console.log('Hi' + JSON.stringify(windowTitle))
    //alert('window = ' + JSON.stringify(windowTitle))
    /*
    await getActiveWindow().title.then(result => {
        console.log('active win = ' + JSON.stringify(result))
    })
    */

}

async function gitCommands() {
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


