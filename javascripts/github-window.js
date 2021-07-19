const { ipcRenderer, ipcMain, clipboard, shell, remote } = require('electron')
const { Octokit } = require("@octokit/core");
const octokit = new Octokit();


var contentToLoad
var filePath
window.onload = function () {
    console.log('loaded github window')
    getFileContents()
    //httpGet()
}


async function getRepo(){
    const response = await octokit.request("GET /repos/steveukx/git-js/git/trees/main", {
       // org: "octokit",
       // type: "private",
    });

    console.log('response = ')
    console.log(response)
    console.log('topics = ')
    console.log(response.data.tree)
    var treeArray = response.data.tree
    for (var i=0; i<treeArray.length; i++) {
        var item = treeArray[i].path
        var contents = `
            <div style="margin-bottom: 5px; cursor: pointer; padding: 5px">${item}</div>
        `
        console.log('item= ' + contents)
        document.getElementById('enterData').insertAdjacentHTML('beforeend', contents)
    }
}

async function getFileContents(){
    const response = await octokit.request("GET /repos/NL33/NSExampleApp_MemTest/contents/src/app/components/list-page/list-page.component.html", {
      // "Content-type": "application/vnd.github.v3.html+json"
    });
    console.log('content response = ')
    console.log(response)
    console.log(atob(response.data.content))
}

function httpGet() {  //if you want to get content of a certain git page
    var xmlHttp = new XMLHttpRequest();
    var url = 'https://api.github.com/repos/steveukx/git-js/contents'
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
   // return xmlHttp.responseText;
    var responseData = JSON.parse(xmlHttp.responseText)
    console.log("**response data**********")
    console.log(responseData.name)
 //  console.log(xmlHttp.responseText)
   // document.getElementById('enterData').innerHTML = responseData
}

/**
 github api calls:

 const response = await octokit.request("GET /repos/steveukx/git-js/git/trees/main", {}) //gets the folder structure for the main commit 

await octokit.request("GET /repos/steveukx/git-js/git/trees/6d92bd4b3a0a27f86011e20fe9515391478b3a30", {})  //gets the folder structure. The sha here is the tree code from the latest commit 

await octokit.request("GET /repos/steveukx/git-js/commits/[commit hash]", {});  //get commit info for that commit 







 */