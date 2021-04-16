**Next in the Electron Git App**

# Next goals

--I've made it possible to make shell commands from the app
Next:

## Git on local computer
-hit button in electron to show the focused file
    to see file in focus, recall that this is what the operating system does
    this stack overflow has some info on possible solution: https://stackoverflow.com/questions/42913268/how-to-get-the-title-of-the-foreground-process-window
    this chapter has some potentially helpful info too: https://livebook.manning.com/book/electron-in-action/chapter-6/89
-create git actions with that file (can create a sample file to work with)
--create a topic remotely from that file

## Github like system that makes it easy for you to post a project that other people run with
--this is probably the most important piece
--based on discourse most likely 
--consider the best structure for this.


# More on Git in local computer from Mem

in mem app: , they
    1. allow you to save the current web page (ie--identify the current webpage outside of electron): https://youtu.be/RDllEUJ6MKQ?t=86
        1. go to page, 2. open mem with a keyboard press, and 3. it shows you current webpage in mem. 4. you can save it. 5. when you add it to mem, you can add a descriptive note to it.
            note: keyboard shortcuts might be important, because otherwise you have to press in the app. with a shortcut, maybe you get around that
            could be that they just get the last page you were on before opening the page
    2. You can also highlight selected text, and then you get an option to save that text. https://youtu.be/RDllEUJ6MKQ?t=92
        -select text. open mem, and it puts it there.
        -then you can save it and label it

    3. they also allow you to take something you've saved in mem and paste in anywhere the cursor is (using keyboard shortcuts)--can probably do that with robot.js

# My Goal

1. highlight text, and with touch of button have it go to the app
    1. highlight text and have it copied

even better

have an open window (including email, or evernote), click button to add to site, and it does it. 

how: 
1. get last focused window
2. highlight all text in that window
3. copy that text
4. send it

npm rebuild --runtime=electron --target=12.0.2 --disturl=https://atom.io/download/atom-shell --abi=83

target = electron version abi=83
***
# leading possibility on night of April 13, 2021:
1. create a global shortcut in main.js that
2. copies selected text (or,even better, all text in the currently active window--like (i) highlight all ,then (ii) copy)
3. then, have a button in electron that executes that global shortcut (and when you do, you can make it a super complicated global shortcut so the user doesn't hit it accidentally. possibly activate the global shortcut with an invisbile window: 1) hit button in electron window, 2. create invisible window, 3. call the shortcut from the invisibel window, getting the highlighted text from the focused window in some way, 4. after action done and saved to clipboard, close invisible window)

remember:
you can do stuff with an invisible window and non-focusable window

aa




***
other possibilities:
blur event. 

hidden electron

copy all the text in a currently active window, and have that set by a non-focusable electron window


