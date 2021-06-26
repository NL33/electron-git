# Just Completed
just made it work to see changes in a separate doc, and allow current changes against later docs. 


# Next
--run diff for micro word docs:
      --check to be sure the process has fully run--make sure the steps work so they go in right order.
      --right now the array of word docs is hardcoded--instead, get the docs that changed from the diff summary
      --run the diff on the two folders
     --integrate that with the diff of all non-word docs
--see if can change the [- and {+ symbols for diffs
--run the diff in new window automatically (without button)

--run diff for specific docs (remember diff -U999999)
--give user options to choose integrated v on top diffs
--make the compare change window an option at the bottom of the main screen to kickstart this whole process

****
Plan for comparing word docs:

--run git diff --name-only to get just file names

if any file has docx or doc extension, then need to convert.
have to get the doc as of the prior commit. do a work tree

--have to get the word doc from the earlier commit. how to do that?. do a worktree for the prior commit.

--get the file from the worktree. 

--convert the file to md, saving it either in the worktree folder or a new folder in the directory. 

--then take the word docs we care about from the current commit, and convert to md, and save in separate folder

--so ultimately you have two folders of md docs. then run git diff --no-index to compare the two folders (without having to commit any of those changes)

--produce the chagnes, then delete the folders.


--then add in any changes from non-word docs.


***
be able to collapse showing of folders by clicking on the project name (adding carrot icons to show if open or not. and the carrot icons are the indicator if folder or file)
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


****
make it easy to show and hide the main screen
--icon on the right to show the main screen 



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
--add icons or some other way to tell folders from docs.

--show summary of changes to pror versions. Right now, I run a word-diff, which returns a string of changes to all files. To parse that string, I look at the first part of each string. Here's an example:
          diff --git a/second-folder/lincoln-doc.txt b/second-folder/lincoln-doc.txt
          index c3d2a6b..8bb7624 100644
          --- a/second-folder/lincoln-doc.txt
          +++ b/second-folder/lincoln-doc.txt
          @@ -1,17 +1,22 @@
to parse this, I split the string by split("diff --git a/"). This works well. But what if someone has that combo in the document itself? If so, it will split the string based on that. What to do? I need a different way of parsing the diff result. diff2html does it somehow, but I haven't been able to determine it yet. If I don't find a solution, then I could still split the string, but don't change any formatting (right now I add a separator and highlight the folder name). Just parse it in order to add a div id with the name of the file, which I use to link to that section from the table of contents. I could still keep the link--so worst case the table of contents link gets messed up, which is not a big deal.

could do the split based on more info, like the actual name of the doc, which you get from the original diffsymmary array. Alternatively,  could do split based on git diff -a/......@....@

--when running a word diff, I look for certain symbols and replace them: [- , -], {+, +}  . These get stripped out and show up as deletions and additions. But what if the original docs have these in them? How to address that? Would need a way to tell between a deletion from git diff, and a "[-". same with the addition symbol. One possibility: can I change how git diff labels deletions and additions? I can do that on my local system with a config file. Maybe a way to do that in the app? And change it to a random longer set of characters. If that doesn't work, could have an option to just highlight those characters (so highlight the deletion symbol in bold red, and addition symbol in bold green.)
     --note how github does it for readmes--showing changes if you click the doc icon.
     --to start, maybe have a list of limitations. and this would be one of them. 


--add a search box to the app windows so you can search text inside of the window.

--check if git installed on system. 
--if try to save changes but there are no changes, then tell the user that a new version wasn't saved bc of it.

--when release, be sure to have way to update the app and provide notices in the app. There's probably some tutorials out there about charging for electron apps

--change font color and style to look better. See github diffs (for readmes) as an example

--when load the app and check for last folder, make sure it still exists. it may have moved since the app last loaded. so do a check to be sure the path is still there before displaying that folder. If the path is not there, just open blank and user selects the new folder

--when release the app, be sure to remove any z items, like znext and zoverview-notes

--when enter a commit message, are there certain characters you can't enter? If so, make sure that won't trip users up.

--if creating work trees to view prior versions or compare word docs (putting old worddocs in worktree, and converting to md), make sure these are not caught up in any commit while they are there.

# contact notes

if link it to github, could tell them about it to get their support