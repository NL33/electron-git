const simpleGit = require('simple-git')
const git = simpleGit()
const fs = require("fs")


module.exports.saveGitVersion = async function () {
        console.log('in save version')
        var text = document.getElementById('noteForSave').innerHTML.replaceAll('<div><br></div>', '\n\n').replaceAll('<div>', '').replaceAll('</div>', '') //textContent
        if (text.length < 1) {
            text = "new version saved"
        }
        document.getElementById('saveProjectItems').style.display = "none"
        document.getElementById('savingProgress').style.display = "inline-block"
        document.getElementById('saveProjectHeader').style.display = "none"
        try {

            /**STEPS FROM HERE: Create file with commit notes (including checking if already exists). Create file if necessary. Then, after notes file has been updated, run the commit */
 
            /*Make a file of commit notes:*/
            var commitTextFilePath = projectFolderPath + '/z-version-notes.md'
            fs.stat(commitTextFilePath, function (err, stat) {
                if (err == null) {
                    //file exists
                    fs.readFile(commitTextFilePath, 'utf8', (err, data) => {
                        if (err) {
                            console.log('error = ' + err)
                        } else {
                            var dateObject = new Date()
                            var showDate = dateObject.toLocaleDateString('en-us', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })
                            var showTime = dateObject.toLocaleTimeString('en-us', {
                                timeStyle: 'short'
                            })
                            var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
                            var showTime = '**' + showDate + ' ' + cleanedTime + '**' + '\n\n'
                            var newData = showTime + text + '\n\n\n' + data
                            fs.writeFile(commitTextFilePath, newData, (err) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    //********FILE UPDATED. NOW MAKE THE COMMIT****** */
                                    doTheCommit(text)
                                }
                            })
                        }
                    })
                } else if (err.code === 'ENOENT') {
                    // file does not exist
                    var dateObject = new Date()
                    var showDate = dateObject.toLocaleDateString('en-us', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                    var showTime = dateObject.toLocaleTimeString('en-us', {
                        timeStyle: 'short'
                    })
                    var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
                    var showTime = '**' + showDate + ', ' + cleanedTime + '**' + '\n\n'
                    var newData = showTime + text + '\n\n\n'
                    fs.writeFile(commitTextFilePath, newData, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('file created')
                            var indent = 0
                            var newIndent = parseInt(indent) + 15
                            var newId = "**is-document**^^^" + commitTextFilePath + "^^^" + indent
                            contents = `<div>
                                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${commitTextFilePath}", "${newIndent}")'>` + 'z-version-notes.md' + `</div>
                                </div>`
                            var contentsDiv = document.getElementById('folderContents')
                            contentsDiv.insertAdjacentHTML("beforeend", contents)
                            //********FILE CREATED. NOW MAKE THE COMMIT****** */
                            doTheCommit(text)
                        }
                    })
                } else {
                    console.log('Some other error: ', err.code);
                }
            });
            /*
            await git.raw('remote', 'get-url', '--push', 'origin').then(result => {  //thiswould be to push to github
                console.log('get remote result = ' + JSON.stringify(result))
                //if lists a remote at github that doesn't exist, will send back an error
                document.getElementById('remoteName').textContent = result
            })
            */

        }
        catch (e) {
            console.log('error = ' + e)
            alert("Sorry, there was an error saving this version. Please try again.")
        }
    }

    async function doTheCommit(text) { //Where the actual version commit is done.
       console.log(1)
        try {
            await git.cwd(projectFolderPath).then(result => {
                // console.log('cwd resultss' + JSON.stringify(result))
            })
            await git.init().then(result => {
                //console.log('init result = ' + JSON.stringify(result))
            })
            console.log(2)
            await git.add('.').then(result => {
                //console.log('add result = ' + JSON.stringify(result))
            })

            await git.commit(text).then(result => {

                document.getElementById('savingProgress').style.display = "none"
                document.getElementById('saveProjectHeader').style.display = "block"
                document.getElementById('noteForSave').textContent = ''
                document.getElementById('saveProjectItems').style.display = "block"
                document.getElementById('saveProjectHeader').style.display = "block"
                console.log('commit result = ' + JSON.stringify(result))
                closeSaveView()
            })
        } catch (e) {
            console.log('error in do the commit = ' + e)
            if (e.toString().indexOf('installed') > -1) {
                ipcRenderer.send('open-get-git-window', '')
            } else {
                alert("Sorry, there was an error saving this version. Please try again.")
            }
        }
    }


/****REMOVE ANY WORK TREES CREATED WHEN SELECTING PRIOR VERSIONS***************** */
module.exports.removeWorkTree = async function (treePath) {
    //after do prior versions action, this is a backup function to remove any leftover work trees. Likely not necessary, but left in here just in case
    var thisTreeName = path.basename(treePath)
    console.log('inremove tree. name = ' + thisTreeName)
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })
        if (thisTreeName) {
            /*"--force" is included because its necessary if you are deleting a worktree with modified files.In this case, that is required: 1. user could change files(accidentally), 2. by adding a notation like "old" to the front of files you are modifying the folder.*/
            await git.raw('worktree', 'remove', thisTreeName, '--force').then((result) => {
                if (localStorage.getItem('working-trees-present')) {  //local storage array is to keep track of worktrees created, so as to delete them in the case the app is not shut down properly (they would be deleted on startup)
                    let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                    let theTreePath = projectFolderPath + '/' + thisTreeName
                    let index = treeArray.indexOf(theTreePath)
                    if (index > -1) {
                        treeArray.splice(index, 1)
                        localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                        console.log('local storage now = ' + localStorage.getItem('working-trees-present'))
                    }
                }
            }) //delete that folder
            await git.raw('worktree', 'prune').then((result) => { //removes info about worktrees which no longer exist
            })
        }
    } catch (e) {
        console.log('error in removework = ' + e)
    }
}

/********REMOVE ANY WORK TREES CREATED BY THE APP********* */
module.exports.removeSavedWorkTree = async function (treePath) {
    //checks local storage for any work tree references. If any found, then remove them.
    try {
        await fs.rm(treePath, { recursive: true }, (err) => {
            console.log('deleted: removed work tree = ' + treePath)
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log('attempted to remove worktree, but worktree not present. Should not be a concern. Worktree path = ' + treePath)
                    console.log('will now remove that work tree reference from local storage')
                    let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                    let index = treeArray.indexOf(treePath)
                    if (index > -1) {
                        treeArray.splice(index, 1)
                        localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                        console.log('local storage now = ' + localStorage.getItem('working-trees-present'))
                    }
                    console.log('done')
                } else {
                    console.log('error in remove worktree action. error = ' + err)
                }
            } else {
                let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                let index = treeArray.indexOf(treePath)
                if (index > -1) {
                    treeArray.splice(index, 1)
                    localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                    console.log('local storage now = ' + localStorage.getItem('working-trees-present'))
                }
            }
        })
    } catch (e) {
        console.log('error in removing work tree = ' + e)
    }
}