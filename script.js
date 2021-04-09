const { shell } = require('electron')

const { exec } = require("child_process");


window.onload = function () {
    var element = document.getElementById("helloEl")

    element.addEventListener("click", () => {
        checkDirectory()
    })
}


function checkDirectory(){
   exec("git log", (error, stdout, stderr) => {
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






