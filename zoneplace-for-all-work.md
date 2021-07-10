**One Place for All Work: Planning**

# Goal

The command center is one place that organizes all your work related to a project.

Including:
-email
-websites
-podcasts

# Incorporating Email

goal: easily add any email to project docs in an organized way
-with nutjs, can get title of open email. But 
    -often the title might be different than what you want to actually call it for your own project. In fact, better to encourage people to title it themselves.

have an email related to project, and add to project files. 

1. have an email.
2. copy 
3. click button in control center to 
    -create file.
        -options: right click menu, header menu, keyboard shortcut
    -give it name
    -automatically paste it in (programmatically).
    -easy way to open/view it
    file type options:
        -md, txt, or rtf
    -give automatic file extension (like txt) if user does not add extension themself 

# Cool Flow Possibility

You are going through your email, and you see an email relevant to a project. You can easily add that to your project flow.

--could doc be tagged with title of the doc?
    --email: can get subject line through email with nutjs
    --apple notes: can put in the id of the apple note into the doc
--got your doc, press keyboard shortcut, and have it saved to your folder


# Status
July 10, 2021

Just made it so that you can "create a paste file"--copy some text from email or a website, and hit create paste file--and it automagically creates the file.
-I was also trying to figure out how to later update that file. I added a right click "update paste file" button--that would require you to copy the whole new text, and automaticlly have it pasted in. But what if you hit "updat paste file" for the wrong file, or by accident? And maybe you don't want to add it all in. Maybe just some additional parts. Bottom line: you probably will want to do it manually. 
     --the key, then: make it really easy for you to **find** the document you want to update. maybe through:
          -good search. is there a way to add search relatively easily by mimicking mac spotlight search? Could be search within present file or across all files.
          -some other way?
          -bottom line: this is nice feature, but not the most important, so not worth days and days. 
    -current approach to keep things simple
        --button to open up the folder, where you can just search it using the native search possibilities.
        --for mac, can probably go right to search with applescript, like here: https://apple.stackexchange.com/questions/308475/applescript-how-to-search-files-in-folder-for-string-and-show-results-in-finder

# Attempt at adding title and url to the file

-Using active-win, I can get the url and title of a window. For gmail, this means the subject of the currently focused email, and the url of gmail.
-the issue is that to get this, I have to hit a button in the taskbar up top, or a keyboard shortcut. 
-My thought: keyboard shortcut adds this info to whatever is on the clipboard, and then this is ready to go in a new doc. Code like this:

Main.js:
    const activeWindow = require('active-win');
    async function sendTheWindow(){  //send info on front window to the main app window
        var theWindow = await activeWindow();
        newVersionWindow.webContents.send('active-window-info', theWindow)
    }

main-window.js:

    ipcRenderer.on('active-window-info', (event, arg) => {
        console.log('info that we got = ' + arg.url)
        var title = arg.title
        var url = arg.url
        var content = clipboard.readText()
        var value = 'Title: ' + title + '\n' + 'Url: ' + url + '\n' + content
    }

I could then use this "value" info in a few ways. I could call a function to open an input on the main app for you to title the file, and then write that file. Issue: what subfolder and indent does this file fall into? To know that, 
    --(1) go with whatever was highlighted before? That might work. So long as able to move files (because this probably would be error prone by user)
    --(2) put file at top of window, and then you can just move it to wherever you want.

(1) could work. Like this:

    ipcRenderer.on('active-window-info', (event, arg) => {
        console.log('info that we got = ' + arg.url)
        var title = arg.title
        var url = arg.url
        var content = clipboard.readText()
        var value = 'Title: ' + title + '\n' + 'Url: ' + url + '\n' + content
        var divId = /***GET ID OF CURRENTLY HIGHLIGHTED DIV*****/
        var newIndent = parseInt(indent) + 17  /***GET INDENT OF CURRENTLY HIGLIGHTED DIV AND JUST ADD TO THAT***/
        var element = document.getElementById(divId)
        contents = `<form action="#" id="addForm" style="margin-left: ${newIndent}px" onsubmit='createPasteFileFromActiveWin("${divId}", "${mainPath}", "${indent}", "${value}")'>
                    <input type="text" class="docOrDirectory"  id="nameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                    </form>
                    `
        var newItems = element.nextElementSibling  //gets "newItems" div
        newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
        document.getElementById('nameEntry').focus()
        /****THEN WANT TO SET UP CREATEPASTEFILEFROMACTIVEWIN function to create file, matching the current createPasteFileFromActiveWin()... function, accept now adding in the value, instead of just what's on clipboard***/
    })

BUT:

Is this worth it? A lot may be manual anyway. I might have my own system for entering the subject of the email, and also the url of a random site I am looking at. 

And this method is kind of confusing for the user.

*CONCLUSION for adding in title and url automatially:* If a better method is not available, probably not worth pursuing right now. So we'll just go with allowing you to take what's on clipboard and easily add a new file to it. (July 10, 2021).