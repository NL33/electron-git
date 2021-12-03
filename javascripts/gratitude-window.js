const { readFile, readdirSync, statSync } = require("fs");
const Dexie = require("dexie");
var db = new Dexie("GratitudeDatabase");

window.onload = async function () {
    try {
        await setUpDatabase()
    } catch (e) {
        console.log('error in setting up gratitude note database = ' + e)
    }
    await showNotes()
}
async function setUpDatabase() {
    try {
        /*
        db.delete().then((response)=>{
          console.log('db deleted')
        })
        */
        await db.version(2).stores({
            noteInfo:
                "++id, noteText, fullDate, showDate, dayOfWeek, dayOfMonth, year, month, time, userName, userId",
            yearInfo:
                "++id, year, userName, userId, noteIds",
            monthInfo:
                "++id, month, year, userName, userId, noteIds"
            
        });
        return "done";
    } catch (error) {
        console.log("error in setUpDexie = " + error);
    }
}

async function saveNote() {
    try {
        var noteText = document.getElementById('noteEntry').textContent
        var currentDate = new Date();
        var displayDate = currentDate.toLocaleDateString('en-us', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        var displayTime = currentDate.toLocaleTimeString('en-us', {
            timeStyle: 'short'
        })
        var cleanedTime = displayTime.replace("AM", "am").replace("PM", "pm")
        var showDate = displayDate + ' ' + cleanedTime
        var dayOfWeek = getDayFunction(currentDate).toString()
        var dayOfMonth = currentDate.getDate().toString()
        var month = getMonthFunction(currentDate).toString()
        var year = currentDate.getFullYear().toString()
        var time = cleanedTime.toString()

        await db.noteInfo.add({
            noteText: noteText,
            fullDate: JSON.stringify(currentDate),
            showDate: showDate,
            dayOfWeek: dayOfWeek,
            dayOfMonth: dayOfMonth,
            month: month,
            year: year,
            time: time,
            userName: '',
            userId: ''
        }).then(async noteId =>{
            console.log(1)
            console.log(year)
            var existingYear = await db.yearInfo.where('year').equals(year).first()
            console.log(2)
            console.log(JSON.stringify(existingYear))
            if ((existingYear !== undefined) && (Object.keys(existingYear).length)) {
                var noteIdsRaw = existingYear.noteIds
                var noteIds = JSON.parse(noteIdsRaw)
                var yearId = existingYear.id
                console.log(noteIdsRaw)
                noteIds.push(noteId)
                console.log(noteIds)
                var updatedArray = JSON.stringify(noteIds)
                console.log(updatedArray)
                await db.yearInfo.where('id').equals(yearId).modify({noteIds:JSON.stringify(updatedArray)}).then((result)=>{
                    console.log('updated year. = ' + result)
                })
            } else {
                var noteIds = [noteId]
                db.yearInfo.add({
                    year: year,
                    userName: '',
                    userId: '',
                    noteIds: JSON.stringify(noteIds)
                }).then((result)=>{
                    console.log('saved the year. Result = ' + result)
                })
                console.log('year doesnt exist yet')
            }
        })
       
       var existingYear = await db.yearInfo.where('year').equalsIgnoreCase(year)

       console.log('existing year = ' + existingYear)

        console.log('saved the note')
        var content = `
          <div class="noteOverview">
            <div class="showDate">${showDate}</div>
            <div class="noteText">${noteText}</div>
          </div>
        `
        document.getElementById('showCurrentNotes').insertAdjacentHTML('beforeend', content)
    } catch (e) {
        console.log('error in savenote function = ' + e)
    }
}

async function showNotes(){
    //await db.yearInfo.where('id').below(20).delete()
    var existingYear = await db.yearInfo.where('year').equals('2021').first()
    console.log(existingYear)
    if (existingYear !== undefined) {
        console.log('existing year = ')
        console.log(existingYear)
        var noteIdsRaw = existingYear.noteIds
        var noteIds = JSON.parse(noteIdsRaw)
        console.log('noteids raw = ' )
        console.log(noteIdsRaw)
        console.log('parsed = ')
        console.log(noteIds)
    } else {
        console.log('year doesnt exist yet')
    }
    var savedNotes = await db.noteInfo.toArray()
    for (var i = 0; i<savedNotes.length; i++){
        var note = savedNotes[i]
        var content = `
          <div class="noteOverview">
            <div class="showDate">${note.showDate}</div>
            <div class="noteText">${note.noteText}</div>
          </div>
        `
        document.getElementById('showCurrentNotes').insertAdjacentHTML('beforeend', content)
    }
  
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