import {isSearchable} from "../../../js/lib/config-helper";


describe('isSearchable() Tests', () =>
{
    const emptyChoices = [];
    const manyChoices = (new Array(10)).fill({label: "1", value: "1"});

    const cases = [
        [false, "single", undefined, emptyChoices],
        [false, "multiple", undefined, emptyChoices],
        [false, "tags", undefined, emptyChoices],

        [true, "single", undefined, manyChoices],
        [true, "multiple", undefined, manyChoices],
        [false, "tags", undefined, manyChoices],

        [false, "single", false, emptyChoices],
        [false, "multiple", false, emptyChoices],
        [false, "tags", false, emptyChoices],

        [false, "single", false, manyChoices],
        [false, "multiple", false, manyChoices],
        [false, "tags", false, manyChoices],

        [true, "single", true, emptyChoices],
        [true, "multiple", true, emptyChoices],
        [false, "tags", true, emptyChoices],

        [true, "single", true, manyChoices],
        [true, "multiple", true, manyChoices],
        [false, "tags", true, manyChoices],
    ];

    cases.forEach(([expected, type, searchable, choices]) =>
    {
        const label = `with type: "${type}", searchable: "${String(searchable)}", choices: "${choices.length > 5 ? "many" : "few"}"`;

        it(label, () => {
            expect(isSearchable(type, searchable, choices)).to.eq(expected);
        });
    });
});
