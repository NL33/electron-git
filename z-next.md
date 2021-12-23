**Next**

*General*

--check just packaged version (in the out folder on desktop from 8:40pm)
--put on site.
--respond to sofia--send her the stuff. and ahmet 

# through navigator, open any app.
- this can probably replace the need to have set apps in the navigator that are saved there. This accomplishes basically the same thing. Could do that too, would just be:
        -right click to save app to navigator. that app name gets saved in local storage, along with icon. when open navigator, create array based on local storage. then load the apps, and check if match in local storage--if match, then remove from the array to show. any remaining app names in array get shown in the navigator. click on those names, and call macFocusAppName, which just requires the app name. 

- note: for icon when doing the below, can just get it from the icon folder (ie, call for the app, and then check icon folder in case there is an item there with the same name as the app). Better than running get icon function
- replicate spotlight search functionality. How?
- get the names of the directories in the applications folders (/Applications). If not sure, see how I would do it in project window if focusing on applications directory.
- those names are the names of the apps
- when open nav window the first time, save names of those apps as a hidden div
- update that list when open again  
    -to see if want to run the update function, just get the number of apps in that folder, and see if the number of apps have changed. then if they have, run the function.
- put those app names in hidden divs
- then, when search in the box, search these names--manipulating the divs in the same way you do right now for the open apps. if there is a hit, show that after the open apps. 
- if select that item, then open that app.

 # microsoft office products (word, excel, powerpoint): close items from navigator   

# Bug: if open project window, can't get rid of basic window.

# Bug: navigator keyboard functions, lines 78 and 98
-sometimes doesn't highlight and throws error. depending on where in the update it is.

# dark mode option
-preference in tab bar: toggle dark mode
-when dark mode selected, add class to the following (with !important for each change):
    -body Id (with background-color: black)
    -appDetails, windowName, windowSpan, tabOverview: (with border: 2px solid black; color: white)
    -change hover text to lighter version of #3399ff (maybe can do document.getElementsByClassName(appDetails:hover))?
    -change search text to white


# change icon?
- could change tray icon to something that fits with other icons. 
# bug:
nav window was opened
no chrome window present
I hit "toggle chrome position"
the apps doubled up.
stayed that way until new update

# make style and font the same between navigator and poject window

# Javascript from Apple Events in Chrome, with Chrome Extension
-chrome extension that gets text of tabs, and then sends to desktop app
-that extension would need permission, but hope is that it would work without requiring blanket permission of javascript from apple events 
    -goal is to achieve the same as "whitelisting" the desktop app to be able to do this, without enabling other apps to do it without express permission.


# When open navigator, have cursor visible in search box faster
right now, if do a search, select an item, and nav closes. When you open nav again, it can take a few hundred miliseconds for the cursor to be visible in the search bar. (on my computer). It is slow to show while the system is doing other stuff. Especially, clearing out the prior search.
-anything to do to make this smoother?

# project window: when create new file or folder. get this warning in console:
Form submission canceled because the form is not connected

# bug: projct window: if try to save version and there is an error, it will hang. And the "saving versions" div will stay there, even if change project.
-so need way to refresh that view

# project window: make saving version faster.
-I had thought removing the init running each time would help, but that doesn't seem to make a difference (and git docs say it's fine to do it)
-maybe a way to speed up with child process code?


# Error in search function

- when search, get this error almost all the time: Looks like the Navigator encountered an error doing a search. Sorry about that. You can press Command+1 to reload and try again. Here's the error (get ready for techno-speak): TypeError: Cannot read properties of null (reading 'classList')

# put instructions for how to remove the version files (ie. .git) in folder


# make icons work in production
-current get windows icon code in navigator-add-icons.js doesn't work in production, because icon2png doesn't work in production.
-issue related to paths of files in production
-for now, I have sidestepped the issue by just getting a lot of icons in the hard-coded code during local use. And then keeping those icons there when I package for production

# make child process code work
-code in draft navigator file, under "new-jxa"


**Possible Next**

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



*Gratitude Notes*

# steps
**removed from menu bar, pending working code**

- save note text. DONE
- show note text in console log. DONE
- save additional aspects: including date. DONE
- show additional aspects, including date in console log. DONE
- print note on window under the entry box. Would be showNotes() function in gratitude-window.js. DONE.
- display notes by date. DONE.
- color the date display. Done

- get all months that have been entered--and retrieve them in console log. DONE.
- show all months where entry made--start by showing on left side. START HERE.
    -create month entry when you create note entry, just like year for now.
    -retrieve one array for whole month schema (faster than getting different arrays per year)
    -sort array by monthNumber
    -then, when showing month, find the year that corresponds to the month entry's year, and load content in there
        -
- click on month and show all notes from that month
- select month to see notes from that month
- select year to see notes from that year 
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
- tags. could call grat notes = free notes. And they are notes that you record to get elevated/feel free/get in a mindset of freedom. There could be a tags schema for listing out the tags. And then each note would have tags (in the schema, a *tags connotes there would be more than 1). My tags would be: gratitude, coincidences, electric ideas.
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
