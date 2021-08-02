**Work On Connecting the App to Github**
*Overview*
Update note: Monday, August 2, 2021: I put this file together when I was assuming that github would be the prime place to share the work you do with the desktop app. Since then, I have focused more on discourse as the place to share your work. So I have not pursued the below. This could still be relevant to provide a simple place to backup apps.


*Status*
Works to push to github if:
--already set up remote on github
--initialized repo locally
--have some code to push to particular repo, but not sure about if wrong credentials.
--code in main-window.js
--I also created an account for hi@race...com (user: HRS44). Set up test repo there called: remote-test-repo. But can't access it yet through local system bc difference of credentials

*Next*
--make it easy to do pull request from app
--make it easy to do comments from the app
others to come
    --view repos on app
    --layer functionality like milestones and connections on top of viewing github.


# push project to github
https://github.com/steveukx/git-js/#git-push
status: basic version working. 
--I just got a basicversion to work, plugging in a specific push location for a local repo
--make it work without having to manually plug in the push value. DONE, if credentials are all set

--set up git config with proper credentials. **This is important, but is slowing me down. Skip over credentialing for now, and just assume the right credentials are there. So create a repo in IrSg, and send repo there**. 
    --https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup
    --you can set name and email for git with git config.
    --what about proper password: that is related to github itself.
        --https://stackoverflow.com/questions/20195304/how-do-i-update-the-password-for-git
        --password prompt appears to be prompted on the command line.
            --perhaps I need to know how to run the command line in the app?
            --or 
                1. read what the respnse is from git (when prompting a password)
                2. and send that response to git from there
        --think of gmail or other sites--straightforward to log out and login with different credentials if need to do that. It should be like that for github also
    --note: should not be necessary for anyone with git already in use, and who doesn't want to 

--connect to remote repo
    --you can add remote to the local file with "git.addRemote()"

# do pull requests from app
*Start here*
# do comments from app


# create github remote repo from app itself
--check if remote exists
--create initial remote repo
--**TO DO** : need to cleanup code to check if remote exists, and give you ability to change remote

# make project private through app itself




*CODE EXAMPLES*

# Basic version of pushing to github from app


async function sendToGithubFunction(){
    const USER = 'NL33'
    const PASS = ''
    const REPO = 'github.com/nl33/remote-test-repo'
    const remote1 = `https://${USER}:${PASS}@${REPO}`
    const remote2 = 'https://nl33@github.com/nl33/remote-test-repo'

    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.raw('remote', '--v').then(result => {
            console.log('get remote result = ' + result)
        })

        await git.push().then(result => {
            console.log('push origin result = ' + JSON.stringify(result, error))
            if (result){
                document.getElementById('sendOptions').style.display = "none"
                document.getElementById('saveProjectItems').style.display = "block"
                document.getElementById('saveProjectHeader').style.display = "block"
            } else if (error){
                console.log('error in git push function = ')
                console.log(error)
            }
        })

    }
    catch (e) {
        console.log('error in sendToGithubFunction = ' + e)
    }
}
