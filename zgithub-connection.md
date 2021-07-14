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

*What is the right service to use?*

# Focus on my use case. 
I want to open source:
-audio content I create
-music I make

I want a way to show my work in progress, so that
--people can see my creative process as I go. Interesting to see people's work in progress
--I can share it with people to get their feedback.
    --one source of truth (so they can see the updated version)
    --they can give me feedback by directly making edits in the work.
--people can share work that's at the first step.  make it easier to get going
--share important work--like research and new ideas. 

# What is the best way to do that in a location where other people can do the same?



# Related ideas
-If I am focused on helping other people see what work I changed, I should make my commit notes clear
