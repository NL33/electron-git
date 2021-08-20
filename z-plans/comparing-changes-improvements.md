**Improvements to Comparing Changes Functionality**

Started August 20, 2021

# Goal

There have been some issues with comparing changes and I want to improve them

# Make comparing changes its own window

that can isolate the code more.

but: focus first is getting the comparison to run smoothly, and making this change started to become time consuming. So I will address this later


# Notes


*Issue: add new word doc, and not being picked up*

# Issue Description

I had a few versions saved. Then I added a word documnt. and saved the version. When I went to compare the changes (version with the word doc, v version without), the word doc did not show up. It had this error: Unhandled rejection Error: ENOENT: no such file or directory, open '/Users/sean/Desktop/git-app-test-docs/remote-test/426708worktree3#&7#&1#&4/llc-agreement.docx’

# Notes

-only happens with word docs. Because only word docs create a work tree and temp folder
-the work tree and temp folder are not properly being deleted
-seems to happen just for newly added word docs, or when comparing versions where a word doc has been removed.

# Why its happening

-if you add a word doc, and then compare against a version without that word doc, then it returns an error, because the code assumes there is a word doc in both folders to compare against

-RESOLVED (I think), as of Aug20, 2021, at 3:09pm EST.





*Identified Issues*

- Notes: I had a few versions saved. Then I added a word documnt. and saved the version. When I went to compare the changes (version with the word doc, v version without), the word doc did not show up. It had this error: Unhandled rejection Error: ENOENT: no such file or directory, open '/Users/sean/Desktop/git-app-test-docs/remote-test/426708worktree3#&7#&1#&4/llc-agreement.docx’. DONE/RESOLVED (I THINK)
- 	further notes
