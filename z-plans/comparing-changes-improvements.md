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





*Identified Issues*

- Notes: I had a few versions saved. Then I added a word documnt. and saved the version. When I went to compare the changes (version with the word doc, v version without), the word doc did not show up. It had this error: Unhandled rejection Error: ENOENT: no such file or directory, open '/Users/sean/Desktop/git-app-test-docs/remote-test/426708worktree3#&7#&1#&4/llc-agreement.docx’.
- 	further notes

- comparing changes: If you select two different versions, and then hit "compare changes" again, it makes both newer and older version the same (the later one). Fix this (Note of June 30, 2021). More detail: its possible for "new version" header to not be updated, and to wrongly show the last saved version, when it should show current local saved changes. And then for both "new version" and "older version" to show the same version number. In this case, it will run a diff of a version against itself. This happened for me when I had selected two different versions, then hit compare changes again
- comparison: after run the diff, you show the file name at the top of each section showing changes. Right now, you identify that name by seeing if there is any white space. But what if the file name has white space in it? Probably doesnt work. Fix it. To test, try a file name with white space in it
    - CONFIRMED: White space in a file name means the link to the file won’t work 
- comparison: right now, if try to run a comparison too quickly after running another, the first comparison's temp folders could still be there. Make sure this doesn't cause issues.
- Issue: when running a conversion, if there is a "<" in there, everything afterward is stripped away. This can have strange implications, like if that section was in the deleted sections, then the result would be a start of <del> without an end. So everything from then on would show up as deleted.
    - see z-later-next.md file for more on this
- when want to select different versions, getting “unexpected token” in html, line 1, for comparing versions, if I just recently did something else (like save a version or open old versions)
