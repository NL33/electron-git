const { ipcRenderer } = require('electron')
const { default: axios } = require('axios')
const { sendEmailUrl } = require('../environments/environments.js')


window.onload = function () {
    document.getElementById('emailEntry').focus()
}

function enterEmail() {
    var text = document.getElementById('emailEntry').textContent
    document.getElementById('typedEmail').textContent = text
}

function confirmedEmailFunction() {
    var enteredEmail = (document.getElementById('typedEmail').textContent).trim()
    if ((enteredEmail.length > 4) && (enteredEmail.includes('@') && (enteredEmail.includes('.') && (!enteredEmail.includes(' '))))) {
        var timeRaw = new Date()
        var time = timeRaw.getTime()
        var randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var randomId = randomString + '***' + time
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
        //generate a random key to associate with the email.
        var showDate = displayDate + ' ' + cleanedTime
        var infoObject = {
            email: enteredEmail,
            id: randomId,
            firstOpenDate: currentDate,
            firstOpenShowDate: showDate
        }
        console.log('Info object = ')
        console.log(infoObject)
        var info = JSON.stringify(infoObject)
        sendFunction(info)

    } else {
        alert("That email doesn't look right. Please try again.")
    }
}

function sendFunction(info) {
    axios({
        method: "post",
        url: sendEmailUrl,
        data: info,
        //contentType: "multipart/form-data",
        //dataType: "json",
    })
        .then(async (response, error) => {
            if (error) {
                console.log('error in sending email = ' + error)
                errorFunction()

            } else {
                var data = JSON.parse(response.data.message)
                var email = data.email
                var id = data.id
                var firstOpenDate = data.firstOpenDate
                var firstOpenShowDate = data.firstOpenShowDate
                await localStorage.setItem('randomAppId', id)
                await localStorage.setItem('firstOpenDateRaw', firstOpenDate)
                await localStorage.setItem('firstOpenDateShow', firstOpenShowDate)
                await localStorage.setItem('welcomeDone', 'true')
                document.getElementById('emailMessage').style.display = 'none'
                document.getElementById('thanksMessage').style.display = 'block'
                setTimeout(() => {
                    ipcRenderer.send('welcome-done', '') //close this window. and send note to nav window to do the loop
                }, 2500);

                //  localStorage.setItem('welcomeDone', true)

            }

        }).catch((e) => {
            console.log('error in sending email 2 = ' + e)
            errorFunction()


        })
}

function errorFunction() {
    document.getElementById('emailMessage').style.display = 'none'
    document.getElementById('errorMessage').style.display = 'block'
    setTimeout(() => {
        ipcRenderer.send('welcome-done', '') //send welcome done anyway, to open the Nav window. So nav window will work. But local storage is not set. So next time close and try to open nav window, we'll ask for email again.
    }, 3500);
}