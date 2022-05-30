const fs = require('fs');
const path = require('path');

function readFilesWithExts(dir, exts, exclude) {
    return fs.readdirSync(dir).filter(filterExts(exts, exclude)).map((file) => {
        return file;
    })
}

function filterExts(exts, excludes) {
    if (typeof exts === 'string') {
        exts = [exts];
    }else if(!Array.isArray(exts)) {
        throw new TypeError('arg exts must be array or string.');
    }

    if (excludes !== undefined) {
        if (typeof excludes === 'string') {
            excludes = [excludes];
        }else if(!Array.isArray(excludes)) {
            throw new TypeError('arg excludes must be array or string.');
        }
    }

    const isExclude = (file) => {
        return excludes !== undefined && excludes.indexOf(file) >= 0;
    }

    return (file) => {
        const extName = path.extname(file);

        return extName !== '' && !isExclude(file) && exts.some(ext => extName === ext )
    }
}

exports.readFilesWithExts = readFilesWithExts;
exports.filterExts = filterExts;
