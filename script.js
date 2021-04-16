const { shell } = require('electron')

const { exec } = require("child_process");
//const { keyboard, Key } = require("@nut-tree/nut-js");

window.onload = function () {
    var element = document.getElementById("helloEl")

    element.addEventListener("click", () => {
        checkDirectory()
      //  enterKey()
    })
}
/*
async function enterKey() {
    await keyboard.pressKey(Key.CapsLock)
    console.log('do the calc')
}
*/

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




