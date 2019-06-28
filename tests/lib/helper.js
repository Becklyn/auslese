import test from "ava";
import {sanitizeGroups, flattenChoices} from "../../js/lib/helper";


test("sanitizeGroups: pass single group directly", t => {
    let input = [
        {headline: null, choices: [1,2,3]},
    ];

    t.deepEqual(sanitizeGroups(input), [{headline: null, choices: [1, 2, 3]}]);
});

test("sanitizeGroups: pass single choice directly", t => {
    let input = [
        {label: "test"},
    ];

    t.deepEqual(sanitizeGroups(input), [{headline: null, choices: [{label: "test"}]}]);
});


test("sanitizeGroups: mixed test", t => {
    let input = [
        {label: "test"},
        {headline: null, choices: [1,2,3]},
        {label: "test 2"},
        {label: "test 3"},
        {label: "test 4"},
        {headline: null, choices: [4,5,6]},
        {label: "test 5"},
    ];

    t.deepEqual(sanitizeGroups(input), [
        {headline: null, choices: [{label: "test"}]},
        {headline: null, choices: [1, 2, 3]},
        {headline: null, choices: [
            {label: "test 2"},
            {label: "test 3"},
            {label: "test 4"},
        ]},
        {headline: null, choices: [4,5,6]},
        {headline: null, choices: [{label: "test 5"}]},
    ]);
});


test("flatten choices", t => {
    let input = [
        {headline: null, choices: [1,2,3]},
        {headline: null, choices: [4,5,6]},
    ];

    t.deepEqual(flattenChoices(input), [1, 2, 3, 4, 5, 6]);
});
