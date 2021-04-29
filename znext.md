**Next in the Electron Git App**

# Just Completed
working git save for directory on your computer that you choose

# Big Points
go by projects. So each directory is a project. And in that directory can be docs ofany kind.

files saved onto the computer--the whole folder goes into the directory

single files (email, apple notes, etc)--added doc by doc. You give the doc a title (default--first lines of the doc), and system adds a code for version control.

if a doc is read only (and threfore no code added)--that is fine. you are not updating it anyway.

just like an idea--a single place for all your work related to a project. Get version control, searchability in a single spot (across all doc types--recall that mac can't search apple notes)



# Next for git-side:
making it work for apple notes: 
plan: user will create a folder to put all items about a certain topic. will have the option with a button to add note to folder or see existing folders.
can then save new versions in that folder
ultimately, app will have decent looking file to display what goes there. (maybe use froala for that)
folder will be saved on user's computer.
can copy old versions of notes so can past them into progam you want (I might save the doc in html form, but could have the option to copy just the non-html form)

Note: don't get wrapped up in creating a big folder structure with electron. The goal is to have version control for apple notes, and to be able to have a record of the changes you make. Not a new place to store your documents.

to start:
-create a folder manually
-add a file to that folder with electron (see save-file-locally notes)
-create a file with electron
-add text from an apple note to that file
-create a directory

# Further thoughts

have apple note. click magic button. it sees if exists already, if not creates a place in the folder. you write a description of what you're adding. 

If new doc, it gives it a title --takes title from the first line (up to certain characters). Like apple notes--title is the first line of the note.

Apple note. hit button. It shows you title and you enter save note. It saves it to a folder. when you want to save a new version, hit the magic button and it saves.
    it shows you the name of the note.
    adds a code at the bottom of the note

overwriting an existing repo entry. example:
    --I have a note titled "Chapter 1 of my book". I save it to a repo.
    --I make changes
    --I go to save a new version. add notes to summarize what I just did. 
    --app checks the end of doc for a code. if it's there, it matches up with existing doc and code. 

## alternative

option: create a repo for all Apple notes. reads active window type, sees that its the apple notes app, and saves it to a folder dedicated for that. 
--would be no folder structure. organized by a note. 
    --so you don't look to the app itself to organize your stuff. 
    --you can view past version, and see everything that changed between now and then. 

option: each file is its own repo. 


# Next For Github-side:

- when click icon, do a highlight all of a page and then copy the highlight (using nut.js)

-update tray icon to say the right text in the drop down

-make it work to send the highlighted text to a post in discourse (either my live app or test app)

- update tray icon so that when create post it is linked to a project and provide for tags and category

- provide for updating a post (not just creating a new one)

-update look of icon