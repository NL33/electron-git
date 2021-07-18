const { ipcRenderer, ipcMain, clipboard, shell, remote } = require('electron')
const { Octokit } = require("@octokit/core");
const octokit = new Octokit();


var contentToLoad
var filePath
window.onload = function () {
    console.log('loaded github window')
    getRepo()
    httpGet()
}


async function getRepo(){
    const response = await octokit.request("GET /repos/steveukx/git-js/git/trees/6d92bd4b3a0a27f86011e20fe9515391478b3a30", {
       // org: "octokit",
       // type: "private",
    });

    console.log('response = ')
    console.log(response)
    console.log('topics = ')
    console.log(response.data.topics)
}

function httpGet() {  //if you want to get content of a certain git page
    var xmlHttp = new XMLHttpRequest();
    var url = 'https://github.com/steveukx/git-js/tree/main/src'  //src is one of the files
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
   // return xmlHttp.responseText;
    var responseData = xmlHttp.responseText
 //  console.log(xmlHttp.responseText)
   // document.getElementById('enterData').innerHTML = responseData
}