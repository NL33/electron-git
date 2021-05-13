const simpleGit = require('simple-git')
const git = simpleGit()

window.onload = function () {
    var saveButton = document.getElementById('saveButton')
    saveButton.addEventListener('click', () =>{
        saveVersion()
    })  
}

function saveVersion(){
    console.log('in save version')
}
