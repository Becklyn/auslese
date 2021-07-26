import {flattenChoices} from "../../../js/lib/helper";


describe('flattenChoices() Tests', () => {
    it("should properly flatten", () => {
        const input = [
            {
                headline: null,
                choices: [
                    {
                        label: 1,
                        value: 1,
                    },
                    {
                        label: 2,
                        value: 2,
                    },
                    {
                        label: 3,
                        value: 3,
                    },
                ],
            },
            {
                headline: "Group Headline",
                choices: [
                    {
                        label: 4,
                        value: 4,
                    },
                    {
                        label: 5,
                        value: 5,
                    },
                    {
                        label: 6,
                        value: 6,
                    },
                ],
            },
        ];

        const expected = [
            {
                label: 1,
                value: 1,
                group: {
                    headline: null,
                    header: undefined,
                },
            },
            {
                label: 2,
                value: 2,
                group: {
                    headline: null,
                    header: undefined,
                },
            },
            {
                label: 3,
                value: 3,
                group: {
                    headline: null,
                    header: undefined,
                },
            },
            {
                label: 4,
                value: 4,
                group: {
                    headline: "Group Headline",
                    header: undefined,
                },
            },
            {
                label: 5,
                value: 5,
                group: {
                    headline: "Group Headline",
                    header: undefined,
                },
            },
            {
                label: 6,
                value: 6,
                group: {
                    headline: "Group Headline",
                    header: undefined,
                },
            },
        ];

        expect(flattenChoices(input)).to.eql(expected);
    });
});
