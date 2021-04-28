**Handling Single Files in Electron Git App**

# Issue

The app is built with git in the background. Git can initalize a repo for files and folders that are saved on the computer.

Examples: microsoft word and logic pro.

But what about for files and folders not saved on the computer? For example, entries on apps like Apple Notes, notion, evernote, etc.

How to address these?

# Goal

A magic-like experience where you can add this work into the same work flow as the files on your computer. 

Benefits: 
-have one system (the app) for your work flow.

--if I used Apple notes for writing a research paper or book, then I would want to have version control

--sometimes I make changes across notes. It's hard to find when I made those changes together. potentially, I could have the files I want to link together in a repo.
    --could even go beyond apple notes, so all files from anywhere that went together could go in a repo.
    --example: info about printing press.
        --there could be apple note with research (would want version control on that)
        --apple note on script
        --email I sent to someone
        --articles that have the research
--more basic: group changes so I can have an easy place to see the work I've done. right now, can't organize notes by date. would be helpful to see all notes I did together at a certain date.
 --to start:
    -I could take 3 different notes (from across all places), and add them to a "repo", that I give a title to.
    -maybe it creates a file on your computer with that repo. (in a folder for the purpose)--could just be on app.
    -each file gets a code added to it to mark it as part of that repo.
    -when you make a change to the note, you can click a button to add it to the new version of the repo. 
    --you can then view prior versions of the repo--meaning prior notes versiosn to.

# Where apple notes are saved

Apple notes: this article: https://martinfowler.com/articles/apple-notes-restore.html#footnote-coredata

implies that apple notes are stored here: https://martinfowler.com/articles/apple-notes-restore.html#footnote-coredata

update article: https://osxdaily.com/2020/01/15/where-notes-stored-locally-mac/

says they are saved here: 
~/Library/Group Containers/group.com.apple.notes/