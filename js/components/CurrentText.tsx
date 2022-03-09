import {classes} from "mojave/classes";
import {h, JSX} from "preact";
import {AusleseTypes} from "../@types/auslese";
import {filterDuplicateChoices, generateHierarchicalChoiceTextLabel} from "../lib/helper";


interface CurrentTextProps
{
    onClick: EventListener;
    selected: AusleseTypes.Choice[];
    placeholder: string;
    placeholderLock?: boolean;
    includeGroupHeadlineInSelectedChoiceLabel: boolean;
}

export function CurrentText (props: CurrentTextProps): JSX.Element
{
    const selection = props.selected;
    let text = '';

    if (props.placeholderLock || !selection.length) {
        text = props.placeholder;
    } else {
        text = filterDuplicateChoices(selection).map(choice => generateHierarchicalChoiceTextLabel(choice, props.includeGroupHeadlineInSelectedChoiceLabel)).join(", ");
    }

    return (
        <div
            class={classes({
                "auslese-current": true,
                "auslese-current-text": true,
                "auslese-placeholder": props.placeholderLock || !selection.length,
            })}
            onClick={props.onClick}
        >{text}</div>
    );
}
