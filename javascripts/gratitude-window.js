const { readFile, readdirSync, statSync } = require("fs");
const Dexie = require("dexie");
var db = new Dexie("GratitudeDatabase");

async function setUpDatabase(){
    try {
        /*
        db.delete().then((response)=>{
          console.log('db deleted')
        })
        */
        await db.version(1).stores({
            noteInfo:
                "++id, noteText, fullDate, day, year, month, time, userName, userId, ",
        });
        return "done";
    } catch (error) {
        console.log("error in setUpDexie = " + error);
    }
}

/*
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



*/


/*
const fs = require("fs")
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
                //FILE CREATED. NOW MAKE THE COMMIT
                doTheCommit(text)
            }
        })
    } else {
        console.log('Some other error: ', err.code);
    }
});


    }
    catch (e) {
    console.log('error = ' + e)
    alert("Sorry, there was an error saving this version. Please try again.")
}
}
*/