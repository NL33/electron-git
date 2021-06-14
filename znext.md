# Just Completed
With git diff, I can now:
1. show a top over bottom comparison.
2. show a word by word comparison.




# Next

***
view comparisons.
1. for top over bottom comparison, I want to be able to do word wrap, but also with color highlighting  (potentially the replace method can work for that too). If you can do word wrap with diff2html, then this is all set. If not, run the diff with diff2html, but without the added files. And then figure out how to color. Possibilies:
     with the diff2html, the structure:
          td class = d1h-del d2h-change
               div class=d2h-code-line
                    <span class=d2h-code-line-prefix>+</span>
                    <span class="d2h-code-line-ctn">text></span>

     so to add the background color, you want to change the background color of the class that is after the prefix.
     could do it with js: if the prior sibling's textcontent="+", then add green class. If "-", then add red class.

     or focus on class above: d2h-code-line. and add class depending on first character.

2. for the word by word comparison, I want to be able to first show a summary of any doc that changed, click on the summary, and go to the actual changes.
     --could run git summary to show the docs that changed. manipulate so it just shows the files. then add link to the file to go to the actual file itself. 
     the way that diff2html does it: takes the file name, and makes it: <a href="#d2h-862593">. An then the actual file in the results is given that id. 


3. be able to open a full doc showing the changes.

***
storage of large git files

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

# Later
--idea--put red bar over old versionwhen retreiving prior version?
-when add a new folder (especially in the main project directory), insert the new folder in alphabetical order. meaning go through the titles of the directory, and insert it after he one with proper alphabetical order
--add username for git messages
--add warning before deleting a folder/file. 
-move to main process: menu creation currently in git-on-word.js. 
-add context menu package to main.js: https://github.com/sindresorhus/electron-context-menu
-right-click rename file and folder
--if delete git file accidentally, it will delete all local versions. Add some protection for that.
--note: git does not track empty folders. So if you add a new folder with nothing in it, git won't track it.
--have a place to enter git commands that you want to enter (like pushing to github, creating fancy branches, etc)
--when checking old version from main window--and creating workingtree and reverting to prior version, remove the ability to create a save version then (don't want the new git save to pick up the work tree file)
--when viewing prior version, it creates a worktree. You want to delete the work tree when no longer viewing the prior version. So, delete worktree if close the prior version window. 
     --what if worktrees created, but not removed becuase the app shut down incorrectly? in that case, maybe have a script run on startup to check if any worktrees there and remove them, like this:
                              /*
               if (localStorage.getItem('working-trees-present')) {
                    let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                    treeArray.forEach((treePath) => {
                         removeWorkTree(treePath)
                    })
               }
               */
     --currently saved in git-on-word.js. But this won't work well--this means that every time someone opens up a project window, it will remove the work trees. What if they are viewing old versions, and then open up a new project window. This will remove the trees for those old versions. That will cause an error.
     --this should be associated with any time the app starts up. For this, create an invisible window on startup, run this script, then close the window when its done.
--don't show "view saved versions" on main screen if don't have old versions. So, check if there is a git file in the directory before showing this.
--if you have main window, then view old version window. and remove main window, can old version window still be there?
--git doesn't track empty directories. So when view old versions the old files won't be there (worktree won't track them). Info here: https://stackoverflow.com/questions/7229885/what-are-the-differences-between-gitignore-and-gitkeep. Maybe just have to leave as is and provide explanation for now.
--if open a project. and then off the app edit the project--like add a new folder or add a new doc, the version displayed in the electron app will be old. and can cause problems if you try to open a doc. fix. how does vs code do it? Simple solution--a refresh button, that reruns the function.
--icons or some other way to tell folders from docs.