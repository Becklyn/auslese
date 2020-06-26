import {AusleseTypes} from "./@types/auslese";


/**
 * Helper function to easily create choice groups from choices
 */
export function prepareMinimalChoices (choices: AusleseTypes.Choice|AusleseTypes.Choice[], headline: string|null = null) : AusleseTypes.Group[]
{
    return [{
        headline,
        choices: Array.isArray(choices) ? choices : [choices],
    }];
}
