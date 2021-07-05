**Explaining the Diff Steps for "Compare Versions**

*Integrated Diff: Common Functions*

# gitDifFunctionIntegrated()
-cwd into project folder path
-run diff name only
    -then call *showChangedDocNames(result)
-run --word-diff
    -then call *showIntegratedDiffResult(result, "summary") //summary says this is part of summary, instead of 

# showChangedDocNames(result)
-result is string of changed doc names
-split result into array based on where '\n'.
-for each file, insert link that has file name, linking to #id 
-if word doc extensions
    -push word doc names into array. call: *startWordDiffProcess()

*Integrated Diff: Non-Word Doc*

# showIntegratedDiffResult(result, type)
-result is the full diff of non-word docs
-parse result to give it colors (insertion and deletion styling)
-split result everytime there is 'diff --git a/' to divide into the different docs
-if not a word document, show the results   
-if wordDoc, put into wordDocArray. After array set, call *startWordProcess 

*Integrated Diff and Block Diff: Word Doc*

# startWordDiffProcess()
-create worktree
-call *createTempFolders()

# createTempFolders()
-create oldtempfolder. Then call function again
-create newTempFolder.
-then call *revertTree, with earlierCommitNumber

# revertTree(treeName, commitNumber)
-git checkout commitnumber on tree
-iterate revertTreeFunctionCounter
-then call *convertWordDoc(treePath)

# convertWordDoc(treePath)  
-if integrated diff: for each item in wordDocArray:
    -mammoth convert to html. then turndown convert to markdown. 
    -add markdown extension (md)
    -change path to replace "/" (because that implies a new directory and would require creating a new directory)
    -if revertTreeFunctionCounter = 1
        -call *writeFileFunction(tempFOlderOld + md-file-path, convertedFileData)
    -if revertTreeFunctionCounter > 1
        -call *writeFileFunction(tempFolderNew + md-file-path, convertedFileData)
-if block diff: for each item in wordDocArray
    -mammoth get raw text
    -add markdown extension (md)
    -change path to replace "/"
    -call *writeFileFunction


 # writeFileFunction(filePath, fileData)
 -write fileData to filePath. then:
    -if filePath is tempFileOld, call *revertTree(laterCommitNumber)
    -if filePath is tempFileNew, then check counters for how many times: writeFile and mammoth has been called, and whether both tempFileOld and tempFileNew have sufficient docs in them.
    -when the counters show that all word files have been converted for old and new folders, call *diffTheTempFolders

 # diffTheTempFolders()
 -if integrated diff: 
    -git diff --word-diff folderOld, folderNew
    -then replace git [-] and {+} with deletion and insertion style
    -split diff result into different files
    -get file name
    -parse change summary
    -show change summary
    -call *removeWorkTreeFromWordComparison

-if block diff:
    -git diff folderOld folderNew
    -call *doTopDiffFunction(diffResult)
    -call *removeWorkTreeFromWordComparison()

# removeWorkTreeFromWordComparison()
-git worktree rmemove (for any file that includes 'worktree3#&7#&1#&4'), then:
    -git worktree prune
    -fs.rm(folderOld)
    -fs.rm(folderNew)

*Block Diff*

# gitDiffFunctionBlock()

# doTopDiffFunction(result)


*Single File: Non-Word Doc*

# diffSingleFile()

-get file name from button
--if integrated diff:
    -if not word doc:
        -git diff -word-diff -u999999, earlierCommitNumber, laterCommitNumber
        -call *showIntegratedDiffResult(result)
    -if word doc:
        -revert counters: revertTreeFunctionCounter
        -put word doc into wordDocsArray
        -call *startWordDiffProcess
        -put these counters to 0: numberOfWordDocsToConvert, mammothCounter, mammothNeedsToRun, writeFileRun (other counters for newFolderLength and oldFolderLength are already reset in writeFileFunction)
--if block diff:
    --call *gitDiffFunctionBlock()


