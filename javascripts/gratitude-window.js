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