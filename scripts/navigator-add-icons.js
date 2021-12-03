const { exec } = require('child_process');
const { readFile, writeFile } = require('fs');
var path = require("path")
var iconName = 'AppIcon'
var iconFile = ''
module.exports = async function (appsInfo, iconsFolder1 = "icons") {
    try {
        const memoryInfo = require(__dirname + '/../icons/memory.json')
        const iconsFolder = path.join(__dirname + '/../icons')
        if (!memoryInfo) {
            console.log('NO Memory info')
            return appsInfo
        } else {
            const memory = memoryInfo//await read(iconFile).then(d => JSON.parse(d));
            const promises = [];
            for (let i = 0; i < appsInfo.paths.length; i++) {
                const pathId = appsInfo.paths[i]
                const pathZ1 = appsInfo.paths[i].replace(/:+$/, '').replace(/:/g, '/').replace('MacOS', '').replace('Macintosh HD', '')
                if (memory[pathId]) {
                    appsInfo.icons[i] = memory[pathId];
                    continue;
                } else {
                    appsInfo.icons[i] = 'undefined'
                    /*continue;*/
                    /*commented out the bottom bc in production its not working*/
                promises.push(
                    read(`${pathZ1}/Contents/Info.plist`)
                        .then(async infoplist => {
                            iconName = await extractIconName(infoplist);
                            iconFile = await icon2png(`${pathZ1}/Contents/Resources/${iconName}`, `icons/${pathId}.png`);
                            memory[pathId] = iconFile;
                            appsInfo.icons[i] = iconFile;
                        }).catch(async e => {
                            try {
                                var appName = pathZ1.split('/').at(-1).replace('.app', '').trim()
                                if (appName == 'Microsoft Word') {
                                    var iconNameRaw = 'MSWD'
                                    iconName = iconNameRaw.replace('.icns', '') + '.icns'
                                } else if (appName == 'Microsoft Excel') {
                                    var iconNameRaw = 'XCEL'
                                    iconName = iconNameRaw.replace('.icns', '') + '.icns'
                                } else if (appName == 'Microsoft Outlook') {
                                    var iconNameRaw = 'Outlook'
                                    iconName = iconNameRaw.replace('.icns', '') + '.icns'
                                } else if (appName === 'Microsoft PowerPoint') {
                                    var iconNameRaw = 'PPT3'
                                    iconName = iconNameRaw.replace('.icns', '') + '.icns'
                                } else if (appName === 'Microsoft OneNote') {
                                    var iconNameRaw = 'OneNote'
                                    iconName = iconNameRaw.replace('.icns', '') + '.icns'
                                } else if (appName === 'Xcode') {
                                    var iconNameRaw = 'Xcode'
                                    iconName = iconNameRaw.replace('.icns', '') + '.icns'
                                } else if (appName === "iMovie"){
                                    var iconNameRaw = 'iMovieAppIcon'
                                    iconName = iconNameRaw.replace('.icns', '') + '.icns' 
                                } else if (appName === "OneDrive"){
                                    var iconNameRaw = 'OneDrive'
                                    iconName = iconNameRaw.replace('.icns', '') + '.icns'
                            } else if (appName === "Slack") {
                                var iconNameRaw = 'electron'
                                iconName = iconNameRaw.replace('.icns', '') + '.icns'
                            } else {
                                    console.log('use another icon')
                                    iconName = 'AppIcon.icns'
                                }
                               
                                iconFile = await addInIcon(pathZ1, pathId, iconName, iconsFolder)
                                memory[pathId] = iconFile;
                                appsInfo.icons[i] = iconFile;
                            } catch (errorNow) {
                                console.log('error in retrieving icon function = ' + errorNow)
                            }
                        })

                );
            }
        
            await Promise.all(promises);
            await write(`${iconsFolder}/memory.json`, JSON.stringify(memory, null, 2));
            return appsInfo;
        }
        }//end if memoryInfo
    } catch (e) {
        console.log('error in add icons = ' + e)
    }
}

async function addInIcon(pathZ1, pathId, iconName, iconsFolder) {
    try {
        let iconFile1 = await icon2png(`${pathZ1}/Contents/Resources/${iconName}`, `icons/${pathId}.png`);
        return iconFile1
    } catch (e) {
        console.log('error in addInIcon function = ' + e)
    }
}

function extractIconName(infoplist) {
    const keys = ['Icon file', 'Icon name'];
    let info = {};

    for (let i = 0; i < keys.length; i++) {
        const offsetRaw = infoplist.indexOf(keys[i]);
        var offset = -1
        if ((offsetRaw === -1) && (keys[i] === 'Icon file')) {
            offset = infoplist.indexOf('CFBundleIconFile')
        } else if ((offsetRaw === -1) && (keys[i] === 'Icon name')) {
            offset = infoplist.indexOf('CFBundleIconName')
        } else {
            offset = offsetRaw
        }
        const start = infoplist.indexOf('<string>', offset) + '<string>'.length;
        const end = infoplist.indexOf('</string>', offset);
        info[keys[i]] = start !== -1 && end !== -1 && offset !== -1 ? infoplist.slice(start, end) : 'AppIcon';
    }

    let iconName = info[keys[0]] ?? response[keys[1]];
    if (iconName) iconName = iconName.replace('.icns', '') + '.icns';
    return iconName;
}

function icon2png(inputPath, outPutPath) {
    return new Promise((resolve, reject) => exec(
        `sips -Z 50 -s format png "${inputPath}" --out "${outPutPath}"`,
        (_, stdout, stderr) => stderr ? reject(stderr) : resolve(outPutPath)
    ));
}

function read(path) {
    return new Promise((resolve, reject) =>
        readFile(path, (err, data) => err ? reject(err) : resolve(data.toString())));
}

function write(path, data) {
    return new Promise((resolve, reject) =>
        writeFile(path, data, (err) => err ? reject(err) : resolve(true)));
}