**Overview Benefits*
# Key Benefits:
--1. easy Version control for anything, including word, apple notes, music, and more
--2. all project info in one place. Including emails, articles you read, etc. How? have a relevant email, highlight what you want to add (or copy), click on button on sidebar and it creates a doc with that info, along with url if there is one.
    --can have set folder in the app (automatic for every folder) that is for emails. not actually part of the desktop until you add stuff to it. if there is a sharing function, this would be excluded by default. but a set place to have this type of info, tailored to it.
--3. easy navigate through folders, like an ide. 
--4. see your screens in split screen mode
--5. easily link in with places that allow you to store and share this stuff (like dropbox, github). with option to automatically save the git file (where files can get large) to those locations.
--6. and all of this--using the tools you already like.

# Separate approach

this is for version control for everything. And that's the focus. Especially microsoft word, apple notes, logic pro. note--logic pro is used by people like ali abdaal to edit podcasts. probably works for other productive/creative oriented apps as well. other tools for editing podcasts and videos

like the terminal. go into a folder. and save the project version with a note. 

version control for apple notes (and other items that don't create local folders)--you can mark the folder as an "apple notes" folder, and it will take on modified functionality. Like: the folder will be tied to a folder in apple notes itself. and when you do a git save, it will check which notes haven't been saved yet, and it will convert them to md files so they can be saved.





# Other Notes
remember focus is projects--like a project that combines research with writing. Don't get distracted by tracking random notes.

This is a way to have all your work on a project in one place. Not only your actual work product, but also: your research, your planning, websites you've checked, and emails about your work.

Core functionality is replicating how the terminal and git work  = easily saving versions and comparing versions.

From there, look at how VS code works. Goal: a single side toolbar that can control opening your files in a project, easily allwing you to open different windows at once in a controlled environment (intead of having to minize windows to go find another doc to open). One seamless experience for opening docs, and navigating between docs. And then being able to do git on the project.


And then being able to share the project. At first, potentially link up with dropbox and github as separate storage places that also allow you to share. That might be enough. But can also replicate full github functionality on my own to make it easier and friendlier for non-tech people.

# Big Benefits of The App
Overall: taking the benefits of an IDE (like VS code) and git, and giving them in a simple way to non-technical people / for non-technical work. Basically, all windows within one system that allows you to track your versions of whatever you are working on and share.

1. gives you a VS code experience for non-code work. Be able to navigate through your folders, add folders, and create documents from the app. Instead of the tedious process for minimizing to view docs
    could even have a way of just opening the internet right into a window (just open the internet side by side with other work)
2. VS code experience for viewing docs: can see docs side by side and navigate through them, without having to minimize and struggle to find open docs.
    --for mac, may need to use apple script.
3. One project control for a variety of doc types: word docs, apple notes, urls, in one place, in one project area.
4. Version control for word docs, apple notes, and urls.
5. Comparing versions for word docs, apple notes, and urls.
6. Share whole projects easily (to come)

*How to Handle Word Docs*

--Code as of May 27, 2021 at 6:00pm, in the file javascripts/git-on-word.js works to have a folder full of word docs, hit "save", go through all files and determine what docs have changed since last git commit, if word doc convert to MD file, and then add all to the git commit.

## Saving the Versions:

original idea was to convert all word docs to MD docs in order to save to git. The main purpose of this was to save space, bc the git file grows by the whole size of the word doc with each commit. However, converting to MD for each doc also has a space issue (a MD equivalent is about 2.5 times the size of the word doc). And saving even small changes from an MD doc to git has a space hit as well (a 250kb md doc, equivalent of an 80 kb word doc, still increases git file by 55 kb with just minor addition to the file). Furthermore, the size issues here are in the kbs and low MBs. Even a very large git file would take a long time to get to more than 50mbs. 

For example, that would be about 45 documents, each 50kb (35-50 pages), each one with 20 git save versions (20*45 = 900 commits (which is a huge amount)). Would = docsize ( 45 * 50=2250) + gitfile ( 50 * 900 = 45000) = total 47,250kb. Or 47.25 mb. If you did this with the MD conversions, file size would be pretty close (remembering that updating the git file for a save of changes to MD doc still has meaningful size that is close to the word doc size.)

And even 50 mbs is a manageable size. As an example, my git file for the rts.com angular app is over 50 mb.

so for now it appears that converting word docs to md for git commits is not required for space reasons.

## What about viewing old versions

viewing a prior version now becomes easier because you can use git to get back the older version--the actual doc. This takes care of a significant flaw in the earlier convert to MD plan

## What about comparisons

to view a comparison of two versions, I will have to convert to txt or md file. 

one possibility: user selects version to compare against. code then runs through and determines what docs changed since that commit (using code similar to checkChangesFuntion in git-on-word on May 27, 2021 at 6:00pm). Potentially could use git diff to identify the docs.

default would be comparing to last project version.

one identify the docs that changed, then have to convert any word docs to md or txt. 

## What about sharing

you can take a project and share it to github and/or dropbox. On github, you can't read word, but it does get tracked, and you can download it. 
one option is to enable the word files to be shared but also convert to txt files to show on a central place like github.
another option is to focus all the actual activity on people's computers. so the viewing happens on people computers, and there is a central site/server for sharing.

*Handling Apple Notes*

# project folder 

think of how I actually use git. The doc and the git directory are separate on my computer. 

you could just in the app show the directory (ie, project name). There can be a button to save latest version with this doc, or just save latest version to update the project.

just like in terminal--you separately go into the directory from the terminal. Difference here--the doc is not already saved into that project. So just need a button to save the doc into the project. 


# Tracking changes to word docs.

original plan: when go to save the git version, go through the folder, find any word docs that had been updated since the last git save, and convert those to MD. Works well, except starts going slowly as you get more docs. Testing: 64 docs, about 58 of which were 50 pages. WOuld take about 50 seconds to go through and do conversion of all. During that time, app was not useuable. This approach was in effect as of May 30, 2021, 1:30pm EST.

10 docs of 50 pages, took about 12 secs
20 docs of 50 pages. took about 23 secs

[these were prior to creating a new MD File].

For creating a new MD file for every doc, didn't seem to add too much time. 64 word docs, about 60 of which were 50 pages (81kb), took 50 seconds.

Note: this will only pick up docs that have been updated since the last save. So even if a folder has 60 docs, in any given time it is likely that there will be less than 10 to convert. 

further cut this down (to minimize the conversions that have to happen at the time of git save): update docs as you go:


Potential Steps:

1. watch docs as user works on them. If save a doc and it is a word doc, run mammoth -> md -> md doc conversion then.
2. when user goes to do a new git save, go through the folders, identifying any folders and subfolders that have been updated since last git save (if not updated, then don't need to address)
3. for any word docs that have been updated since last git save: compare last change time to the last change time of the md equivalent. If word doc changed since then, do the mammoth -> md -> md doc conversion.
4. why necessary to still do the conversion check at this stage, if have been watching for changes as we go? There could have been changes that happened when the app was not open (example: user could have opened word doc directly to the system and saved it without app being there)

Update, May 27, 2021, at 3:32:

For now, I have left it as is, with doing the operation 1 time for all word docs, comparing to see which changed since last save. Why?
--step 3 of the above method seems to raise the chance of missing some docs. If you convert a doc, there could be a little time lag. What if user does another save during that process? Could there be a chance that when comparing updated word doc to latest MD equivalent, that it would say the last md was later (so no need to update), but in fact the word doc was later because of this? Seems possible. To address, Would have to know that: 1. the package for tracking changes to the folder can still work if there are multiple saves very close together (probably does) and 2. I can be sure that all save conversion are done prior to running the git save action (also possible)

--performance seems probably ok in the current method for now. as a test: 10 docs of 50 pages to update, full conversion process including new md docs, took about 10 seconds. That seems the upper bounds of most performance issues for now.

--concrned about performance of constantly watching a folder, and doing a conversion action on every save. This may not end up being a concern

--still would be ideal to be able to use the app while the update is happening. Right now, the whole app waits for the process to be done. 

***size: 
5.2 mb before md copies (60 docs)
affter md copies (60 new docs):
15.6 mbs.


# Word doc v MD Doc, git size, ultimate comparison

****Conclusion: the md version adds more bc there is a 2.5x-sized doc copy for each word doc. The git file is smaller, but still grows a fair bit. Example: adding 2 paragraphs to a 217kb mb file (equivalent of 81kb word file) grew the git folder by 56kb. Nearly as much as adding a full size of the word file to it. 

When adding the slower growing word file + increased raw doc size (MD versions), versus faster growing word file + lower raw doc size (word version), it's a close call.

In the end, the word versions are probably at least slightly more size intensive. However, the ultimate size of the folders is still in the single to double digits MBs in most cases, which is not significant. And keeping the word files have notable advantages--for example, getting the old files back. 

Test: one folder with 3 word docs, 50 pages each. one folder with 3 MD docs that are the equivalent (having done the full conversion)

****Hypo test

Project has 20 word documents, of 50 kb each. And each document has 20 git commit versions. (so there are 20*20 = 400 git commits)

**Word-only version:

doc storage(20 * 50=1000) 
+ git file(400*50=20000) 
Total= 21000 kb. Or 21mb


**MD-only versions:

imagine for each save, git file grows on average 40kb--in my testing it seemed like changing the md file often added about 1/3, or just a little less than the word file.  
and remember that each MB version seems to be about 2.5x its word equivalent (even after removing initial setup code in word docs)
doc storage ((2.5 * 50) +50)) * 20  = 3500
+ git file (400*40) = 16000
Total = 19,500 kb. Or 19.5mb

****Actual Test I ran

****Word Folder (3 docs) starting size: 250kb
Initial Git size: 119kb
Changes:
change all 3 docs (added paragraph to all 3). Git size: 362kb (went up 250--size of the docs) 
change all 3 docs (removed paragraph from all 3). Git size: 598kb

After commits (changing all docs twice). Total = 849kb.

Then change just 1 doc. Git file for word = 677kb

****MD Folder (3 docs) starting size: 646kb
Initial Git size: 95kb

changes:
change all 3 docs (added paragraph to all 3). Git size: 212kb.
change all 3 docs (remove para from each): git size: 324kb.

After 2 commits (of changing all docs twice). total = 646 + 324 = 970. But also have to add original word doc size too, bc that would be there in the convert to md method. so = 970 + 250 = 1220 kb.


Then change just 1 doc: git file for MD = 380kb

change all 3 again (add para, remove some sentences) = 540kb  (difference: added 160)

****Conclusions:

the more word docs you have, the less efficient it becomes to convert to MD. 
Unless:
you are doing a lot of commits. At a certain point, the commits with word become too high.

Running these numbers out to 20 commits:

MD (assuming 150 on average per commit): 20*150 = git file = 3000 kb. MD docs = 646kb. Word too = 250kb. Total: 3896. In other words: 3.896 mb.

But what if 12 docs, not 3. multiply the doc size by 4 = (646+250)*4=3584 (versus 1000 for the word file)

Word (assuming 250 on after per commit): 20*250 = git file = 5000 kb. MD docs = 0. Word docs = 250. Total: 5250. in other words: 5.250 mb.



# Questions

-right now, a word doc could be in the subfolder of the project folder. I can identify the project folder--user selects that manually. But not the subfolder (no way right now to get the subfolder the word doc is in). So where should I put the copy of the word doc? Right now, I am just putting it in the main project folder. This is good enough for saving versions. But would be better if I could put it in the correct subfolder. That would allow me to link it to the app being a place where you can control what files are open. And also you being able to send the whole project to a remote git repo in an organized way. But how to do that?
--one alternative is to entirely separate the folder where I keep the saved versions. In this way, the app would truly be for just keeping track of versions, and not full github functionaloty. 

## IDE: easy to set up project and organize your windows
start with example: script for printing press. And make it work for microsoft word. Then make it work for apple notes (just make it work as well as possible)
1. click button to create folder
2. from that directory, create subfolder
3. from that subfolder, create new microsoft word doc. mimic look of ide like vs code (sidebar on the left)
4. if can't create new microsoft word doc, then take an existing word doc, and save it to that subfolder
5. create (or add) another microsoft word doc to the subfolder
6. navigate between the two docs
    --have a way to have both open next to each other
        --potentially, open within electron window, or
        --open docs by themselves but control their size, or at least
        --press button on left sidebar and control which one is in foreground

## Easy Git
start with just making it work for txt files.
1. initialize repo
1.a. See if can use discourse code to save to markdown file but keep more formatting.
2. for word docs, probably have to convert each doc into a MD doc. So could loop through each doc in directory, and convert to txt
    --take a look at https://medium.com/coding-in-depth/reading-pdf-xls-xlsx-doc-docx-csv-txt-files-content-in-nodejs-852660f559e1
    --and https://github.com/antelle/node-stream-zip
3. save the repo.
4. update a doc and update git.
5. do a comparison.


*Steps Forward*
## Best Structure

Best structure to seek: for ALL doc types:
1. You hit a button when you want to save the version.
2. You can enter text for each commit, but you don't need to.
3. You save the docs to a particular project. So every doc has a copy in the project. And when run git diff, it goes through all docs in the project.
4. Having a copy of the doc in the project will make it easier to save the project to github or another structure.
5. When save thhe doc version, it copies the text. Potentially (to start), you copy the text, and hit save to get the version. 
6. The new version is created by pasting in text.
7. The electron app makes it easy to show files (like an IDE like VS Code)
8. Tracking files: have the project open when save
   --word docs are saved to the folders themselves. just put a doc and docx exception into the gitignore.
9. if save a doc, then leave and later come back, how do you know it will update the right doc
    --each doc is linked to a project. so you can see your projects, and search them to find the right file one to update.
    --also, can help by showing you the last 5 docs you updated.
    --for microsoft word, should just be in the folder itself, and maybe can read the doc title. 
    --can also have people be clear about their titles--like apple notes, the first lines of the doc are the title. Then, when you save it, we can parse those first lines.



# Comparing size and views of possibilities: txt, html, markdown

bottom line: 
--HTML looks the best. But it takes up a lot of storage, including with GIT. (bigger than git as word doc. file about 4 times the size)
--save as html, then convert to markdown on save. Looks decent on electron, and better for storage. (file is about 2.75 times). Looks good on github too. Not perfect--but still get to see bold and italics and spacing. And will be helpful to have all docs in a single storage type. ***Leading contender***
--save as text. Display on electron with markdown converter. Looks ok, but lose formatting. Very good for storage.

--for microsoft word: just save the docs into git. BUT: you get to return the old docs exactly. storage concern, but then also can't send to github, and can't diff. 
    --For diff, you could do a system where you have to enter the docs to compare, and then I run the changes by code (set up git, copy both to a md or txt doc, and compare from there.)  

--other possibilities:
    --save to discourse. Would save user storage and allow easy sharing. But would be more complicated to set up right now. Lose the power of it being a git system. And have to pay for storage. Current plan: keep it on user computer, and look into setting up remote git server for users to share. Or, in the beginning, link to github for projects.
    --convert word docs to html with Mammoth. THis is ok if want an automatic conversion process on commit (instead of individually saving). But for now see how it is with individually committing. Converting with mammoth would take a little more time on each commit, and mammoth seems to have some warnings that it fires. And would only work for micro word, not things like apple notes and email.

Test with converting to HTML, then saving with MD. 
starting point
    two 50 page word docs: 80kb and 49kb

**MarkdownTest**
Markdown
    stockholders doc = 212 kb
    word-convert-test = 141 kb
git
    first commit = 100kb     [straight word: 130kb]
    second commit (changing sentences in each): 161 kb     [260kb]
    third commit (changing just one): 220kb   [340kb]
    fourth commit (deleted a little): 271kb   [420 kb]
    fifth commit (added sentences): 322 kb    [500kb]

    212+141+322 = 675 kb.  [80+49+500 = 629]

**Txt Test**
txt docs
    stockholders doc = 157kb
    word-convert-test = 128kb
git 
    first commit = 66 kb
    second commit (changing sentence or so in each): 113kb
    third commit (changing just one): 139kb
    fourth commit (changing just one): 164kb
    fifth commit (changing just one): 189kb

    157+128+189 = 474 kb.





## Using Discourse

I've also considered having discourse process the docs--either creating a new version as a topic, or just processing and sending back, given that discourse processing is pretty good. 

But, that would require people create an account and also would keep docs off-site. 

There are also size limits to discourse files.

I'd rather focus on git, that seems like it has more potential, and potentially set up a remote git server in the future.

## Run through all docs on commit?

It would be nice to be able to hit commit button and have that apply for all docs in a project. That's how it works for VS code--you don't need to commit per document to have it saved.  To do that, I'd have to: 1) track the doc whenever you save it locally or, on commit, go through all the docs and update them.

The way VS code works is that the docs are all saved directly to a repo. So when hit commit, you just look at the repo.

If I could catch the save event in microsoft word, and then update the copy doc (txt or html version) that could do it. But not sure if I can do that--maybe another time. 

For cycling through the docs on commit, the leading (only?) contender to do that would be to use Mammoth.JS, and when hit commit and run throgh all the word docs to see changes.

But: 1. mammoth is giving me security vulnearbilites that raise concern. 2. running through all docs could be slow for every commit. and 3. I want other docs to be in there too--like apple notes and emails. Mammoth doesn't work for these, so that probably wouldn't work.

So keep in mind the goal of NOT having to save it per doc. 

One reason to be ok with this--for non-code docs, you tend to focus more on one doc at a time, not multiple. So saving per doc is more ok in non-code.

But to move forward, focus on getting it to work in any way--including if you have to save it to the system doc by doc. 


*Repo structure*

## General
each doc will be converted to an md doc to do the git version control.

## Microsoft word

ideally, would work like normal code work flow. You save a document, and it updates it in the folder. Then, when you go to commit your changes, the changes for all docs in the folder get updated. 

How could this be possible?

--can try any-text: https://github.com/abhinaba-ghosh/any-text.. Not professional enough
--aspose has something: https://products.aspose.cloud/words/nodejs  (but it's in the cloud on their servers)

There is a way to convert to html with mammoth: https://github.com/mwilliamson/mammoth.js/.  Issues: comes with security and deprecation warnings. It does work to convert to HTML, and in a way that electron app can display. But the text is all squished together. As a result, Git is not able to read the changes of the doc. It also has html code in it. Mammoth also has an option for raw text--but that has too many lines and has no formatting at all.

if prior to commit it cycled through all the word docs on the system and updated the corresponding markdown file. This might be possible. There are online word to markdown converters, like this one: https://www.google.com/search?q=convert+microsoft+word+to+markdown&rlz=1C5CHFA_enUS577US577&oq=convert+microsoft+word+to+markdown&aqs=chrome..69i57j69i60.5509j0j7&sourceid=chrome&ie=UTF-8

or, even better, is if an md file could be updated each time you save the word document. is that possible? would have to either catch the save event.


microsoft word will closely match normal code work flow. Other options like apple notes, gmail, notion, etc. will have slightly different flow--you have to update each doc here individually (with microsoft word, )

microsoft word docs will go directly into the folders, so that when you open the doc you get a microsoft word doc
exclude microsoft word docs from git. put in gitignore for files ending in doc and docx.
hide duplicate md file. 


apple notes: still link to project, and can add it to repos with microsoft word and other types. Only difference--there is no save button on apple notes. If you want a new version of an apple note to be added to a project, you need to save the new version note by note. 

so you could be updating the note locally, and those changes wouldn't be reflected in your repo structure--even if you had updated the repo from other changes.
this seems ok to start and something people can get used to.

--further detail:
--link note to a project with a code in the doc.
--when you want to update it, you copy it and hit the button, and it adds to the version control of the doc.
--if that note is part of a project, then it can update the whole project.
--but what about notes part of a project, that are not highlighted hwen you hit commit?

--example: printing press 
--create a script 1. save version. adds a code to the doc. then want to save v2, it does that.
    --want to view previous version, can click on view previous version and it will show you that, and show you what changed.
    --each note gets its own md file in a repo. 
    --might be that you can't combine word and apple notes.
    --if no code in the doc, could just read the title of the note, and show you all notes with that title (with a little text to confirm its the right one)
--so if you want to see a past version, you just click button to view

--can it go into a project structure
--printing press project:
--create script note. save to printing press project. can put in certain spot on your computer
--go to update the note, it tells you what note to update, and you confirm.
--create research note. go to save version of it. enter it in the project for printing press.



--when update the project, it's got to find that note and track any updates.
--
--how can electron find that note? not clear.

*Steps Forward*
## Best Structure

Best structure to seek: for ALL doc types:
1. You hit a button when you want to save the version.
2. You can enter text for each commit, but you don't need to.
3. You save the docs to a particular project. So every doc has a copy in the project. And when run git diff, it goes through all docs in the project.
4. Having a copy of the doc in the project will make it easier to save the project to github or another structure.
5. When save thhe doc version, it copies the text. Potentially (to start), you copy the text, and hit save to get the version. 
6. The new version is created by pasting in text.
7. The electron app makes it easy to show files (like an IDE like VS Code)
8. Tracking files: have the project open when save
   --word docs are saved to the folders themselves. just put a doc and docx exception into the gitignore. 

## Using Discourse

I've also considered having discourse process the docs--either creating a new version as a topic, or just processing and sending back, given that discourse processing is pretty good. 

But, that would require people create an account and also would keep docs off-site. 

There are also size limits to discourse files.

I'd rather focus on git, that seems like it has more potential, and potentially set up a remote git server in the future.

## Run through all docs on commit?

It would be nice to be able to hit commit button and have that apply for all docs in a project. That's how it works for VS code--you don't need to commit per document to have it saved.  To do that, I'd have to: 1) track the doc whenever you save it locally or, on commit, go through all the docs and update them.

The way VS code works is that the docs are all saved directly to a repo. So when hit commit, you just look at the repo.

If I could catch the save event in microsoft word, and then update the copy doc (txt or html version) that could do it. But not sure if I can do that--maybe another time. 

For cycling through the docs on commit, the leading (only?) contender to do that would be to use Mammoth.JS, and when hit commit and run throgh all the word docs to see changes.

But: 1. mammoth is giving me security vulnearbilites that raise concern. 2. running through all docs could be slow for every commit. and 3. I want other docs to be in there too--like apple notes and emails. Mammoth doesn't work for these, so that probably wouldn't work.

So keep in mind the goal of NOT having to save it per doc. 

One reason to be ok with this--for non-code docs, you tend to focus more on one doc at a time, not multiple. So saving per doc is more ok in non-code.

But to move forward, focus on getting it to work in any way--including if you have to save it to the system doc by doc. 



## View Old Version v Diff.

electron can show diff in html well. 



*Testing Different Possibilities for File Types*

# Goals
-write in word. 
-run git, and have it save that version in a way you can view: html, or rtf
-compare prior versions: plain text comparison.

# What about if could get back as a document the discourse version?

electron show: looks great
shows up as html, with simple tags added in.
could potentially turn to markdown for github upload

file sizes:
140 kb


# Comparison

Apple Notes

looks pretty good to show on electron.
size, normal note: 4 kb.
markdown: looks even better, size: 3kb
txt: looks ok, can be ok displaying on electron if you convert to markdown: 3kb

Word
Save as html, 80kb becomes 390kb.
Convert to markdown (same), but remove beginning commented part: 260kb (206kb without commented part).
use  "marked" 
text: 157 kb  / looks bad as straight repeat on electron, but ok if convert to markdown view


saved as html, converted to markdown: 50kb becomes 150kb, but can remove the styling at the top, it becomes 130kb.

# Straight Word

-starting size: 2 docs (test and stockholders agrmnt): 49kb and 82 kb.
-starting git: 166kb
--after small changes to each, git size: 292kb
--small change to 49kb doc, git: 346kb

Git diff: can tell if files change, but not show changes.

if wanted to compare two docs, could extract the raw text using mammothm and run some kind of comparison on the two. 



# Clipboard HTML
copy text to clipboard, read as html, write to html file.

showing doc on electron: looks great, even tables.
pasting back into word from electron: looks good, though changes font size.
Github: doesn't look good. shows the big intro

word doc (50 pages) = 49kb
html doc = 281 kb
git first commit: 67kb
git second commit (changed just a few lines): able to track changes: 94kb
git third commit (added a few lines): tracks changes, 129kb

TOTAL AFTER 3 COMMITS (html doc + 3 commits) = 410kb

Note: if had just saved the word doc with git, that would have been = 150kb

# Clipboard Text
copy text to clipboard, read as text, write to text file

showing doc on electron: no formatting at all.
git diff looks good.
git is able to show it ok--keeps spacing. (no formatting, but readable)

word doc (50 page) = 49kb
txt doc = 127 kb
git first commit: 47 kb
git second commit: 61kb
git third commit: 69kb

Total after 3 Commits (txt doc + git file) = 196kb

# Clipboard text


# Convert to HTML with mammoth.

issue: it bunches the code all together. so git can't deal with it.

# convert to html, send to discourse--have discourse process it, and then create doc on computer from that

but: how to have discourse process

# Convert word to html (or markdown), then send it to discourse, have discourse process it as a post.

--Discourse converts it pretty well, and I could just display the discourse result in good formatting.

--would not take up space on user's computer.

--I could do this for each word doc in a project (use mammoth to convert to HTML)

can convert markdown to being readable with markdown-it: https://github.com/markdown-it/markdown-it#readme

--would be an easy way to track versions, and get comparisons. 

--downside: need internet, it's going off you're computer, and it could be hitting the api a lot if people start using it. 

# Convert word to HTML (with mammoth), and then HTML to md (with turndown)

word doc: 82 kb
md doc: 213kb
html doc: 166kb
raw text: 162 kb


# Notes: Git with Word
word file: 80 kb (50 page doc)
git file: 100kb
added 2 paragraphs. committed changes.
git file: 204 kb
added a sentence. committed changes.
git file: 283 kb
added a few paragraphs. committed changes:
git file: 361 kb
added a paragraph. committed changes:
git file: 440kb

# Git to Mardown.
Conclusion:
Convert/Save to a markdown doc.





using tool at: https://word2md.com/
https://github.com/benbalter/word-to-markdown
word file: 26 kb (3 pages)
markdown file: 6 kb

could use marked html parser (converts markdown to html): https://github.com/markedjs/marked  (well maintained)
html to markdown conversion: https://github.com/domchristie/turndown

# Notes: With HTML to Markdown: Looks good, but large storage and diff is full of html

Word: Save to html, and put into markdown file, and then print to Electron= Keeps formatting exactly when you view on electron window. When pasted back into word matches exactly too.

The HTML size is so large that it is probably LESS space efficient than straight microsoft word doc. 

Apple Notes: Save to html, and put into markdown file, then print to electron = keeps it close. 

Example with test stockholders agreement (50 page doc):
--word file = 80 kb
--html to markdown file = 382 KB
--git file: to start: 100kb
--after making small changes at top of doc, git size = 197 kb
--git diff: shows all the illegible html stuff

 # Notes: with Plain text

