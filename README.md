# Electron Git

Copyright 2021, Race to Saturn, LLC. All right reserved.

Notwithstanding anything written elsewhere in the code of this app, any use outside of this app of the code in this app requires the prior express written approval of Race to Saturn, LLC.

## About

This is an app that uses electron and javascript to make it easy to use git when you are doing work, including work beyond code.

## Package App Commits

7239b72, packaged Nov 17, 2021, 9:15pm. Version .2.2. posted Nov 17, 2021, 9:00pm US EST

f24953d, packaged November 17, 2021. 2:53pm. Version 0.2.1. posted Nov 17, 2021, 3:00pm

dfaaeb9, packaged November 16, 2021, 7:11pm EST. Version 0.2.0

## Notes for Packaging
- *CHANGE DEVTOOLS*

- Right now, searching chrome tabs is turned off, as is the favicon. because of issue of whether use has to turn on javascript from Apple Events. If this changes, change the following:
  - search box: put back in search chrome tabs
  - navigator - window. js: put back in favicon code
  -navigator-jxa, adjust chrome tabs
- clear out icons/memory.json.  and any icons built up in the icons folder. Unless want to have a few there for faster load.

- remove dev tools in menu

- and remove open dev tools call in opening windows


## Issues
- chrome tabs: not able to gt tabs (Kelvin Chan had this issue on Nov 18, 2021 during zoom after downloading). Seems to me issue is permissions, specifically: Security*Privacy > Automation. RtS needs to be marked as being able to control the apps there, including Chrome.

    -The other security and privacy item is Accessibility. Here, if RtS is not listed as given permission, app will show error: 
     "Error: osascript is not allowed assistive access."

- It looks like permission to Accessibility comes up with a prompt when opening the app. not clear if that's the case for Automation.

- chrome tabs: getting error icon. could be from when have two or more tabs that don't have icons.

- consider having background be off-white (silver); to get it looking like the icon quality on the dock (check the dock color)


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

Attempt to have hover window:
function openHoverWindow() {
    var theDisplay = screen.getPrimaryDisplay()
    var screenWidth = theDisplay.bounds.width
    var hoverWindow = new BrowserWindow({
        width: 1,
        height: 500,
        x: screenWidth - 10,
        y: 1,
        alwaysOnTop: true,
        transparent: true,
      //  frameless: true,
        //show: false,
        //hasShadow: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
        }
    })

    hoverWindow.loadURL('file://' + __dirname + '/views/hover-window.html');
    hoverWindow.openDevTools()
}

html:
<!DOCTYPE html>
<html>


<head>
    <meta charset="UTF-8">
    <style>

    </style>
    <title></title>
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline';" />
</head>

<body id="bodyId" style="height: 100%; ">

    
    <!--THis is a test comment for the basic window file-->
    <!--*************END OF FILE******************-->
    <script src="../javascripts/hover-window.js"></script>
</body>


JS:



