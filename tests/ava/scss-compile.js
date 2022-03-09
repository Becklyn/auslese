import test from "ava";
const sass = require('sass');
const path = require('path');

test("SCSS should be compileable", t => {
    const result = sass.compile(path.join(__dirname, "../../scss/auslese.scss"));

    t.truthy(result.css);
});
