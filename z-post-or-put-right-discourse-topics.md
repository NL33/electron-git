**Identifiying Whether to Post or Put a topic on discourse, and what topic that is**

# Big Ideas
*START HERE*
inode might a file identifier, that could be linked in dexie database with the post id.

so, when send a file, check its inode, find the database entry with that inode, and get the post id. Then update it (and can change title if necessary too).

learn more about inode here:

https://www.google.com/search?q=nodejs+file+identifier&rlz=1C5CHFA_enUS577US577&oq=nodejs+file+identifier&aqs=chrome..69i57.3495j0j7&sourceid=chrome&ie=UTF-8

/*
-is there a way to know from the app perspective whether something has been pushed to discourse before?
-options:
    -metadata of the doc. If gets pushd to discourse, then could update meta data, saying it's been pushed and getting the post id back from discourse
    -database, like dexiedb. could have record of thedocs that have been pushed, and their ids. 
        --note that it probably wouldn't be that many entries, so likely would not take long to search.
    --and would always have some kind of error handling in case the metadata or dexie gets erased
    



*/
/**maybe:
    --create custom field for topic, that provides user, and full path of doc. or with tag
    --then, search that value to dtermine if file exists. 
    --if does, then do a put. if doesn't, then do a post
    --note, to test, may have to use local discourse

    --then, question: how does git do it, if you change file paths
    --git keeps track if you delete a file. So deleting a file will remove it from github. and git.
    --Move File path = git treats as a new file, and treats prior location as a deleted file.I took yellow file, and moved it to red folder, and changed text. Then committed. Result
        --github reflects proper file structure
        --diff treated red-folder/yellow-text-file as entirely new file.
        --and trated old location as deleted.
    --change file name. Git treats as new file and treats prior location as deleted file.
--options
    --dexiedb. track each file name.
    --file metadata.
        --that stays with the file
        --maybe fs.stat? maybe inode 
            that might be a file identifier.
            and would give that to a custom field on a topic, associated with the user
            --start here to look into it. goal is to know whether to post or put, and which topic to put:
                https://www.google.com/search?q=nodejs+file+identifier&rlz=1C5CHFA_enUS577US577&oq=nodejs+file+identifier&aqs=chrome..69i57.3495j0j7&sourceid=chrome&ie=UTF-8
    --git
        --need git to tell when file updated.
        --but I need to know if has been changed since last push to discourse. And that might require dexie