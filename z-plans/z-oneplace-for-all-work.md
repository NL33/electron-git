**One Place for All Work: Planning**

# Goal

The command center is one place that organizes all your work related to a project.

Including:
-email
-websites
-podcasts
-apple notes

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

# apple notes: make it easy to use with apple notes
--option 1: general view applicable to any program:
     --as is: copy text, hit create paste doc.; then probably add back the "update paste doc" so can update text. DONE [could add some dialogs confirming actions later]
--option 2: make it really good for apple notes specifically:

     -using apple script, I can get the 1. id, 2. name, 3. folder, 4. html, and 5. content of currently selected apple note, and last saved apple note.

    --can open apple note itself in notes app using the id

     --with that, I can have a system where you press a button on the toolbar or do a keyboard shortcut, and it can automatically create a file, put the note id in the file (or in file metadata?), and put content there. Then, when you want to update the note on your saved version, you just hit the button and it can find that doc by id and update it.

     --I can also take the html of the note and convert it to markdown for viewing.

-to do option 2:
--make apple script work for simple apple note in the app (ie, make apple script work in jxa). DONE.
--add button to header to create doc with id. DONE (currently using right click)
--add content to that doc. DONE.
--place the doc right--put it under the currently highlighted folder. DONE
--update that doc with button press. *START HERE*
--consider if there is any way to keep the current structure of html to markdown, while improving look and indents of dashes
--open the note with apple notes app from doc
--make apple notes doc work to open right after create it (right now there is bug in the code)
--see if way to make it go faster--test with script to compare time. seems like sometimes its much faster than others

# Further notes on apple notes
current stance: could go with either.
--right now, converting html to markdown.
    --good parts: can keep heading bold, and doesn't require changing clipboard
    --downsides: numbered lists don't work well. can't keep indentation for bullets (dashes or bullets). no distinction between bullets and dashes.
        seems like lost markdown too. but why?

--alternative:
   (a) automatic copy
    1. with applescript, copy the text of the foreground note (check if notes in foreground, then do command press A, and command press copy)
    2. get id and name of note
    3. create file, adding in id, then text from clipboard.

    benefits: 
        --will keep more formatting for tables, bullets, and dashes.
        --probably looks better for sharing
        --maybe a way to preserve the look if convert back to apple notes?
    
    downsides:
        --lose formatting of header. But: can do markup text for that to compensate
        --lose bold and italic text. 
        --messes with clipboard

    (b) user copies, then hits "apple note file". and it gets the id, and adds clipboard text.
        1. But: user might mess up copying.
        2. takes more effort


# New approach on apple notes:
get the html of the note with applescript
    -keeps nearly all formatting
    -adds a few extra spaces, but I can remove that (remove anytime there is a br in between other tags)
    -if display in app, it looks pretty close. 
        -so could view prior version in app.
        -if copy from prior version then paste into note itself, then formatting stays pretty close. and it's easy to get the formatting back when paste back in.
    --key: view the paste file within the app.
        --might be the way you'd want to view any html file.
    --apple note: save as html file and (apple-note) notation. 
        --then, when go to view it, if it has apple-note notation, then clicking on it opens it up in the app.
            --and can right click to open document directly
--other html files:
    --could have option: save webpage. you copy the text, and the app gets the web address and title.
    --creates an html doc, with the html of the page.
    --when want to open it later, opens within the app so formatting is there
    --could open up "get infor" or users to change default opening program too, or just "open with" dialog

# Opening the html files directly

--the files are rendered as viewable in text editor mac program, and chrome, and (probably) notepad for microsoft windows
--will be shown as source (with divs, etc) if opened in an IDE

# Diffing the html files

--showing the html files in app itself works well. the diff renders the html content as real content (does not show divs and the like).