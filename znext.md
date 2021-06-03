# Just Completed
asked quesiton on stack overflow for how to get the main window.

Just figured out how to do split screen with electron and applescript. May be possible with JXA too--if can identify the selected window (or maybe just loop through all windows of the forefrong application--jxa can snap windows into place). See strategy at: overview/get-display-bounds-applescript


# Next
make the git functionality really good. and then do the other stuff.

GIT saving
--remove message for git save while saving
--show saved or done message when save is done

--idea--put red bar over old versionwhen retreiving prior version?

Viewing docs
--try to set position of word docs. probably using applescript. Result: almost works. See get display bounds-applescript. Have to just figure out how to use jxa or applescript in app


Viewing old git versions (open up old doc, and just have some way to note it as an open doc)
--view list of prior commits with messages
--click on message, and view the contents of that save
     --probably using the "working tree" git concept. Just dive in and experiment with that.
--want to be able to view the old contents and current contents at the same time, while having the old contents clearly marked as the old contents 


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

# Later
-when add a new folder (especially in the main project directory), insert the new folder in alphabetical order. meaning go through the titles of the directory, and insert it after he one with proper alphabetical order
--add warning before deleting a folder/file. 
-move to main process: menu creation currently in git-on-word.js. 
-add context menu package to main.js: https://github.com/sindresorhus/electron-context-menu
-right-click rename file and folder
