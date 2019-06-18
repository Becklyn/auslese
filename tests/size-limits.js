import test from "ava";
import fs from "fs";
import path from "path";
import Terser from "terser";

// mapping of files to limit
let files = {
    'index.js': 80,
    'Auslese.js': 220,
    'automount.js': 100,
    'lib/helper.js': 250,
    'lib/icons.js': 300,
    'components/Choice.js': 300,
    'components/CurrentLabels.js': 300,
    'components/CurrentText.js': 300,
    'components/Group.js': 300,
};

Object.keys(files).forEach(fileName => {
    let sizeLimit = files[fileName];

    test(`${fileName} < ${sizeLimit}B`, t => {
        let fileContent = fs.readFileSync(path.join(__dirname, "../js", fileName));

        let minified = Terser.minify(fileContent.toString(), {
            ecma: 6,
            warnings: true,
            mangle: {
                properties: true,
            },
            toplevel: true,
        });

        let minifiedSize = Buffer.byteLength(minified.code, "utf-8");

        t.falsy(minified.error !== undefined && Object.keys(minified.error) > 0, "No minification errors");
        t.falsy(minified.warnings !== undefined && Object.keys(minified.warnings) > 0, "No minification warnings");
        t.truthy(minifiedSize < sizeLimit, `${fileName}: Minified size of ${minifiedSize}B < size limit ${sizeLimit}B`);
    });
});
