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
