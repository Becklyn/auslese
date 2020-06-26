import {parseSelect} from "../../../js/automount";


const createSelect = (html) =>
{
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (doc.children.length !== 1)
    {
        throw new Error("Can only parse HTML with exactly one valid root element. A valid element can stand on its own in the body.");
    }

    return doc.body.children[0];
};


describe('parseSelect() Tests', () => {
    it('parse simple list', () =>
    {
        const select = createSelect(`
        <select>
            <option value="a">test1</option>
            <option value="b">test2</option>
        </select>
        `);

        const props = parseSelect(select);
        expect(props.choices).to.eql([
            {
                headline: null,
                choices: [
                    {label: "test1", value: "a", disabled: false},
                    {label: "test2", value: "b", disabled: false},
                ]
            }
        ]);

        // in a single select it automatically selects the first
        expect(props.selection).to.eql({
            a: true,
        });
    });


    it("parse placeholder", () =>
    {
        const select = createSelect(`
        <select>
            <option value="">placeholder text</option>
            <option value="b">test2</option>
        </select>
        `);

        const props = parseSelect(select);
        expect(props.choices).to.eql([
            {
                headline: null,
                choices: [
                    {label: "test2", value: "b", disabled: false},
                ]
            }
        ]);

        expect(props.selection).to.eql({});
        expect(props.placeholder).to.equal("placeholder text");
    });


    it("has not default option in multiple select", () =>
    {
        const select = createSelect(`
        <select multiple>
            <option value="a">test1</option>
            <option value="b">test2</option>
        </select>
        `);

        const props = parseSelect(select);
        expect(props.choices).to.eql([
            {
                headline: null,
                choices: [
                    {label: "test1", value: "a", disabled: false},
                    {label: "test2", value: "b", disabled: false},
                ]
            }
        ]);

        expect(props.selection).to.eql({});
    });



    it('parse complex example (with empty group)', () =>
    {
        const select = createSelect(`
        <select multiple>
            <option value="a">test1</option>
            <option value="b" selected>test2</option>
            <option value="c" disabled>test3</option>
            <optgroup label="Group 1">
                <option value="1.1" selected>Nested 1.1</option>
                <option value="1.2">Nested 1.2</option>
            </optgroup>
            <option value="middle" selected>test middle</option>
            <optgroup label="Group 2">
                <option value="2.1">Nested 2.1</option>
                <option value="2.2">Nested 2.2</option>
            </optgroup>
            <option value="middle 2">test middle 2</option>
            <optgroup label="empty"></optgroup>
            <option value="last">test last</option>
        </select>
        `);

        const props = parseSelect(select);
        expect(props.choices).to.eql([
            {
                headline: null,
                choices: [
                    {label: "test1", value: "a", disabled: false},
                    {label: "test2", value: "b", disabled: false},
                    {label: "test3", value: "c", disabled: true},
                ],
            },
            {
                headline: "Group 1",
                choices: [
                    {label: "Nested 1.1", value: "1.1", disabled: false},
                    {label: "Nested 1.2", value: "1.2", disabled: false},
                ],
            },
            {
                headline: null,
                choices: [
                    {label: "test middle", value: "middle", disabled: false},
                ],
            },
            {
                headline: "Group 2",
                choices: [
                    {label: "Nested 2.1", value: "2.1", disabled: false},
                    {label: "Nested 2.2", value: "2.2", disabled: false},
                ],
            },
            {
                headline: null,
                choices: [
                    {label: "test middle 2", value: "middle 2", disabled: false},
                    {label: "test last", value: "last", disabled: false},
                ],
            },
        ]);
        expect(props.selection).to.eql({
            b: true,
            "1.1": true,
            "middle": true,
        });
    });


    it('parse preferred only list', () =>
    {
        const select = createSelect(`
        <select multiple>
            <option value="a">test1</option>
            <option value="b">test2</option>
            <option value="c">test3</option>
            <option disabled>-------------------</option>
        </select>
        `);

        const props = parseSelect(select);
        expect(props.choices).to.eql([
            {
                headline: "Preferred Options",
                choices: [
                    {label: "test1", value: "a", disabled: false},
                    {label: "test2", value: "b", disabled: false},
                    {label: "test3", value: "c", disabled: false},
                ]
            }
        ]);
        expect(props.selection).to.eql({});
    });


    it('parse preferred mixed list', () =>
    {
        const select = createSelect(`
        <select multiple>
            <option value="a">test1</option>
            <option value="b">test2</option>
            <option value="c">test3</option>
            <option disabled>-------------------</option>
            <option value="d">test4</option>
            <option value="e">test5</option>
        </select>
        `);

        const props = parseSelect(select);
        expect(props.choices).to.eql([
            {
                headline: "Preferred Options",
                choices: [
                    {label: "test1", value: "a", disabled: false},
                    {label: "test2", value: "b", disabled: false},
                    {label: "test3", value: "c", disabled: false},
                ]
            },
            {
                headline: null,
                choices: [
                    {label: "test4", value: "d", disabled: false},
                    {label: "test5", value: "e", disabled: false},
                ]
            }
        ]);
        expect(props.selection).to.eql({});
    });


    it('use passed preferred label', () =>
    {
        const select = createSelect(`
        <select multiple>
            <option value="a">test1</option>
            <option disabled>-------------------</option>
        </select>
        `);

        const props = parseSelect(select, "custom preferred label");
        expect(props.choices).to.eql([
            {
                headline: "custom preferred label",
                choices: [
                    {label: "test1", value: "a", disabled: false},
                ]
            },
        ]);
        expect(props.selection).to.eql({});
    });


    it('parse preferred items complex', () =>
    {
        const select = createSelect(`
        <select multiple>
            <optgroup label="Group 1">
                <option value="1.1" selected>Nested 1.1</option>
                <option value="1.2">Nested 1.2</option>
            </optgroup>
            <option value="1">test1</option>
            <option value="2">test2</option>
            <option value="3">test3</option>
            <option disabled>-------------------</option>
            <optgroup label="Group 2">
                <option value="2.1" selected>Nested 2.1</option>
                <option value="2.2">Nested 2.2</option>
            </optgroup>
            <option value="4">test4</option>
        </select>
        `);

        const props = parseSelect(select, "pref");
        expect(props.choices).to.eql([
            {
                headline: "Group 1",
                choices: [
                    {label: "Nested 1.1", value: "1.1", disabled: false},
                    {label: "Nested 1.2", value: "1.2", disabled: false},
                ]
            },
            {
                headline: "pref",
                choices: [
                    {label: "test1", value: "1", disabled: false},
                    {label: "test2", value: "2", disabled: false},
                    {label: "test3", value: "3", disabled: false},
                ]
            },
            {
                headline: "Group 2",
                choices: [
                    {label: "Nested 2.1", value: "2.1", disabled: false},
                    {label: "Nested 2.2", value: "2.2", disabled: false},
                ]
            },
            {
                headline: null,
                choices: [
                    {label: "test4", value: "4", disabled: false},
                ]
            },
        ]);
        expect(props.selection).to.eql({
            "1.1": true,
            "2.1": true,
        });
    });


    it('parse preferred items: invalid, multiple', () =>
    {
        const select = createSelect(`
        <select multiple>
            <option value="1">test1</option>
            <option disabled>-------------------</option>
            <option disabled>-------------------</option>
        </select>
        `);

        expect(() => parseSelect(select)).to.throw("Multiple preferred markers found");
    });


    it('parse preferred items: invalid, nested', () =>
    {
        const select = createSelect(`
        <select multiple>
            <optgroup label="Test">
                <option disabled>-------------------</option>
            </optgroup>
        </select>
        `);

        expect(() => parseSelect(select)).to.throw("Found invalid preferred marker");
    });


    it('parse preferred items: empty preferred at start', () =>
    {
        const select = createSelect(`
        <select multiple>
            <option disabled>-------------------</option>
            <option value="1">test1</option>
            <option value="2">test2</option>
        </select>
        `);

        const props = parseSelect(select, "pref");
        expect(props.choices).to.eql([
            {
                headline: null,
                choices: [
                    {label: "test1", value: "1", disabled: false},
                    {label: "test2", value: "2", disabled: false},
                ]
            },
        ]);

        expect(props.selection).to.eql({});
    });


    it('parse preferred items: empty preferred after group', () =>
    {
        const select = createSelect(`
        <select multiple>
            <option value="1">test1</option>
            <optgroup label="Group">
                <option value="1.1">Nested 1.1</option>
                <option value="1.2">Nested 1.2</option>
            </optgroup>
            <option disabled>-------------------</option>
            <option value="2">test2</option>
            <option value="3">test3</option>
        </select>
        `);

        const props = parseSelect(select, "pref");
        expect(props.choices).to.eql([
            {
                headline: null,
                choices: [
                    {label: "test1", value: "1", disabled: false},
                ]
            },
            {
                headline: "Group",
                choices: [
                    {label: "Nested 1.1", value: "1.1", disabled: false},
                    {label: "Nested 1.2", value: "1.2", disabled: false},
                ]
            },
            {
                headline: null,
                choices: [
                    {label: "test2", value: "2", disabled: false},
                    {label: "test3", value: "3", disabled: false},
                ]
            },
        ]);

        expect(props.selection).to.eql({});
    });
});
