const { ipcRenderer, ipcMain, remote } = require('electron')
const { Menu, MenuItem } = remote
const { writeFile, fstat } = require('fs')
const fs = require("fs")
var path = require('path')

//dexie database for linking project files to discourse posts
const Dexie = require('dexie')
var db = new Dexie("FileDatabase")
var projectPath
var projectName

//Dexie.debug = false //set to false for production. During development, gives more thorough error logs
/*****Button Set Up *****/
window.onload = async function () {
    projectPath = window.process.argv.slice(-2)[0]
    projectName = window.process.argv.slice(-2)[1]
    document.getElementById('projectName').textContent = projectName

}