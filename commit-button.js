const { exec } = require('child_process');
const { path } = require('path')

window.onload = function () {
    var button = document.querySelector('#newButton')

    button.addEventListener("click", () => {
        checkDirectory()
    })
}


function checkDirectory(){
    var dir ='/Users/sean/Desktop/companycd/Code-Overview/javascript/append-withJavascript.md'


    exec("git log", { cwd: '/Users/sean/Desktop/companycd/Code-Overview/javascript/append-withJavascript.md'}, function (error, stdout, stderr){
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`); //lists all files in current directory
    });
}


/* 

Present job: trying to figure out how to set the right working directory.
Probably need to understand child process better. This has some info:
https://flaviocopes.com/how-to-spawn-child-process-node/

From this stack overflow:

https://stackoverflow.com/questions/15939380/how-to-get-the-cwd-current-working-directory-from-a-nodejs-child-process-in-b

get current working directory:

var sh = require("shelljs");
var cwd = sh.pwd();

*/