**Connecting the App to Gitub**

# adding a repo to github, assuming already have an account linked up
*Start here*
--adding a repo to github
    --start with git push and git remote in gitjs: https://github.com/steveukx/git-js
    --will want to push an existing repository. Normal git commands:
        git remote add origin https://github.com/IrSg/test.git
        git branch -M main
        git push -u origin main
--make it private or public



# linking up an account the first time

# Note on logic and github

when uploading a logic pro file or folder with a git commit to github, github breaks down the logic file into it's component parts. You can't really read it on github. But one benefit is that it allows even a very large logic file to mostly escape github's limit of 100mbs per file (github also has a limit of 5gb per repo), bc the large logic file is broken down into smaller files.

to then view the lgoic file, you need to download the zip file--this will copy the file to wherever you choose to download, matching the original upload. So when you view the downloaded file, the file will show up again as a logic pro file and can be opened with logic pro like normal (I have tested this)


