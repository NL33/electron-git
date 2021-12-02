**Next**

*Gratitude Notes*

# steps
- save note text. DONE
- show note text in console log. DONE
- save additional aspects: including date. DONE
- show additional aspects, including date in console log. DONE
- print note on window under the entry box. Would be showNotes() function in gratitude-window.js. DONE.
- display notes by date. DONE.
- color the date display. Done

- get all months that have been entered--and retrieve them in console log. START HERE: go to line 74 in grat window.js in order to get the noteId into the year's noteIdarray. Why do that? should allow flexibility later for showing manipulating notes
- show all months where entry made--start by showing on left side
- click on month and show all notes from that month
- add "view more notes" button
- hide month view
- show month view when click view more notes

- add styling of month view
- add styling of main note entry and view

- add keyboard shortcut for gratitude notes
- add main menu 

- only save note if more than 3 characters

# as of that stage, probably done with MVP for gratitude notes

# other features
- delete notes
- search notes
- add some kind of backup system on the computer--in case the database is accidentally deleted (for example, by a flawed update)
- if dexie structure is: noteInfo, yearInfo, and monthInfo: then if you delete a note, it's possible that there could be no more notes in the year or month. So, you'd want to remove the year and month from the yearInfo and monthInfo, respectively. Possibly: do the deletion at the point of user trying to load notes from that time and nothing showing up. Only THEN delete. 
- choose a note at random to display when window opens 
- basic markup:one star for italics. two stars for bold on entry
- edit note
- backup note (time machine sufficient?)
- change background color of window when entring a gratitude note
- tags?
# Possibilities
- possibility 1: notes saved as documents
 - create new
    -   searches to see if there is a doc for the month yet. 
    -   if not, create a new gratitude notes for that month
    -   in the doc, adds a new entry for that date and time
  - retrieve
    -   open old folders
  - benefits
    -   easy to send to people
    -   faster to set up
    -   if app gets removed from computer, the documents are still there. 
  - issues
    -   location: saved to desktop
        -   what if user wants to move the notes folder 
            -   app needs to know where folder is
                -   could have option to move the folder location through the app
                -   if move the location on your own
                -   not clear
    -   not very customizable
        -   but, could save the notes as docs. And then parse them through the app. 
            so you can do the view through the app. But the actual docs are saved as docs on the computer. 
- possibility 2: notes saved in app database
 -  benefits
    -   confusing to user to create a folder on their desktop, that opens up actual documents. 
    -   can optimize for this purpose over time. 
    -   can later be linked to user login
        -   CURRENT IDEA: try the database solution, mainly bc of possibility of adding new items to it later. 
            - like tags
            - colors.

*General*
# Javascript from Apple Events in Chrome

- Right now, searching chrome tabs is turned off, as is the favicon. because of issue of whether use has to turn on javascript from Apple Events. If this changes, change the following:
  - search box: put back in search chrome tabs
  - navigator - window. js: put back in favicon code
  -navigator-jxa, adjust chrome tabs
- clear out icons/memory.json.  and any icons built up in the icons folder. Unless want to have a few there for faster load.

- Allow Javascript from Apple Events is an option in the view/developer menu item in Chrome. It needs to be turned on for code that includes "execute" javascript to work. In the prior app version, that code occurs when searching chrome tabs, and getting chrome icons

# Error in search function

- when search, get this error almost all the time: Looks like the Navigator encountered an error doing a search. Sorry about that. You can press Command+1 to reload and try again. Here's the error (get ready for techno-speak): TypeError: Cannot read properties of null (reading 'classList')

# make icons work in production
-current get windows icon code in navigator-add-icons.js doesn't work in production, because icon2png doesn't work in production.
-issue related to paths of files in production
-for now, I have sidestepped the issue by just getting a lot of icons in the hard-coded code during local use. And then keeping those icons there when I package for production

# make child process code work
-code in draft navigator file, under "new-jxa"


**Possible Next**

# saving new version takes too long now. fix
- likely because it runs a git init each time.

# add default apps. ^^New Feature
-when open an app, in the navigator, be able to right click and add to default apps. So it shows up no matter whether opened or not.

# close apps from navigator, whether or not they have windows.
-currently, not able to do that--gives error if try to close item that has no windows.

# if in search box and hit down arrow, move out of search box and into the list to select item to focus on 
-right now, the way to move out of the search box is with tab

# when search for app name in navigator window, show all the windows of that app

-example: search for "word", and show word app + all the word docs open. It gives you an isolated view of just your word docs to navigate between

# project window: prior versions window has online icon. change to saved icon

# nav window: take all the windows and tabs open, and be able to save that configuration. ^^New Feature.
-can save the details in local storage with a name.
-can then retrieve that set up later by clicking on the name.
-can limit the amount to 10 or 20 different setups.
-when then click on the saved setup, code will go through and open each item.
-issue: might be slow to open all those iems 
-andcheck if the item is already open first
-basically, get a lit of everything you want to open. Open it. then update the navigator to reflect what's opened.

# change color of title bar that says "Navigator"

# make font of nav window same as font of project window

# change background color of nav window (something just slightly off-white)


**Old Next**

## Next
- when select item in navigator, minimize the navigator window. DONE (currently hides it)
- keyboard shortcut (command+2) for calling up project focus window. DONE
- keyboard command+1 still calls up navigator window, even if window has been previously destroyed. DONE
- add open navigator window to menu tray. DONE
- arrange window order so name of window appears first, and if there is a tab in the window, have that be second. DONE
- add right click menu to main.js. DONE 
- add keyboard shortcut symbol to menu items. DONE
- hide navwindow with shortcut command+4. DONE
- add navigator button to project window. DONE
- click navigator button on project window to open Navigator. DONE.

- update main window code for updated electron--coordinating remote modules. START HERE:
    - just revised code at main window.js 620 on. DONE.
    - AND main.js 165 on.
    - just got it working to right click on folder and show menu options. DONE
    - next:
        -   main.js menu code: 
            - send back to functions in main-window.js. DONE
            - confirm working for right clicking folders. DONE
            - working right click menu for clicking project name. DONE 
            - working right click menu for doc (see code for fullId !== projectDirectory in main-window.js). DONE
    - look for anywhere else in main.js that has remote module. DONE (currently exists in compare versions--that can be removed another time)
- add new code for speeding things up. START HERE.
- hover action:
    - After result comes back from selection, then:
    - if hover off of nav window, then hide nav window. DONE


- Make sure if hit keyboard shortcut or hover too many times, it only calls the start loop function 1 time. in other words: start loop function should not be called when it's already being run. DONE

- icon activity
    - add icon for chrome when tab icon doesn't work. DONE
    - add microsoft word icon manually. DONE
    - add another default icon for if other app's icons don't work. DONE          
    - add google folder and doc icon for project focus manually. DONE

-ADD Icons locally and carry over to app itself. DONE


- potential bug: bringing a window to the front. DONE
    - problem: have app and window (1). Then open new app (2) in front of it. When try to open window 1, it won't go to the front--if app(2) (not windows of app 2) have been selected. 
        - If app is brought to the front, it is taking precedence over other app windows?
        - if last selected item from app is an app, then other app windows won't take precedence over it
        - if the window is minimized, and maximize it-it will open, but then go behind the window in front
        - maybe because it changes the index of the app
        - possible solutions
            - Application('name').active() //seems to work--so if call windows with that, then it should work. Issue=this calls all app windows to the front (and activate only works on apps)
            - things seem to work fine when close the nav window and re-open. Then this issue goes away. But not if just reload the nav window (or hide and then show it). Why? Not clear. 
            - if remove "always on top" from nav window--then it seems to mostly take care of this issue. Why? Not clear. 
                - Note that clicking on an app to bring it entirely to the front doens't seem to bring all open windows to the front.--that seems to only bring one window to the front anyway. That does not seem to be related to the code here.
                - appears resolved through removing "always on top" from nav window

- *stop reloading if already loading the app for the first time. DONE
- *remove search box when app is going to run. DONE
- *open dev tools, but only if in development*

- *any way to speed up starting of loop function when app runs? 
    -Seems to return apps very fast, but then can be slow to get chrome windows.
        --load other windows and show them 

- close microsoft word docs from window. not working. why?

- save your apps. (so when navwindow opens the app appears, even if not done). I've created file about that at load save apps.

- add menu item that says howto (write out the instructions separately, and then style)

- one more shot at making it faster (for focusing and closing windows and tabs)

- possibility for showing window. DONE
    - have a thin, transparant window over to the right side of screen.
    - hover over that, and show main window
-   Display flex does some wierd things: counters display : none (overriden here with !important in the hidewhileloading clas); and cuts off images in columns.
- instead of display flex: can it work to make the tabs li s, and the image as the bullet point?

- option to open app at startup

- remove extra init in project window
- minimize windows from navigator
- update other windows code for updated electron
    - will need to remove anywhere that requires the remote module in the js file


***
