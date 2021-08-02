**Identifiying Whether to Post or Put a topic on discourse, and what topic that is**

*Goal*

When a user goes to send their documents to discourse, for each document, determine whether:
1. The doc has not been sent to the site before, in which case make a post call to the api, creating a new topic. or
2. The doc has been send previously, in which case identify the corresponding discourse topic, and then make a put call to the api, updating the topic.

*Options*

lead contender: database in app that provides the file info.

when you send a document to discourse, want a way to link that topic to the doc.

Options:
1. custom field on topic, that identifies the document. 
    --identify the document based on the path of the document.
        --could work.
        --but, could give away some personal info about user. And more so: if document name or path changes, then you would lose the link with the topic. Git/Github does it this way: a change in folder or change in name, means that the document is treated as deleted and a new document is created. So you lose the diff ability. But for github, it's important to keep the folder structure, and this system does it.
        --in my case would be better to keep the same topic, and update the topic name or folder structure. This is especially important if there are comments tied specifically to the document/topic. and wouldn't want to lose those comments. Less important if comments are tied to the project overall.
    --but, when it comes time to determine if document has been made into a topic before, would first have to search discourse. That would add time, and also mean more actions to the discourse site itself, which would be nice to avoid

2. Change the document metadata: in the document metadata, provide some kind of code or list out what the topic id is on discourse. 
    --that would be nice, but not clear can affect metadata

3. Check with git. 
    --rely on git's tracking mechanism, and maybe have a document that tracks relevant changes and updates, that git plugs into.

4. **Database through the electron app that keeps track of the connection**
    --this provides greatest customization and flexibility
    --database links the document to the topic
    --so, when send the document to discourse, get back the post id, and update the database with it. 
    --probably would provide:
        --doc id, topic id, path of document, data of last sent to discourse
            --and when hit send, get the last modified date of each doc with fs.stat. Only update discourse post if last modified is later than last sent.
        --and provide some fallback options
            --maybe a way to manually provide update if there is a mistake. Like: new topic created, when it should have updated an existing topic. That could be a manual process to enter the right topic, which would send again and update the database.
            --if doc not sent but should have been, provide a anual send. 

*Document Identifier*

lead contender: birthtimeMs, returned from fs.stat, with error handline in case birthtimeMs comes back as less than 6 digits.

want some way to identify the document in the database. Ideally, it would stay with the document even if the document path and/or name were changed.

So, when send a file, get its identifier, find the database entry with that entry, and get the post id. 

--could also be an identifier for folders

# Inode
--discussion here: https://stackoverflow.com/questions/43170582/is-there-any-way-to-retrieve-a-file-folders-unique-id-via-nodejs/43170811. Issue is that on some system (like windows and maybe mac), inode may be 64 bit number, and that may be interpreted to be the same as others.
    --possible workaround: also add in othe identifiers, like date created (ie, birthime, and maybe also ctime and atime)
        --seems that the ino value may change on windows when file is saved. 
    --but windows may change ino when file is saved. Windows does have a concept of fileId. 

--inode is a unique number assigned to files and directories when they are created. Unique to the whole file system (at least on linux). https://linoxide.com/linux-inode/#:~:text=Inode%20number%20is%20also%20known,such%20as%20ext3%20or%20ext4.

--but note that text editors create a brand new file in place. so they do change the file inode number every time a file is updated. 

--assessment of what's returned with fstat:
    https://www.brainbell.com/javascript/fs-stats-structure.html
    --dev = device Id
    --mode: info about access permissions
    --uid: user id of the owner o the file
learn more about inode here:

https://www.google.com/search?q=nodejs+file+identifier&rlz=1C5CHFA_enUS577US577&oq=nodejs+file+identifier&aqs=chrome..69i57.3495j0j7&sourceid=chrome&ie=UTF-8

# birthtimeMs

fs.stat also returns birthtimeMS. (and birthtime). This is the created at time, to the millisecond, of a file or folder.

Tested on mac with a text file. I saved the text file in different ways (closing v leaving open), moved the location, renamed, etc.. And birthtimeMs stayed the same each time. 

Same result with word doc test. Saving open, closing then opening and saving, changing location, changing name. birthtimeMs stayed the same.

--will just have to handle the times when birthtimeMs doesn't work (like older linux for example)--should be a large number, so want to confirm it a large number is returned 

*Local Database*

# Lead contender

dexiedb. Which is a wrapper for indexdb. 80k+ weekly downloads, and updated a lot. I've used it before, and found it easy to use.

# Dexie setup

see overviewcode/
  https://gauriatiq.medium.com/electron-app-database-with-dexie-js-indexeddb-and-web-worker-570d9a66a47a  

