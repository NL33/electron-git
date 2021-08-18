*Notes from Sunday August 16*

# Composer
-issue is probably code for creating new composer is not right, but then the cache saves it for the rest of the composers. Need to clear out the composer cache. One method: sign in as different user and see if the issue is there.
-can also figure out th code by experimenting on the live site. Choose a plugin outlet (for code for that, see post about decoratewidget, where they give the code for how to use a plugin outlet instead). and put a button there. then try code for loading the composer and adding a field to it.

# showing version notes with files

-create custom field for version notes
-when upload a doc, attach those version notes to that doc.
-then, can show the version notes with the doc. maybe in list view?
-can show on doc show view potentially?
-when look at past versions on discourse, potentially see the custom field there?

# Loading docs -- Categories

potentially: all main project files are in one category (that does not allow replies), and all comment topics are in another (that does allow replies)

when loading, could you first filter by category, and then custom field?

see in routes.rb if there are category routes to call (maybe it's as easy as /c/cat_id?project_name='....')

Or, could do category+latest?project_name...

And then do separate categories for the different types of content (surges, music, milestones, etc)

And for a users home page, could look up the route in routes.rb that is about showing topics by user, and filter category for projects, and then:
1. parse the results, find the different project names, put them into an array, and just load the project names. Then when click on the project names, have link to the project home page
2. alternative, just show the latest documents. But there should be somewhere you can go to find a particular project to view.

# Next


*Sending Docs to Discourse*

# set up database

done.

# when sending a doc, update database entry with doc info (docId (birthtime), filename, discourse topic id, discourse postid)

DONE.

# file and folder icons in window
and in old versions window too

# have project page on discourse, based on tags
--link topics based on tags. DONE.
--edit tag show page to look more like a repo page
--could have "project-summary" doc or the like show up as a description right there. 

# comment system

underway


# authentication 
try mughees' suggestion. DONE. I tried entering http:// or https:// in the redirect url, and it did not make a difference. I've emailed him about it. still need to get custom protocol to work.

# private posts (later)
# add comments to the version you are sending to discourse, explaining the update. Would be a topic custom field, updated through the API. and then a field on the topic page to view the comment.
# delete topics when removed from the file

*Additional Nav elements to desktop app*
-button to minimize all windows. DONE. Except:
     --looked into this. doesn't seem to be a way to do this with file system. And applescript method is not ideal--it closes them one by one, and its hard to get them back
-add breathe big button
-add gratitude notes
-make faster to choose file (later)


# PAyments

stripe now has payent links. Create a page through stripe. Create a link. put the link on site. User pays there
     --basically same as a checkout page on the site. But saves you having to code up or set up the page on the site.
     --question: how do you then know whether the user is paid or not? can probably just stick with discourse subscriptions for now. if not using discourse, payment links are a possibility.


# apple notes

--make the content process faster for apple notes.

# Html files
--add loading symbol while it's loading.

--if edit an html file, add ability to save any changes you make to it. But actually, right now if that note has the same name, it will create a nother file with the same name. Before refreshing the main window, it will show as two files. But then after refreshing it will show as one.
     want to link with the apple note id
     while that is better, for mvp purposes, probably ok just to go with title of the note: but if go this route, probably have to get the folder too, otherwise could be too many duplicates across one person's notes

--after create apple note, if try to open it immediately, it will show error:
main-window.js:781 Uncaught (in promise) TypeError: Cannot read property 'id' of null
    at showFolderContents (main-window.js:781)
    at HTMLDivElement.onclick (main-window.html:1)
--the id is not available till you refresh the page. Fix that.

# apple notes file.

If want to update apple note pre-existing file, make that work. (right now, it just creates a duplicate apple note file)

# link to github and/or dropbox
--start here.
--don't overcomplicate it. Start with github: and more or less just take the github commands and make it easier to run them.
--add ability to add readme (just creating an md doc)


# add moments of elevation
--these buttons can be across the header. nice to leave it simple for now--so 2 or 3 buttons tops. breathe big. Gratitude notes. Especially to keep things simple for my building and not to overcomplicate. The idea is these are things I would like to do while I am working, and these are touches to add personality--make my work actually elevating. 
--breathe big button. 
--gratitude notes (save to your computer--create a doc on user's desktop (if want to change later, can save location as local storage)). adds a new time to the doc when you press new gratitude notes. 
--other possibilities:
     --what I love about this moment
     --pledge: what I will do in the next 30, 60, 120 minutes
     --work sprint

# test out solution offered in turndownservice github for td+p (relevant for showing tables in word docs)


# another solution for storing large git files off computer

# cleaning up viewing old versions and comparing old versions
when hit view old versions, consider opening up a new window. Then, select version, and have that version appear right in the window.
same with compare changes (opens up new window to view versions)
That way, not crowding main window, and main window for navigation and saving versions. 
something to consider

***
Right Click Menu:
-rename file option in right-click folder
-when creating a new folder or file, prevent the same file name or folder name within a directory from being used twice
-when deleting a folder with the right click menu, you should also delete its subfolders. Should be description at "trash" package, or related "del" package for how to do that.
-add icons next to folders to show that you can open them (caret for when open and closed)


click save version on toolbar, and save the version with git. NOTE:

To save a copy of the word doc to the right location with GIT system:
--when you open the doc from the app, record that it is opened in the app, including the file paths. (maybe to local storage or a file system file)
--when hit the save project button, update the md files at the given paths.
--keep track of what files are open in the app. But, what about if a user closes microsoft word doc? Is there a way to track that? If not, that's ok, because you can use nutjs to see open windows, and for each update the version (using the title of the doc, linked to the path of opened docs saved on the system )
--then just some edge cases, like what if two docs with same title in same project? could just require to give each doc its own title 

--add gitignore to remove .doc and .docx files--currently, they are getting saved in the git repo, so the size is getting too big. Try using the file system to write the gitignore file, and put in .doc and docx in there. And maybe others.
--remove commit message in the view after saving is done.
--view changes (prior commits)


This should get it working well with word.
Next after that:
--can you open word docs in app windows, so can be like VS code
     https://dev.to/aurelkurtula/creating-a-text-editor-in-electron-part-2---writing-files-l80
     https://livebook.manning.com/book/electron-in-action/chapter-6/11
--docs with urls, like notion and roam
--apple notes. maybe use apple script. Remember there are good vid tutorials for that
--remember that its ok if certain types of formats don't give you the same functionality
--link the projects to places you can share, like dropbox and github


****
 





# contact notes

if link it to github, could tell them about it to get their support
