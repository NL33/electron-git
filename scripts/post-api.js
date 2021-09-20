const { readFile, readdirSync, statSync } = require("fs");
var mammoth = require("mammoth");
const sanitizeHtml = require('sanitize-html');
//dexie database for linking project files to discourse posts
const Dexie = require("dexie");
var db = new Dexie("ProjectDatabase");
//Dexie.debug = false //set to false for production. During development, gives more thorough error logs
let projectName;
const { default: axios } = require('axios');
const { addListener } = require("process");
var userKey
var storedUserName

module.exports.setUpDatabase = async function () {
  try {
    await db.version(2).stores({
      fileInfo:
        "++id,fileId, fileName, lastSentTime, filePath, topicId, projectName, pathForTopic, linkAddress, summaryText, topicUserName",
    });
    console.log("setup dexie");
    return "done";
  } catch (error) {
    console.log("error in setUpDexie = " + error);
  }
};

module.exports.sendProject = function (projectFolderPath, projectFolderName) {
  try {
    projectName = projectFolderName;
    projectPath = projectFolderPath;
    const keytar = require('keytar')
    storedUserName = await localStorage.getItem('logged-in-saturn-username')
    await keytar.getPassword('saturn_app_api_token', storedUserName).then((result, err) => {
      if (result) {
        userKey = result
        //get user permission, saying: Make project ${projectName} from user ${storedUserName} visible on RacetoSaturn.com? [Yes].then:
        loopThroughFolder("start");
      } else {
        console.log(err)
        //open window to guide user through authorization process
        return 'done'
      }
    })

  } catch (e) {
    console.log('error in sending project.')
  }
};

/************** Testing Discourse API *******************************/

//current-code
async function loopThroughFolder(thePath) {
  try {
    var currentTime = new Date();
    if (thePath === "start") {
      //why do we specify the path here, including start? Because below in this function, if an item is a directory, we run this loopThroughFolder again, only this time, the starting point is that (sub) directory. So we need a way of distinguishing what directory we are looking at
      var projectPath = projectFolderPath; //overall project path
    } else {
      var projectPath = thePath;
    }

    var projectContents1 = await readdirSync(projectPath); //produces array of all top-level contents of a folder
    var projectContents = projectContents1.filter(
      (item) => !/(^|\/)\.[^\/\.]/g.test(item)
    ); //excludes hidden files like .ds-store and .git files
    for (var i = 0; i < projectContents.length; i++) {
      if (projectContents[i].substring(0, 2) !== "~$") {
        //stop if a temp word file
        var itemPath = path.join(projectPath, projectContents[i]);
        //await fs.stat(itemPath) //fsStat would be used to determine metadata info about the given file, such as when it was last updated
        if (statSync(itemPath).isDirectory() === true) {
          //if a directory, then run this again, until you get to a document
          loopThroughFolder(itemPath);
        } else {
          //if it's a file, then see if a word doc. If so, perform magic.
          var extension = path.extname(itemPath);
          if (extension.includes("doc")) {
            checkDatabase(itemPath, "word");
            // sendDocWordDoc(itemPath)
          } else {
            checkDatabase(itemPath, "notWord");
            //sendDoc(itemPath)
            // return 'done'
          }
        }
      }
    }
  } catch (e) {
    console.log("error in loop through folder = " + e);
  }
}

async function checkDatabase(filePath, wordOrNot) {
  try {
    var stats = statSync(filePath);
    var createTime = stats.birthtimeMs;
    var dbEntry = await db.fileInfo.get({ fileId: createTime });
    if (!dbEntry) {
      //not entered in database yet. should mean no discourse topic created yet. So create a new one
      setUpDocForCreate(filePath, createTime, wordOrNot);
    } else {
      //already a discourse topic
      var lastModifiedTime = stats.mtime; //mtime is when file last modified. ctime includes that time, but also includes if file properties change, like file permissions, name or location. Ctime would be better, but it also updates when the file is opened (even if no other change). So I am going with mtime--and if you want to update the version online, you need to be sure to save it.
      var lastSentTime = dbEntry.lastSentTime;
      var topicId = dbEntry.topicId;
      if (lastModifiedTime > lastSentTime) {
        console.log("time to update for  = " + filePath);
        setUpDocForUpdate(filePath, createTime, wordOrNot, topicId);
      } else {
        console.log("dont update for " + filePath);
      }
    }
  } catch (e) {
    console.log("error in checkDatabase = " + e);
  }
}

function setUpDocForCreate(itemPath, createTime, wordOrNot) {
  try {
    if (wordOrNot === "word") {
      mammoth.convertToHtml({ path: itemPath }).then(function (result) {
        var htmlWord = result.value;
        createDiscoursePostFromFile(itemPath, createTime, htmlWord);
      });
    } else {
      readFile(itemPath, "utf8", function (err, data) {
        if (err) {
          console.log("error in reading file in send doc = " + err);
        } else {
          createDiscoursePostFromFile(itemPath, createTime, data);
        }
      });
    }
  } catch (e) {
    console.log("error in setup doc for create = " + e);
  }
}

function setUpDocForUpdate(itemPath, createTime, wordOrNot, topicId) {
  try {
    console.log("setup doc for Update, for: " + itemPath);
    if (wordOrNot === "word") {
      mammoth.convertToHtml({ path: itemPath }).then(function (result) {
        var htmlWord = result.value;
        updateDiscoursePostFromFile(itemPath, createTime, htmlWord, topicId);
      });
    } else {
      readFile(itemPath, "utf8", function (err, data) {
        if (err) {
          console.log("error in reading file in send doc = " + err);
        } else {
          updateDiscoursePostFromFile(itemPath, createTime, data, topicId);
        }
      });
    }
  } catch (e) {
    console.log("error in setup doc for update = " + e);
  }
}



/**************SEND THE DOCS TO THE WEB APP ************************ */


function createDiscoursePostFromFile(filePath, createTime, data) {
  var testOrLive = "test";
  if (testOrLive === "live") {
    var url = "https://go.racetosaturn.com/posts.json";
    var category = 36;
    var userName = storedUserName;
    var apiKey = userKey;
  } else {
    var url = "http://localhost:4200/posts.json";
    var category = 11;
    var userName = "winst1143";
    var apiKey = ""; //environmentVariables.wsKey,
    var apiUserName = ""; // environmentVariables.wsName,
  }

  var title = path.basename(filePath);
  var topicContent = data;

  var tagName = "music";

  var filePathArray = filePath.split(projectName);
  var pathForTopic = projectName + filePathArray[1];

  var summaryText = "";
  if (title.includes("project-summary.")) {
    var summaryTextRaw = data;
    summaryText = sanitizeHtml(summaryTextRaw).trim();
  }

  /*
    example:
    project name (projectFolderName) = 'rocking-research'
    doc path = Users/win/desktop/rocking-research/post-enlightenment/platos-influences.docx
    topicpathForTopic = 'rocking-research/post-enlightenment/platos-influences.docx'
   */

  axios({
    method: "post",
    url: url,
    contentType: "multipart/form-data",
    data: {
      title: topicShowPath,
      raw: topicContent,
      category: category,
      project_main: projectName,
      path_for_topic: pathForTopic,
      summary_text: summaryText,
      doc_create_time: topicId, //don't need this now but good to have there in case switch db structure in the future.
      tags: [tagName],
    },
    headers: {
      "User-Api-Key": apiKey,
    },
    dataType: "json",
  })
    .then((response) => {
      console.log("created new post for = " + filePath);
      console.log("heres the response = ");
      console.log(response);
      var topicId = response.data.id;
      var timeNow1 = new Date();
      var userName = storedUserName
      /*GET USER NAME ^^^^^^^^^^^^^^^*/
      var timeNow = timeNow1.getTime();
      db.fileInfo.add({
        fileId: createTime,
        fileName: title,
        filePath: filePath,
        topicId: topicId,
        lastSentTime: timeNow,
        projectName: projectName,
        pathForTopic: pathForTopic,
        linkAddress: "",
        summaryText: "",
        topicUserName: userName,
        //project?
      });
    })
    .catch((error) => {
      console.log("error in api post test =");
      console.log(error);
    });
}
//wsKey
function updateDiscoursePostFromFile(filePath, createTime, data, topicId) {
  var testOrLive = "test";
  if (testOrLive === "live") {
    var url = "https://go.racetosaturn.com/posts.json";
    var userName = storedUserName;
    var apiKey = userKey;
  } else {
    var url = "http://localhost:4200/posts.json";
    var category = 11;
    var userName = "winst1143";
    var apiKey = ""; //environmentVariables.wsKey,
    var apiUserName = ""; // environmentVariables.wsName,
  }
  var title = path.basename(filePath);
  var topicContent = data;
  var topicShowPath = filePath.substring(
    filePath.indexOf(projectFolderName) + (projectFolderName.length + 1)
  );
  var userName = storedUserName; //***Have to get this programmatically*****/
  var tagName = 'music'
  axios({
    method: "put",
    url: url,
    contentType: "multipart/form-data",
    data: {
      title: topicShowPath,
      raw: topicContent,
      tags: [tagName],
    },
    headers: {
      "User-Api-Key": userKey,
    },
    dataType: "json",
  })
    .then((response) => {
      console.log("discourse post updated for = " + topicShowPath);
      var timeNow1 = new Date();
      var timeNow = timeNow1.getTime();
      db.transaction("rw", db.fileInfo, async () => {
        db.fileInfo.where("fileId").equals(createTime).modify({
          fileName: title, //most of the time will be the same. but would be updated if user changes the title
          filePath: filePath, //most of the time will be the same. but would be updated if user changes the path
          lastSentTime: timeNow,
          projectName: projectName, //just in case this changes
          linkAddress: "",
          summaryText: "",
        });
        const viewEntry = await db.fileInfo
          .where({ fileId: createTime })
          .toArray();
      })
        .catch(Dexie.ModifyError, (error) => {
          // ModifyError did occur
          console.error(error.failures.length + " items failed to modify");
        })
        .catch((error) => {
          console.error("Generic error: " + error);
        });
    })
    .catch((error) => {
      console.log("error in update discourse post from file =");
      console.log(error);
    });
}
