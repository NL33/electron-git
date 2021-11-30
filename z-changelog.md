**Changelog**

*V .2.5*

### Add gratitude notes

### hide navigator window after select item to focus on

-Done.
-navigator window now will hide itself after 1) you select an item to focus on (app, window, or chrome tab), and 2) move the mouse off of the navigator window.
-to hide the window wihtout using the mouse--in the case you are using keyboard keys to select what to focus on, you can still close the navigator with command+2

### touch cursor to right side of screen shows the nav window, even if nav window is already open (but in the background)
-previously, if opened nav window, and selected another window, moving the nav window behind that window, then the nav window is in the background behind the focused window, and moving mouse to right side of screen would not show the nav window.
-this has been fixed.


### Issue: Project Window. opening prior version caused error if there are quotes (single or double) in the version description
--fixed. This error no longer occurs. It is now fine to use single or double quotes in you save version notes

### Styling: Navigator Window. Hover bar now goes all the way to the right when hovering over an app, window, or tab. 
- So, when open up nav window by moving mouse to the right of the screen, you only need to move the mouse a little bit to click on an item from the right of the screen.
-previously, there was a margin of 5px between the end of the hover bar and the end of the nav window. This has been removed.