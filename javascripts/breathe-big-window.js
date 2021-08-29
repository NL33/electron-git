const { ipcRenderer  } = require('electron')


var focusText = document.getElementById('breatheCircle')

/*
    var flash = document.getElementById('focusCircleBreathe')
    var backgroundInterval = setInterval(function () {
        if (flash.is(":visible")) {
            flash.fadeOut();
        }
        else {
            flash.fadeIn();
        }
    }, 2500)
*/
var aClass1 = setTimeout(function () {
    focusText.classList.add('alternateClass')
}, 5000);

var aClass2 = setTimeout(function () {
    focusText.classList.remove('alternateClass')
}, 10400);

var aClass3 = setTimeout(function () {
    focusText.classList.add('alternateClass')
}, 17000);

var aClass4 = setTimeout(function () {
    focusText.classList.remove('alternateClass')
}, 22200);

var aClass5 = setTimeout(function () {
    focusText.classList.add('alternateClass')
}, 27700);

//final time stays with the class until the end

var timeFunc = setTimeout(function () {
    //clearInterval(backgroundInterval);
    closeWindow()
}, 34000); //after 30.2 seconds: stop backgroundInterval function and send note to close window. Note that it is 30.2 seconds, not 30 seconds, because this executes faster than the play chime function in mainBar.js. I want to chime sound to go off first, so I delay this slightly.

document.getElementById('breatheBody').addEventListener("dblclick", () => {
    closeWindow()
})

function closeWindow(){
    clearTimeout(timeFunc)
    clearTimeout(aClass1)
    clearTimeout(aClass2)
    clearTimeout(aClass3)
    clearTimeout(aClass4)
    clearTimeout(aClass5)
    ipcRenderer.send('close-breathe-window')
    window.close()
}