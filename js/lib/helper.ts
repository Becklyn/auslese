import {AusleseTypes} from "../@types/auslese";


/**
 * Filters all selected choices from the set of all choices
 */
export function getSelectedChoices (groups: AusleseTypes.ChoiceGroup[], selections: AusleseTypes.Selections) : AusleseTypes.Choice[]
{
    let selected: AusleseTypes.Choice[] = [];

    groups.forEach(
        (group: AusleseTypes.ChoiceGroup) => {
            group.choices.forEach(
                choice => {
                    if (selections.get(choice))
                    {
                        selected.push(choice);
                    }
                }
            );
        }
    );

    return selected;
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
