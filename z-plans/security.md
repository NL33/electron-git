**Security Considerations**

# electron security tutorial

https://www.electronjs.org/docs/tutorial/security

key point: if your application executes code from an online source, it is your responsibility to ensure that the code is not malicious.

Me: I don't think the app does right now. 
1. It is either entirely local to the machine, or
2. Sending stuff to discourse, or
3. getting a response from discourse (but the site itself--a trusted source.)

I am not receiving code from a remote server other than the discourse site that I control. And I am not displaying that content in the app. 

Note the key point: if remote integration is enabled, YOU MUST NOT load and execute remote code. Note that I am not displaying that content in the app.

With ONE important exception. Right now, I allow the user to copy a web page, and put that into a doc. Then, they can open that in the electron app. 
    --if they click on a link from that web page, they go to where the webpage would take them, and loaded in the app. I have to turn that off.

# Concerns about using remote

good description here: https://stackoverflow.com/questions/37994441/how-to-use-fs-module-inside-electron-atom-webpack-application

The security risk of activating nodeIntegration

nodeIntegration: true is a security risk only when you're executing some untrusted remote code in your application. For example, suppose your application opens up a third party webpage. That would be a security risk because the third party webpage will have access to node runtime and can run some malicious code on your user's filesystem. In that case it makes sense to set nodeIntegration: false. If your app is not displaying any remote content, or is displaying only trusted content, then setting nodeIntegration: true is okay.


# BUT, how do you use ipcRenderer if node integration is turned off?

some solutions here: https://stackoverflow.com/questions/52236641/electron-ipc-and-nodeintegration

One method to get file system access in renderer with node integration off:

preload.js

    var API = function () {
        const { writeFile} = remote.require('fs');

        API.writeTheFile = function (filePath, updatedContent) {
            writeFile(filePath, updatedContent, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    alert('File Saved')
                }
            })
        }
    }

    window.api = new API();

main process:

var htmlWindow = new BrowserWindow({
            width: 670, //320,
            height: 650,
            title: fileTitle,
            x: 0,
            y: 0,
        // alwaysOnTop: true,
            webPreferences: {
                preload: path.join(__dirname, './preload.js'), //path.join(app.getAppPath(), 'preload.js'),
                nodeIntegration: false, 
                contextIsolation: true, 
                enableRemoteModule: false,
                sandbox: true,
                additionalArguments: [thePath, content],
            }
            
        })
       //window.loadURL('file:' + filePath);
       htmlWindow.loadURL('file://' + __dirname + '/views/loaded-html-window.html');
    }

html-window:
    var updatedContent = document.getElementById('htmlContentHere').innerHTML
    window.API.writeTheFile(filePath, updatedContent)
