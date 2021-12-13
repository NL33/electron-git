**Changelog**
*REMINDER: Turn Off Dev Tools Prior to Packaging for Production*

*V 2.7*
### When search Chrome text, show a preview of the actual text from the Chrome tab, with searched text highlighted
-The search results will show the first insance of the searched for text appearing in the Chrome tab, giving you a preview that helps you understand faster whether that's the Chrome tab you want.

*V .2.6*

### -Working Chrome text searching if Chrome > View > Developer > Allow Javascript from Apple Events is turned on
-if this is not turned on, then there won't be chrome text searching, but the rest of the chrome functionality will work fine.
-the search bar's placeholder will indicate if chrome text searching is available.
-this code will also now return more icons for chrome tabs in the case that "Allow Javascript from Apple Events" is turned on


********
*V .2.5*

### Add gratitude notes

### Faster selection of items from search
-when you open the navigator, your cursor will go right to the search box.
-Then, when you search and you hit the enter (ie, "return") key from the search box, the Navigator will open the first item in the search results. So you can open the navigator, type in a few keys for what you want to view, hit return, and you're done.
-While you're searching, the top result from the search will also be highlighted, to show you what item will be focused when you hit enter.

### hide navigator window after select item to focus on
-Done.
-navigator window now will hide itself after you select an item to focus on (app, window, or chrome tab)
-I find this makes the experience of navigating faster and more clear.

### clear search box, and search results, each time the nav window gets hidden
-Done.
-previously, if you did a search, and then closed the nav window, when the nav window appeared again, it would still have the search query in the search box, and the related results. 
-I changed this, because I found that after I did a search and selected the item I wanted from the search, I was done with that search, and the next time the nav window opened I was just as likely to search for something else. 
- So clearing the search each time automatically saves me the step of having to clear the search myself.

### touch cursor to right side of screen shows the nav window, even if nav window is already open (but in the background)
-previously, if opened nav window, and selected another window, moving the nav window behind that window, then the nav window is in the background behind the focused window, and moving mouse to right side of screen would not show the nav window.
-this has been fixed.

### Correct current loading of chrome tab icons
-previously if there was an error in loading the icon for a chrome tab, the function that provides a replacement icon might not run given when the tab div would run.
-this timing issue has been addressed. So all chrome tabs should have an icon now--either the site icon or a replacement icon

### Issue: Project Window. opening prior version caused error if there are quotes (single or double) in the version description
--fixed. This error no longer occurs. It is now fine to use single or double quotes in you save version notes

### Styling: Navigator Window. Hover bar now goes all the way to the right when hovering over an app, window, or tab. 
- So, when open up nav window by moving mouse to the right of the screen, you only need to move the mouse a little bit to click on an item from the right of the screen.
-previously, there was a margin of 5px between the end of the hover bar and the end of the nav window. This has been removed.
-most relevant for non-column view. In column view, the left column will still have a slight margin to its right. This seems to be the result of the default column styling. 

### Project Window: make window larger
- I've made the project window version larger when it's opened.

### Project Window: close nav window when open project window
- previously, the nav window would stay in the background when open the project window. Now it closes automatically.

### Navigator Window: minimize project window when navigator window opens
-previously, if the project window was open and you called for the navigator window, the navigator window would stay behind the project window. That's been fixed--so now if you have the project window open and call the navigator window, the navigator window moves to the front and the project window gets minimized

### Bug Fix: If select a window or a chrome tab, but that window or tab no longer exist at moment of selection, then open up the app itself
-It is possible (hopefully rare!) that when you call up the navigator, a window or chrome tab shows up on the list prior to the navigator updating, and that window or chrome tab is no longer is actually open. If you happen to click on that window or chrome tab, the navigator will now call up the relevant app itself. 
-In the case of a chrome tab, it will call up the relevant chrome window where that tab was. If that chrome window itself doesn't exist anymore, it will now call up the chrome app itself.