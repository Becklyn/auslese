import {flattenChoices} from "../../../js/lib/helper";


describe('flattenChoices() Tests', () => {
    it("should properly flatten", () => {
        let input = [
            {headline: null, choices: [1,2,3]},
            {headline: null, choices: [4,5,6]},
        ];

        expect(flattenChoices(input)).to.eql([1, 2, 3, 4, 5, 6]);
    });
});
