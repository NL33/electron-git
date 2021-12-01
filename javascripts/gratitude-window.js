const { readFile, readdirSync, statSync } = require("fs");
const Dexie = require("dexie");
var db = new Dexie("GratitudeDatabase");

window.onload = async function () {
    try {
        await setUpDatabase()
        await showNotes()
    } catch (e) {
        console.log('error in setting up gratitude note database = ' + e)
    }
}
async function setUpDatabase() {
    try {
        /*
        db.delete().then((response)=>{
          console.log('db deleted')
        })
        */
        await db.version(1).stores({
            noteInfo:
                "++id, noteText, fullDate, showDate, dayOfWeek, dayOfMonth, year, month, time, userName, userId",
        });
        return "done";
    } catch (error) {
        console.log("error in setUpDexie = " + error);
    }
}

async function saveNote() {
    try {
        var text = document.getElementById('noteEntry').textContent
        var currentDate = new Date();
        var showDate = currentDate.toLocaleDateString('en-us', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        var showTime = currentDate.toLocaleTimeString('en-us', {
            timeStyle: 'short'
        })
        var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
        var showFullDateTime = showDate + ' ' + cleanedTime
        var dayOfWeek = getDayFunction(currentDate)
        var dayOfMonth = currentDate.getDate()
        var month = getMonthFunction(currentDate)
        var year = currentDate.getFullYear()
        var time = cleanedTime

        db.noteInfo.add({
            noteText: text,
            fullDate: JSON.stringify(currentDate),
            showDate: showFullDateTime,
            dayOfWeek: dayOfWeek,
            dayOfMonth: dayOfMonth,
            month: month,
            year: year,
            time: time,
            userName: '',
            userId: ''
        })
        console.log('saved the note')
    } catch (e) {
        console.log('error in savenote function = ' + e)
    }
}

async function showNotes(){
    var savedNotes = await db.noteInfo.toArray()
    console.log('saved notes = ')
    console.log(savedNotes)
}

function getDayFunction(currentDate) {
    var raw = currentDate.getDay()
    if (raw === 0) {
        return 'Sunday'
    } else if (raw === 1) {
        return 'Monday'
    } else if (raw === 2) {
        return 'Tuesday'
    } else if (raw === 3) {
        return 'Wednesday'
    } else if (raw === 4) {
        return 'Thursday'
    } else if (raw === 5) {
        return 'Friday'
    } else if (raw === 6) {
        return 'Saturday'
    }
}

function getMonthFunction(currentDate) {
    var raw = currentDate.getMonth()
    if (raw === 0) {
        return 'January'
    } else if (raw === 1) {
        return 'February'
    } else if (raw === 2) {
        return 'March'
    } else if (raw === 3) {
        return 'April'
    } else if (raw === 4) {
        return 'May'
    } else if (raw === 5) {
        return 'June'
    } else if (raw === 6) {
        return 'July'
    } else if (raw === 7) {
        return 'August'
    } else if (raw === 8) {
        return 'September'
    } else if (raw === 9) {
        return 'October'
    } else if (raw === 10) {
        return 'November'
    } else if (raw === 11) {
        return 'December'
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