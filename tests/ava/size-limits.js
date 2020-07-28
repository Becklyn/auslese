import test from "ava";
import fs from "fs";
import path from "path";
import Terser from "terser";

// mapping of files to limit
let files = {
    'index.js': 100,
    'Auslese.js': 3700,
    'automount.js': 1850,
    'lib/helper.js': 1025,
    'lib/icons.js': 1350,
    'components/Choice.js': 500,
    'components/CurrentLabels.js': 575,
    'components/CurrentText.js': 300,
    'components/Group.js': 425,
};



Object.keys(files).forEach(fileName => {
    let sizeLimit = files[fileName];

    test(`${fileName} < ${sizeLimit}B`, t => {
        let fileContent = fs.readFileSync(path.join(__dirname, "../../js", fileName));

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
