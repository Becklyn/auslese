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
    const selected: AusleseTypes.Group = {
        headline: null,
        choices: [],
        header: true,
    };
    const result: AusleseTypes.Group[] = [];

    if ("" !== search)
    {
        const filtered = matchSorter(flattenChoices(groups), search, {keys: ["choice.label"]});

        return filtered.length
            ? [{headline: null, choices: filtered}]
            : [];
    }

    groups.forEach(
        group =>
        {
            const transformed: AusleseTypes.Group = {
                headline: group.headline,
                choices: [],
            };

            group.choices.forEach(
                choice =>
                {
                    let list = (choice.value && selections[choice.value] && "multiple" === type)
                        ? selected
                        : transformed;

                    list.choices.push({
                        ...choice,
                        // Transform the Group into a FlatGroup, which is more memory performant and doesn't
                        // cause us to hold the entire Group with all of its Choices for every Choice in-memory.
                        group: {
                            header: group.header,
                            headline: group.headline,
                        },
                    });
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
    const flattened: AusleseTypes.Choice[] = [];

    groups.forEach(
        group => group.choices.forEach(choice => flattened.push({
            ...choice,
            // Transform the Group into a FlatGroup, which is more memory performant and doesn't
            // cause us to hold the entire Group with all of its Choices for every Choice in-memory.
            group: {
                headline: group.headline,
                header: group.header,
            },
        }))
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

    choices.forEach(flattened =>
    {
        if (!map[flattened.value])
        {
            map[flattened.value] = {};
        }

        // always keep the first one, to keep the relative order
        if (!map[flattened.value][flattened.label])
        {
            map[flattened.value][flattened.label] = flattened;
        }
    });

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


/**
 * @internal
 */
export function generateHierarchicalChoiceTextLabel (choice: AusleseTypes.Choice, includeGroupHeadlineInChoiceLabel: boolean) : string
{
    const group = choice.group;

    if (group && includeGroupHeadlineInChoiceLabel)
    {
        return group.headline
            ? `${group.headline}: ${choice.label}`
            : choice.label;
    }

    return choice.label;
}
