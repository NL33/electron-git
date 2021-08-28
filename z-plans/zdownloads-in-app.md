# Downloads in App

$ npm install nodegit
    -April 26, 2021. UNINSTALLED April 26, 2021, because not updated for electron 12

$ npm install simple-git
    --April 26, 2021


$ npm install nutjs
    --approx April 20, 2021
    REMOVED August 24, 2021.
        --that package is not being kept up, and I am not using it.

$ npm install active-win
    --April 27, 2021. REMOVED April 27, 2021 (not the functionality I wanted)
    --installed again July 10, 2021
    --almost found a good use for it. But then uninstalled it--not adding value yet

$ npm install axios --save
    --May 1, 2021
    to allow rest api calls

$ npm install mammoth 
    --May 6, 2021
    to convert word to html 
    --REMOVED: May 8, 2021
    --added again on May 26, 2021
    --REINSTALLED on Aug 22 2021 to try to address security vulnerabilities. Looks like 2 still remain: https://github.com/mwilliamson/mammoth.js/issues/290
    --REINSTALLED on Aug 28, 2021. updated to 1.4.18. No vulnerabilities reported

$ npm install turndown
    --May 7, 2021
    to convert html to markdown.

$ npm install marked
    --May 8, 2021
    --read markdown in html

$ npm install --save docx
    --May 20, 2021
    --open microsoft word docs from the app.
    --REMOVED on May 20, 2021. Doesn't have required functionality for now.

$ npm install chokidar
    --May 24, 2021
    --to watch chenges of files and folders.
    --uninstalled on May 24, 2021, because I found out I can use fs.stat.mtime to determine when a change last occured.

$ npm install del
    -May 24 2021
    -to be able to delete any kind of directory (incuding non-empty ones)
    -Uninstalled on May 24, 2021. Because I wanted to send folders/files to trash, not delete permanently like this does. Trash package seems to do it the way I want

$ npm install trash
    -May 24, 2021
    -move file/folders to trash
    note, according to repo, support for linux is not very good

$ npm install electron-context-menu
    -May 25, 2021
    -installs a default and then easily customizable contextmenu (ie, right click menu)

$ npm install run-jxa
   -May 28, 2021
   --to run jxa for Mac. Allows automation. Installed to try to control window size and position.

$ npm install diff2html
    --June 10, 2021
    --to be able to show git comparisons in html
    --came with 2 severe vulnerabilities. Running npm audit fix seemed to address. Running $ npm i showed no vulnerabilities.

$ npm install marked
    --June 28, 2021
    --to be able to show mark down doc as good looking html 
    --UNINSTALLED on June 29, 2021.  Formatting wasn't great, and I can get the necessary effect with other methods

$ npm install @octokit/core
    --July 18, 2021
    --this is the official github api client. for making api calls with github.

$ npm install dexie
    --july 31, 2021
    --for use as a database to link project files to discourse post ids.

$ npm install dexie-export-import
    --July 31, 2021
    --uninstalled on Aug 2, 2021. Provides ability to export and import database (for example, to send the database somewhere else). Not clear this is useful for current requirements.

# Prior to rollback on April 15, 2021
# RobotJS

$ npm install robotjs
    robotjs on April 13, 2021
    version: robotjs: 0.6.0

Had to "rebuild robotjs" package and mac notifier package:

npm install --save-dev electron-rebuild
npx electron-rebuild -f -m node_modules/node-mac-notifier
npx elec  tron-rebuild -f -m node_modules/robotjs
***
These didn't work. From docs, then tried:

$ npm rebuild --runtime=electron --target=12.0.2 --disturl=https://atom.io/download/atom-shell --abi=83

but got gyp error.

# Node Abi Version 

$ npm install node-abi-version --save
--to get the abi version of node
--https://www.npmjs.com/package/node-abi-version

--April 15, 2021: removed as part of returning everything to prior git commit (because of issues in trying to get robotjs and nutjs to work)

# Electron get selected text

$ npm install electron-selected-text
    April 14, 2021
    UNINSTALLED April 14, 2021


# Nut.js

## BOTTOM LINE: 
--This looked promising as a way of controlling mouse actions outside of window. for example, being able to automatically copy text that is highlighted in another window.

--BUT: 
1. This is not updated for most recent versions of electron
2. It is a big package--and it seemed like overkill for this straightforward and specific use case. To get it to work, I'd have to download packages that are very large and take a long time to install.
2a. It might be heavily using robotjs, which is not being maintained
3. I just could't get it to work. I entered a git issue here: https://github.com/nut-tree/nut.js/issues/221, but all of a sudden I was going down a rabbit hole of re-installing, rebuilding, and doing lots of stuff that got things very bogged down.

So I decide 
## attempts

  attempt to control keyboard. From: https://github.com/nut-tree/nut.js

$ npm i @nut-tree/nut-js
UNINSTALLED ON august 24, 2021

$ npm  add -D electron-rebuild

package.json:
    scripts
        "rebuild": "electron-rebuild"

then 

$ npm run rebuild

***
didn't work. so tried 
$ npm i electron-rebuild
UNINSTALLED ON Aug24, 2021

go error about can't find opencv4nodejs, so tried

$ npm install opencv4nodejs
UNINSTALLED ON AUg 24, 2021

didn't work.

tried to run:

$ xcode-select --install

then it installed some software from xcode

Then, ran 

$ npm run rebuild again.

still error: 


Error: node-gyp failed to rebuild '/Users/.../node_modules/opencv4nodejs'.
Error: `make` failed with exit code: 2

I tried to install gyp directly:

$ npm install node-gyp

Then tried to run:

$ npm run rebuild 

again

still got error:

An unhandled error occurred inside electron-rebuild
node-gyp failed to rebuild