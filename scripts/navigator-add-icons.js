const { exec } = require('child_process');
const { readFile, writeFile } = require('fs');

module.exports = async function (appsInfo, iconsFolder = "icons") {
    try {
        const memory = await read(`${iconsFolder}/memory.json`).then(d => JSON.parse(d));
        const promises = [];
        for (let i = 0; i < appsInfo.paths.length; i++) {
            const pathId = appsInfo.paths[i]
            const pathZ1 = appsInfo.paths[i].replace(/:+$/, '').replace(/:/g, '/').replace('MacOS', '').replace('Macintosh HD', '')
            if (memory[pathId]) {
                console.log(memory[pathId])
                appsInfo.icons[i] = memory[pathId];
                continue;
            }
            promises.push(
                read(`${pathZ1}/Contents/Info.plist`)
                    .then(async infoplist => {
                        const iconName = extractIconName(infoplist);
                        if (!iconName) {
                            //throw Error();
                        }
                        const iconFile = await icon2png(`${pathZ1}/Contents/Resources/${iconName}`, `${iconsFolder}/${pathId}.png`);

                        memory[pathId] = iconFile;
                        appsInfo.icons[i] = iconFile;
                    }).catch(e => {
                        console.log('***error = ' + e)
                        /***ADD ICON HERE IF ERROR IN APP ICON ********/
                        // memory[pathId] = `${iconsFolder}/standard.png`;
                        //appsInfo.icons[i] = `${iconsFolder}/standard.png`;
                    })
            );
        }


        await Promise.all(promises);
        await write(`${iconsFolder}/memory.json`, JSON.stringify(memory, null, 2));
        return appsInfo;
    } catch (e) {
        console.log('error in add icons = ' + e)
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