const { ipcRenderer, app } = require('electron')
const { default: axios } = require('axios')
const { sendEmailUrl, sendEmailKey, sendEmailIv } = require('../environments/environments.js')

const algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var appVersion = 'n/a'
var enteredEmail 
var randomId 
var currentDate
var showDate 
var confirmClicked = false

function encrypt(text){
    var crypto = require('crypto');
    const key = sendEmailKey;
    const iv = sendEmailIv; 

    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    sendFunction(encrypted)
}


window.onload = function () {
    document.getElementById('emailEntry').focus()
    appVersion = window.process.argv.slice(-1)[0]
    console.log(appVersion)
}

function enterEmail() {
    var text = document.getElementById('emailEntry').textContent
    document.getElementById('typedEmail').textContent = text
}

function confirmedEmailFunction() {
    if (confirmClicked === false){
    confirmedClicked = true //to prevent multiple submissions
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
            appVersion: appVersion,
            firstOpenDate: currentDate,
            firstOpenDateShow: showDate
        }
        var info = JSON.stringify(infoObject)
        encrypt(info)

    } else {
        alert("That email doesn't look right. Please try again.")
    }
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
                var result = JSON.stringify(response.data.functionResult)
                console.log('result = ' + result)
               if (result.length>2){
                    await localStorage.setItem('randomAppId', randomId)
                    await localStorage.setItem('firstOpenDateRaw', currentDate)
                    await localStorage.setItem('firstOpenDateShow', showDate)
                    await localStorage.setItem('firstAppVersion', appVersion)
                    await localStorage.setItem('welcomeDone', 'true')
                    document.getElementById('emailMessage').style.display = 'none'
                    document.getElementById('thanksMessage').style.display = 'block'
                   setTimeout(() => {
                       ipcRenderer.send('welcome-done', '') //close this window. and send note to nav window to do the loop
                   }, 2500); 
               } else {
                   errorFunction()
               }
                
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