# Electron Git

Copyright 2021, Race to Saturn, LLC. All right reserved.

Notwithstanding anything written elsewhere in the code of this app, any use outside of this app of the code in this app requires the prior express written approval of Race to Saturn, LLC.

## About

This is an app that uses electron and javascript to make it easy to use git when you are doing work, including work beyond code.

## Notes for Packaging

- clear out icons/memory.json.  and any icons built up in the icons folder. Unless want to have a few there for faster load.

- remove dev tools in menu

- and remove open dev tools call in opening windows

## Next
- when select item in navigator, minimize the navigator window. DONE (currently hides it)
- keyboard shortcut (command+2) for calling up project focus window. DONE
- keyboard command+1 still calls up navigator window, even if window has been previously destroyed. DONE
- add open navigator window to menu tray. DONE
- arrange window order so name of window appears first, and if there is a tab in the window, have that be second. DONE
- add right click menu to main.js. DONE 
- add keyboard shortcut symbol to menu items. DONE
- add navigator button to project window
- update main window code for updated electron--coordinating remote modules
- update other windows code for updated electron

- icon activity
    - add icon for chrome when tab icon doesn't work
    - add microsoft word icon manually
    - add another default icon for if other windows' icons don't work       
    - add chrome icon manually to show up if chrome tab icon doesn't work       
    - add google folder and doc icon for project focus manually

- open dev tools, but only if in development

-   Display flex does some wierd things: counters display : none (overriden here with !important in the hidewhileloading clas); and cuts off images in columns.
- instead of display flex: can it work to make the tabs li s, and the image as the bullet point?