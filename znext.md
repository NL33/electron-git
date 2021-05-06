**Next in the Electron Git App**

# Just Completed
working git save for directory on your computer that you choose

# Next

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
2. for word docs, probably have to convert each doc into a txt doc. So could loop through each doc in directory, and convert to txt
    --take a look at https://medium.com/coding-in-depth/reading-pdf-xls-xlsx-doc-docx-csv-txt-files-content-in-nodejs-852660f559e1
    --and https://github.com/antelle/node-stream-zip
3. save the repo.
4. update a doc and update git.
5. do a comparison


-put windows in iframe