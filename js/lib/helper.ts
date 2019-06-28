import {AusleseTypes} from "../@types/auslese";
import matchSorter from "match-sorter";

/**
 * Returns whether the node is a child element from the parent (includes being the node itself).
 */
export function isChildElement (parent: Node, node: Node) : boolean
{
    let pointer: Node|null = node;

    while (pointer !== null)
    {
        if (pointer === parent)
        {
            return true;
        }

        pointer = pointer.parentNode;
    }

    return false;
}

/**
 * Builds the choice groups for rendering
 */
export function buildRenderGroups (
    groups: AusleseTypes.Group[],
    selections: AusleseTypes.Selections,
    type: AusleseTypes.SelectionType,
    search: string
) : AusleseTypes.Group[]
{
    let selected: AusleseTypes.Group = {headline: null, choices: [], header: true};
    let result: AusleseTypes.Group[] = [];

    if ("" !== search)
    {
        let filtered = matchSorter(flattenChoices(groups), search, {keys: ["label"]});

        return filtered.length
            ? [{headline: null, choices: filtered}]
            : [];
    }

    groups.forEach(
        group =>
        {
            let transformed: AusleseTypes.Group = {headline: group.headline, choices: []};

            group.choices.forEach(
                choice =>
                {
                    let list = (selections.get(choice) && "multiple" === type)
                        ? selected
                        : transformed;

                    list.choices.push(choice);
                }
            );

            if (transformed.choices.length)
            {
                result.push(transformed);
            }
        }
    );

    if (selected.choices.length)
    {
        result.unshift(selected);
    }

    return result;
}


/**
 * Flatten the choices.
 */
export function flattenChoices (groups: AusleseTypes.Group[]) : AusleseTypes.Choice[]
{
    let flattened: AusleseTypes.Choice[] = [];

    groups.forEach(
        group => group.choices.forEach(c => flattened.push(c))
    );

    return flattened;
}


/**
 * Prepares the mixed choices + groups to just be groups
 */
export function sanitizeGroups (unsorted: (AusleseTypes.Choice|AusleseTypes.Group)[]) : AusleseTypes.Group[]
{
    let groups: AusleseTypes.Group[] = [];
    let lastGroup: AusleseTypes.Group|null = null;

    unsorted.forEach(
        entry => {
            if ((entry as AusleseTypes.Group).headline !== undefined)
            {
                if (lastGroup !== null)
                {
                    groups.push(lastGroup);
                    lastGroup = null;
                }

                groups.push(entry as AusleseTypes.Group);
                return;
            }

            if (lastGroup === null)
            {
                lastGroup = {headline: null, choices: []};
            }

            lastGroup.choices.push(entry as AusleseTypes.Choice);
        }
    );

    if (null !== lastGroup)
    {
        groups.push(lastGroup);
    }

    return groups;
}
