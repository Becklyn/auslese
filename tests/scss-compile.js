import test from "ava";
const sass = require('node-sass');
const path = require('path');

test("SCSS should be compileable", t => {
    let result = sass.renderSync({
        file: path.join(__dirname, "../scss/auslese.scss"),
    });

    t.truthy(result.css);
});
