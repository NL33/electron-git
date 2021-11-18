const { ipcRenderer, ipcMain } = require('electron')
var okToCall = true
window.onload = function(){
    window.addEventListener("mouseover", function (event) {
        //console.log('hover')
        if (okToCall === true){
            //console.log('show open')
            ipcRenderer.send('hover-nav-window', '')
            okToCall = false
            setTimeout(function () {
                okToCall = true;
            }, 600);
        }
        
    })
}

/*
    window.addEventListener('mousemove', function (e) {
        console.log('hovered')
        if (okToCall === true) {
            ipcRenderer.send('open-nav-window', '')
            console.log('call navWindow')
            okToCall = false
            setTimeout(function () {
                okToCall = true;
            }, 600);
        }
    })
}



/*
("mousemove", function (event) {
        console.log('hoverererer')
        if (hovered === true){
            console.log('show open')
            ipcRenderer.send('open-nav-window', '')
            hovered = false
          //  window.removeEventListener('mouseout', goFunction)
        }
        */
/*
window.onmousemove = function () {
    console.log('hovered')
    if (okToCall === true) {
        ipcRenderer.send('open-nav-window', '')
        console.log('call navWindow')
        okToCall = false
        setTimeout(function () {
            okToCall = true;
        }, 6000);
    }
}
*/

/*
function hoverAction() {
    window.addEventListener('mousemove', goFunction = function (e) {
        console.log('hovered')
        if (okToCall === true) {
            ipcRenderer.send('open-nav-window', '')
            console.log('call navWindow')
            //okToCall = false
            window.removeEventListener('mousemove', goFunction)
            setTimeout(function () {
                hoverAction();
            }, 600);
        }
    })
}



*/