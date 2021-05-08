**Next in the Electron Git App**

# Just Completed
working git save for directory on your computer that you choose

# Next
straight text works well, except for showing it on electron. 

test out file size for:
--apple notes: txt v html
--micro word: if you strip a lot of the html away, how is the file size?

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



# Comparing size and views of possibilities: txt, html, markdown

bottom line: 
--HTML looks the best. But it takes up a lot of storage, including with GIT. (bigger than git as word doc. file about 4 times the size)
--save as html, then convert to markdown on save. Looks decent on electron, and better for storage. (file is about 2.75 times). Looks good on github too. Not perfect--but still get to see bold and italics and spacing. ***Leading contender***
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

