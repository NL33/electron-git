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

# Github and audio files

if I record an aifc file and add it to git, and send it to github:
--when I click on the file in github, it will say: "show raw". If I click on the "show raw", it uploads the attachment to safari. And plays automatically on my default music player.

--in dropbox it shows you a music player in the browser, which is better. But, in github, you can still "kind of" play it in browswer, without having to download it.



# Logic with dropbox
--dropbox plays sound files, which github doesn't
--for logic pro files--dropbox breaks them up into their components. Basically, they don't make sense. You can just download the file, like on github.

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


# Github possibilities

# Discourse Possibilities

-send your work to discourse
-working on a document, send it up to share it.
    --one click to send it as a new file
--why might this make sense?
    --2 purposes of github
        --


# Loading website (like github) into electron

pacakge: nativefier (well maintained and popular); https://github.com/nativefier/nativefier

https://www.electronjs.org/docs/tutorial/web-embeds

Note: Iframe probably isn't the way to go. I want to be able to show different things and manipulate the view. For that, probably need to use the github api.


*Github Api*

# Rate Limits
https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting

Rate limits = 5,000 requests per hour [per user], when using basic authentication or oath.

So, if the app is the owner of the tokens making the requests, the app can make 5,000 requests per hour across all users

If an individual user is the owner of the tokens making the requests, each individual user can make 5,000 requests per hour

If not using basic authentication or oauth token, then no rate limit

# Package info

github api package: https://github.com/octokit/core.js#readme

github api reference for getting a repo: https://docs.github.com/en/rest/reference/repos#get-a-repository

simple-git: authentication to github: https://github.com/steveukx/git-js (see authentication--allowing you to do things like fetch, clone, etc.)


But maybe don't even need the API, because you can use git commands to get the repos, like described here: https://stackoverflow.com/questions/57669037/how-to-clone-github-repo-using-node-js

--I downloaded octokit to play with this
--but most github api situations will be geared toward websites accessing the api, different thant my situation, where someone is just accessing github from their computer.
--though may be good for just viewing repos (most command line tools are for downloading repos, fetching, cloning, etc)


# basic oktokit setup

const { Octokit } = require("@octokit/core");
const octokit = new Octokit();


# Get info about a repo:



# Get files in repo

const response = await octokit.request("GET /repos/steveukx/git-js/git/trees/6d92bd4b3a0a27f86011e20fe9515391478b3a30", {
    // org: "octokit",
    // type: "private",
});

console.log('response = ')
console.log(response)

The long number here is the "sha", that we get when we look under "tree" with await octokit.request("GET /repos/steveukx/git-js/commits/[commit hash]", {});

can also just do the following to get info on latest commit (using mainlast commit hash):

    const response = await octokit.request("GET /repos/steveukx/git-js/commits/main", {});
    console.log('response = ')
    console.log(response)

Will return info about each file, including about each path.

# Next: *Start here*

--consider: I can make it easy to view items within the app from github. Could I just do the same in discourse. So there would be a basic app I create (on top of discourse), and then that plugs into github.
--or, jsut take the same things I would do in the app, and put them on a simple site that loads content from github.
--possibly could do this, but if it's easier for now to just do everything in the app, that seems ok. And it makes it all integrated into one spot on your computer
--using the app, I can show you just the key things you want to see from github.
    --is it allowed? should be, just like what gitkraken and other tools do that integrate github.

--I think it will work to download git repo into the app (or view in the app), and then have buttons on top to manipulate the repo/do stuff with git

--focus on simple actions in the app:
    --1. view a project's files (this is actually the most important for my purposes: allos you to share a project)
        --consider: you could just view it on github itself. But when you want to take action with the repo, that's where my app comes in, to make it simpler.
            --so actually downloading the repo, like through fetch or clone, might make sense
            --and I could just show you the bare essentials for you to know to take action.
    --2. navigate through a project on the app
    --3. view description of project
    --4. add comments to a project (ie, issues)
    --5. add proposed changes (ie, pull request)
    --6. and make this work for private repos too
        --allow viewing your repo on the app, and inviting others. 
            --could be within the app, but it would be ok too to open up github to do it there.

