import {AusleseTypes} from "../@types/auslese";
import matchSorter from "match-sorter";

/**
 * Returns whether the node is a child element from the parent (includes being the node itself).
 *
 * @internal
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
 *
 * @internal
 */
export function buildRenderGroups (
    groups: AusleseTypes.Group[],
    selections: AusleseTypes.Selection,
    type: AusleseTypes.SelectionType,
    search: string
) : AusleseTypes.Group[]
{
    const selected: AusleseTypes.Group = {headline: null, choices: [], header: true};
    const result: AusleseTypes.Group[] = [];

    if ("" !== search)
    {
        const filtered = matchSorter(flattenChoices(groups), search, {keys: ["label"]});

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
                    let list = (choice.value && selections[choice.value] && "multiple" === type)
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
        selected.choices = filterDuplicateChoices(selected.choices);
        result.unshift(selected);
    }

    return result;
}


/**
 * Flatten the choices.
 *
 * @internal
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
 * Filters duplicate choices in the choice list
 *
 * @internal
 */
export function filterDuplicateChoices (choices: AusleseTypes.Choice[]) : AusleseTypes.Choice[]
{
    const map: Record<string, Record<string, AusleseTypes.Choice>> = {};

    choices.forEach(choice => {
        if (!map[choice.value])
        {
            map[choice.value] = {};
        }

        // always keep the first one, to keep the relative order
        if (!map[choice.value][choice.label])
        {
            map[choice.value][choice.label] = choice;
        }
    })

    const filtered: AusleseTypes.Choice[] = [];
    for (const value in map)
    {
        for (const label in map[value])
        {
            filtered.push(map[value][label]);
        }
    }

    return filtered;
}
