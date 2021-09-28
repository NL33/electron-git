const { readFileSync, writeFileSync } = require('fs');

module.exports = function (rootpath, exclude) {
    if (exclude.length) {
        const package = JSON.parse(readFileSync(`${rootpath}/package.json`).toString());
        for (let i = 0; i < exclude.length; i++) delete package[exclude[i]];
        writeFileSync(`${rootpath}/package.json`, JSON.stringify(package));
    }
}