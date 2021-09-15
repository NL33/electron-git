const { exec } = require('child_process');
const { readFile, writeFile } = require('fs');
//get icons for windows and apps
module.exports = async function (appsInfo, iconsFolder = "icons") {
    const memory = await read(`${iconsFolder}/memory.json`).then(d => JSON.parse(d));
    const promises = [];
    for (let i = 0; i < appsInfo.length; i++) {
        const { path, bundleId } = appsInfo[i];
        if (memory[bundleId]) {
            appsInfo[i].icon = memory[bundleId];
            continue;
        }
        promises.push(
            read(`${appsInfo[i].path}/Contents/Info.plist`)
                .then(async infoplist => {
                    const iconName = extractIconName(infoplist);
                    if (!iconName) throw Error();
                    const iconFile = await icon2png(`${path}/Contents/Resources/${iconName}`, `${iconsFolder}/${bundleId}.png`);
                    memory[bundleId] = iconFile;
                    appsInfo[i].icon = iconFile;
                }).catch(e => {
                    memory[bundleId] = `${iconsFolder}/standard.png`;
                    appsInfo[i].icon = `${iconsFolder}/standard.png`;
                })
        );
    }


    await Promise.all(promises);
    await write(`${iconsFolder}/memory.json`, JSON.stringify(memory, null, 2));
    return appsInfo;
}

function extractIconName(infoplist) {
    const keys = ['CFBundleIconFile', 'CFBundleIconName'];
    let info = {};

    for (let i = 0; i < keys.length; i++) {
        const offset = infoplist.indexOf(keys[i]);
        const start = infoplist.indexOf('<string>', offset) + '<string>'.length;
        const end = infoplist.indexOf('</string>', offset);
        info[keys[i]] = start !== -1 && end !== -1 && offset !== -1 ? infoplist.slice(start, end) : false;
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

