const { ipcRenderer } = require('electron')
const { default: axios } = require('axios')
const { sendEmailUrl } = require('../environments/environments.js')


window.onload = function(){
    document.getElementById('emailEntry').focus()
}

function enterEmail(){
    var text = document.getElementById('emailEntry').textContent 
    document.getElementById('typedEmail').textContent = text
}

function sendFunction(info){
    axios({
        method: "post",
        url: sendEmailUrl,
        data: info,
        //contentType: "multipart/form-data",
        //dataType: "json",
    })
        .then((response, error) => {
            if (error){
                console.log('error in sending email = ' + error)
            } else {
                console.log('response = ' + JSON.stringify(response))
                localStorage.set('randomAppId', appId)
                localStorage.set('firstOpenDateRaw', currentDate)
                localStorage.set('firstOpenDateShow', showDate)
                ipcRenderer.send('welcome-done', '')



              //  localStorage.setItem('welcomeDone', true)
                ipcRenderer.send('welcome-done', ) //close this window. and send note to nav window to do the loop
            }
           
    })
}

function confirmedEmailFunction(){
    var enteredEmail = document.getElementById('typedEmail').textContent

    console.log(randomId)
    if ((enteredEmail.length > 4) && (enteredEmail.includes('@'))){
        var time = new Date(milliseconds)
        var randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var randomId = randomString + '***' + time

        localStorage.set('email', true)
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
        var info = JSON.stringify(infoObject)
        console.log(info)
        //******^^^START HERE: 1. be sure info works. parse response code in send function. Test with lambda. then incorporate saving, like in discourse */
        sendFunction(info)

    } else {
        alert("That email doesn't look right. Please try again.")
    }
}