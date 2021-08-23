const { ipcRenderer, ipcMain, remote } = require('electron')
const { Menu, MenuItem } = remote
const { writeFile, fstat } = require('fs')
const fs = require("fs")
var path = require('path')

//dexie database for linking project files to discourse posts
const Dexie = require('dexie')
var db = new Dexie("DescriptionDatabase")
var projectPath
var projectName

//Dexie.debug = false //set to false for production. During development, gives more thorough error logs
/*****Button Set Up *****/
window.onload = async function () {
    projectPath = window.process.argv.slice(-2)[0]
    projectName = window.process.argv.slice(-2)[1]
    document.getElementById('projectName').textContent = projectName
    try {
        await db.version(1).stores({
            projectDescriptionInfo: "++id, projectName, projectPath, projectCreateTime, projectDescription, projectId, lastDescriptionUpdatedTime"
        })
    } catch (error) {
        console.log('error = ' + error)
    }


}

function saveDescription(){
    console.log('in save description')
    var stats = fs.statSync(projectPath)
    var createTime = stats.birthtimeMs
    var timeNow1 = new Date();
    var timeNow = timeNow1.getTime()
    var descriptionEntry = document.getElementById('projectDescription').innerHTML
    db.transaction("rw", db.projectDescriptionInfo, async () => {
        //START HERE: check if project exists
        db.fileInfo.where("projectId").equals(createTime).modify({
            projectDescription: descriptionEntry,
            lastDescriptionUpdatedTime: timeNow
        })
        const viewEntry = await db.projectDescriptionInfo.where({ projectId: createTime }).toArray()
        console.log('success. Entry = ' + viewEntry)
    }).catch(Dexie.ModifyError, error => {
        // ModifyError did occur
        console.error(error.failures.length + " items failed to modify");
    })

}

