const { readFile, writeFile, readdirSync } = require('fs');
const { minify } = require('uglify-js');

module.exports = async function (rootpath, targetDirectory) {
    const targetfiles = scan(`${rootpath}/${targetDirectory}`);
    const promises = [];
    for (let i = 0; i < targetfiles.length; i++) {
        promises.push(
            storage(targetfiles[i])
                .then(x => uglify(x.toString(), targetfiles[i]))
                .then(x => storage(targetfiles[i], x)));
    }
    await Promise.all(promises);
}

function storage(path, data = undefined) {  //overrides the targetdirectory files (copy, created in the scan function)
    return new Promise(resolve => {
        const handler = (...args) => { if (args[0]) throw args[0]; resolve(args[1] ?? 0); };
        data ? writeFile(path, data, handler) : readFile(path, handler);
    });
}

function uglify(text, filename) {
    const { code, error } = minify(text);
    if (error) throw new Error(`file: ${filename} \n${error.message}`);
    return code;
}

function scan(basepath, ext = '.js') { //this creates a copy of the files
    const dirents = readdirSync(basepath, { withFileTypes: true });
    const [dirs, files] = [dirents.filter(x => x.isDirectory()), dirents.filter(x => !x.isDirectory())];
    let targetfiles = [];

    for (let i = 0; i < dirs.length; i++) targetfiles = scan(`${basepath}/${dirs[i].name}`).concat(targetfiles);
    targetfiles = files.filter(x => x.name.slice(x.name.length - ext.length) === ext).map(x => `${basepath}/${x.name}`).concat(targetfiles);

    return targetfiles;
}


