**Later To-Dos**



# to consider: what would it look like if focus was sharing
--still linked work from desktop to site.

# create folder from the app

# projects for discourse / tagging.

Right now (Aug 4, 2021), when you send a doc to discourse, it reads the "user" + projectName, and creates a tag from that.

the files from the project will be displayed without project subfolders.

Consider adding project subfolders. It's probably not necessary to add sub-tags. Rather, goal is a single project page (based on main tag) that is divided into the subfolders. Potentially, you could add in hide and show subfolders too. But everything can be on one page, because generally projects will not have so many files, as in the github case.

To create the subfolders:
--could add it to the title of the topic. Example: main project = Churchill-research-paper. Then topics could be called: chapters/final/chapter-1.docx. Note that slashes are allowed for topic titles (just not for tags, which strip them out).
    --another benefit: would all folder items searchable
    --UPDATE: this is the current approach. Potentially, when showing the items on a project page, I could parse the items so that the page is divided up into the subfolders. 
--could create a custom field for topics, that would have the subfolders. And then parse them that way.

# discourse tags

--would be nice to have a few other set tags that could be added. such as: music, videos, books, research, etc. Could you have the ability for users to add just those (and only those), while also having the api create tags? not clear, and not a big deal.
--to start, probably better to not have user created tags. To do this, could hide the tag box on the page itself. 

# Showing files

fyi when show new file, key code is:

showNewFolderOrDoc(..)

right now:
--if you delete a folder, the subfiles of that folder still show in the view until refreshed
--I have an apple doc title "Today's schedule" and it shows up first in the file list no matter what (despite alphabetical order). Fix that .



# notable issues to fix
--compare changes. full document not working. Still showing both items. at least this happens when one of the files has changed its name. 

--compare changes. When one file changes its name. Does the comparison still work? 

--compare changes. I had a few versions saved. Then I added a word documnt. and saved the version. When I went to compare the changes (version with the word doc, v version without), the word doc did not show up. It had this error: Unhandled rejection Error: ENOENT: no such file or directory, open '/Users/sean/Desktop/git-app-test-docs/remote-test/426708worktree3#&7#&1#&4/llc-agreement.docx'

--compare changes: error catching: if a problem, make sure it doesn't stop the app. Otherwise, the temp folders could show up in the project

--worktrees: when remove them, they go to trash. Should be deleted altogether (see package for that), otherwise will take up too much user space.

# discourse site

when loading latest topics--like first time loading the comments to a project on local site--it showed the 'welcome to discourse" topic on the page? Why? Get rid of welcome to discourse. And basically get rid of all the normal introductory stuff a user might see

# discourse site settings
--if a main-project-topic. then should not allow replies. replies are allowed for comment topics
--get rid of badges
--get rid of note: "revive this topic?" when a topic is old
-get rid of "your post is similar to"
--prob get rid of "post must have 20 characters"
--turn off discobot greetings


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
 [
            p[stylename= 'Code Block'] => pre:separator('\n')
        ]
--when enter a commit message, are there certain characters you can't enter? If so, make sure that won't trip users up.

--if creating work trees to view prior versions or compare word docs (putting old worddocs in worktree, and converting to md), make sure these are not caught up in any commit while they are there.

--if I have a word document open, it sometimes creates a hidden file equivalent (~$[name of file]). Seems to show up after I view hidden files. Shows up on main file results, and can get caught in git save. Make sure that doesn't happen.

--when printing html, the electron app automatically strips out "<" in the html it shows. This is probably to sanitize, for security. That is fine. Issue: when running a conversion, if there is a "<" in there, everything afterward is stripped away. This can have strange implications, like if that section was in the deleted sections, then the result would be a start of <del> without an end. So everything from then on would show up as deleted.
     --to address:
          --for non-word docs: should be able to sanitize the entire diff result (like diff2html does)--so that you can show code results (like github does)
          --for word docs: steps are: 1. convert to html, 2. convert to MD (adding in certain rules like changing the "strong" tag to '<strong>' in the md). then 3. running the diff. 
               --instead, you could 1. convert to html, 2. convert to md with turndown (but instead take 'strong' tag and turn it into an arbitrary character combo, like: **^**). 3. then run the diff. and sanitize. And 4. then do regex, changing any **^** into <strong> at that point (post sanitizing).
               --alternatively, just show the pure MD (where the tags are stripped), and sanitize that. So bold and italics show up as "**" and "_"
               --to sanitize, looks like leading option is dompurify: https://github.com/cure53/DOMPurify
               --and/or use tips to be able to display html code on webpage, like here: http://intelsea.com/displaying-and-highlighting-code-in-html-page.html

--comparing changes: If you select two different versions, and then hit "compare changes" again, it makes both newer and older version the same (the later one). Fix this (Note of June 30, 2021). More detail: its possible for "new version" header to not be updated, and to wrongly show the last saved version, when it should show current local saved changes. And then for both "new version" and "older version" to show the same version number. In this case, it will run a diff of a version against itself. This happened for me when I had selected two different versions, then hit compare changes again


--comparison: after run the diff, you show the file name at the top of each section showing changes. Right now, you identify that name by seeing if there is any white space. But what if the file name has white space in it? Probably doesnt work. Fix it. To test, try a file name with white space in it.

--for diff2html, reduce line breaks--right now, using mammoth for converting word docs, and are using the get raw data setting. It adds two line breaks after each paragraph. And this ends up being too much. I asked a question on github about this. 

--Comparisons: see if can change the [- and {+ symbols for diffs. The goal would be to change those into more unique symbols so that I can then do a replace on them that has a better chance of not catching text a user has in a doc. I asked a stack overflow about this. And maybe there is a way to use diff2html to help.

--comparisons: make it easier to see the table of contents of the docs to navigate between them. For example, have it always on top, but collapsible in case there are a lot of docs. Or could have it on the side.

--comparison: right now, if try to run a comparison too quickly after running another, the first comparison's temp folders could still be there. Make sure this doesn't cause issues.

--in bundle for production, remove the z files, like 

--if hit save version, or prior versions, or compare changes-> will not work if not a git repo. Will get an error. Take care of this.

--main window: add scroll to folder contents, so it's clear if there are contents that flow over the present view

-main window: adjust styling of buttons at the bottom in the case that window is made narrow (smaller than 275px )

--compare window: add header info about whether viewing summary of changes of full doc.

--main window, compare window, when opening a doc: add loading spinner 

--right click menu -> move to trash -> add "are you sure?"

--right click menu -> add "rename" file and folder options

--if there haven't been any changes to docs between versions,when run show changes, show a note in the new window saying something like: no changes to docs between versions

--search the project folder (why important? if you think you have a correspondence with someone somewhere, but don't remember where, would be helpful to search for it.)

--if tries to view hidden micro word docs, like "$!apter 2"... it messes things up and stops the process. The result is worktrees and newtemp/oldtemp files that are not deleted, and a non-working system. Make it so these docs are not picked up the save. And catch the errors so that it doesn't stop things from moving forward(!)
     --in general, add error catching for anywhere where a problem with a doc could stop the app.
          and for some errors, add an option for the user to remedy
               --example, if you have folders open on the app, and then change an extension or a name of a doc, and then try to open the doc as named on the app, will throw an error "no such file or directory". 

--add a show location button 

--if not project file (tries to open based on local storage, but may have been deleted in mean time)--do error catching

--if running jxa code, then want to check can run in jxa environment. THere is a package for that:  https://github.com/sindresorhus/is-jxa

--if entering Apple Notes ID into doc, note that the structure seems to be "x-coredata://922A35B9-C523-44DE-8611-CA444607F49E/ICNote/p1076". Everything until "/p1076". Investigate whether the data before hand is private info that should be protected. If so, hide it in the doc.
     --another way to do it. Get the code after the last / (ie, "p1076")--maybe that is sufficient. 
     --could do that last code + name, but name could change
     --code should be sufficient, unless you download another note from someone else, that happens to have the same code. That is probably unlikely, and the unlikelihood might make it sufficient to go with it.

--main window.js: when creating a file and creating a paste file, it gets the name from id="nameEntry". But that is an id--if you try to create a few files, app will get confused. Change this--either make it so you only create one at a time, or make referene to nameEntry more specific

--you can really use the app save action as a place to provide notes about the version. Sometimes you want this to be longer (like 4 lines or so). for this, you may want to organize your notes--for example, with different lines. In that case, app should preserve the formatting, instead of bunching all the formatting together when you go to look at the note.

--show changes: for apple script docs at least, the first letter of the file name was cut off in the summary. why? scripting docs are binary files. Maybe that's it. Note tat the header is fine--just the summary saying the binary file changed.

--converting word docs for showing diffs. Right now, I convert them to HTML, then to MD, and run the diff. But, I show the diff within the app window, which renders html (it doesn't show source, like "divs", etc.). So there is probably not a reason to convert it to markdown (which changes more of the format anyway). So I can probably remove the turndown service action for viewing diffs of microsoft word.

--if keeping contenteditable for html paste docs, then add some formatting abilities 
     --tabs
     --right click copying, etc.


--if make text contenteditable in an old version, then would have to warn user when trying to save that they can't save to this version (the old version is just in the git file and doesn't have a path). Could show them a save as anytime they try. Or just don't allow contenteditable in old versions.


--for pasting in html content to your local computer, maybe provide a warning, like microsoft word: This page allows you to share data with external sites, make sure it is a trustworthy source. could just be a general warning that comes up the first time you do it and other times too

--where it says *OLD* on old version docs, could add *OLDV6* or the like to set the version number. Helpful in case viewing more than 1 old version at once. 

--save project version: if hit save version, and no text in note, add a prompt asking to confirm, and noting what save note will say

--if typing in "enter note to go along with save", gray out "send project options"--so don't hit that instead of "save version" by accident

--ideally, you don't see the "send project options" button unless: 1. you have already set up a remote repo and 2. the latest local version has not been pushed. If you need to create a remote repo, could still say the same, but should take you to different options where you will set up the remote repo (could get there by just seeing if anything comes back from git raw get-url). If you have a remote already, then only show "send project options" if there is a push waiting to be done.

--when send successful push to remote, show success button prior to going back to main screen

--if not changes when try to save version, should tell the user that

--dexiedb has the ability to send the database contents into json format, or other format that you can download (and probably backup). Not clear if this is important or helpful for where I am using dexie (for example, sending docs to discourse). But consider. To use, have to download export-import package: https://www.npmjs.com/package/dexie-export-import. and some examples here: https://gauriatiq.medium.com/electron-app-database-with-dexie-js-indexeddb-and-web-worker-570d9a66a47a


--note: dont index very large files (media files) in dexiedb. More info here, and pasted below. In my case, I don't think that applies, because I am just providing the path to the file, not the file itself. 
further info:https://dexie.org/docs/Version/Version.stores()#warning
        WARNING
        Never index properties containing images, movies or large (huge) strings. Store them in IndexedDB, yes! but just don’t index them!

        db.version(1).stores({
        friends: '++id, name, age' // don't index "picture"
        });

        db.friends.put({
        name: 'Camilla',
        age: 25,
        picture: await getBlob('camilla.png') // but store it
        });
        Example how the “picture” property is stored without being indexed.

        Writing this because there have been some issues on github where people index images or movies without really understanding the purpose of indexing fields. A rule of thumb: Are you going to put your property in a where(‘…’) clause? If yes, index it, if not, dont. Large indexes will affect database performance and in extreme cases make it unstable.

--send docs to discourse: do error handling--tell the user if the file was not able to be sent up was not made into a post. For example, I had an html doc that I had created from a website, and the formatting was all off. When I tried to send to discourse, came back with 422 error (unprocessable entity).


--html paste file: if you copy an html page some times the formatting can create a problem, and the app won't be able to build it. show the user some kind of error. example, go to wikipedia page on churchill, and copy the whole page, then create paste file. It doesn't work when you open it in the app.

--error handling: if in old version, and want to open file from old version, if there is an error, show it to user. Error could be bc the work tree holding the old file was removed by the user.
     -NOTE: Right now, if I save the code, it will refresh the whole app. When it refreshes the whole app, the work tree gets removed (because of blanket remvoe tree action). But, the old versions window is still there, so nothing opens, because the worktree is gone. Is it possible that would happen with a user? If so, probably close the old version window on any app refresh