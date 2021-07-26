import {classes} from "mojave/classes";
import {h, JSX} from "preact";
import {AusleseTypes} from "../@types/auslese";
import {filterDuplicateChoices, generateHierarchicalChoiceTextLabel} from "../lib/helper";


interface CurrentTextProps
{
    onClick: EventListener;
    selected: AusleseTypes.Choice[];
    placeholder: string;
    includeGroupHeadlineInSelectedChoiceLabel: boolean;
}

export function CurrentText (props: CurrentTextProps): JSX.Element
{
    const selection = props.selected;
    const text = selection.length
        ? filterDuplicateChoices(selection).map(choice => generateHierarchicalChoiceTextLabel(choice, props.includeGroupHeadlineInSelectedChoiceLabel)).join(", ")
        : props.placeholder;

    return (
        <div
            class={classes({
                "auslese-current": true,
                "auslese-current-text": true,
                "auslese-placeholder": !selection.length,
            })}
            onClick={props.onClick}
        >{text}</div>
    );
}
