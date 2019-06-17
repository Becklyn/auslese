import {AusleseTypes} from "../@types/auslese";


/**
 * Filters all selected choices from the set of all choices
 */
export function getSelectedChoices (groups: AusleseTypes.Group[], selections: AusleseTypes.Selections) : AusleseTypes.Choice[]
{
    return flattenChoices(groups).filter(
    choice => selections.get(choice)
    );
}

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
export function prepareGroups (unsorted: (AusleseTypes.Choice|AusleseTypes.Group)[]) : AusleseTypes.Group[]
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
                }

                groups.push(entry as AusleseTypes.Group);
                lastGroup = null;
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
