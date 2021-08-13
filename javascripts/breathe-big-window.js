var ipc = require("electron").ipcRenderer

/****MENU ITEM***/
const { remote } = require('electron')
const { Menu, MenuItem } = remote

const menu = new Menu()
menu.append(new MenuItem({
    label: "Close", click: function () {
        ipc.send('stop-focus-timer')
        window.close();
    }
}))

window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.popup(remote.getCurrentWindow())
}, false)

/**END RIGHT CLICK MENU***/

$(window).dblclick(function () {
    ipc.send('stop-focus-timer')
    window.close();
})
if ($('#focusText').closest('.focusCircleOverview').attr('id') === 'focusCircleBreathe') {
    var $flash = $('#focusCircleBreathe')
    var backgroundInterval = setInterval(function () {
        if ($flash.is(":visible")) {
            $flash.fadeOut();
        }
        else {
            $flash.fadeIn();
        }
    }, 2500)

} else if ($('#focusText').closest('.focusCircleOverview').attr('id') === 'focusCircleFantastic') {

    var $flash = $('#focusCircleFantastic')
    var backgroundInterval = setInterval(function () {
        $flash.toggleClass('flashButtonFantastic')
    }, 2000)

} else {

    var $flash = $('#focusCircleLookStrong')
    var backgroundInterval = setInterval(function () {
        $flash.toggleClass('flashButtonLookStrong')
    }, 1500)
}

setTimeout(function () {
    clearInterval(backgroundInterval);
    ipc.send('close-focusWindow');
}, 31000); //after 30.2 seconds: stop backgroundInterval function and send note to close window. Note that it is 30.2 seconds, not 30 seconds, because this executes faster than the play chime function in mainBar.js. I want to chime sound to go off first, so I delay this slightly.