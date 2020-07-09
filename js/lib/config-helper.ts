import {AusleseTypes} from "../@types/auslese";


/**
 * Returns whether the auslese
 *
 * @internal
 */
export function isSearchable (
    type: AusleseTypes.SelectionType,
    searchable: boolean|undefined,
    choices: AusleseTypes.Choice[]
) : boolean
{
    if ("tags" === type)
    {
        return false;
    }

    if (null != searchable)
    {
        return searchable;
    }

    return choices.length > 5;
}
