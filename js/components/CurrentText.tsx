import {classes} from "mojave/classes";
import {h} from "preact";
import {AusleseTypes} from "../@types/auslese";
import JSX = preact.createElement.JSX;


interface CurrentTextProps
{
    onClick: EventListener;
    selected: AusleseTypes.Choice[];
    placeholder: string;
}

export function CurrentText (props: CurrentTextProps): JSX.Element
{
    const selection = props.selected;
    const text = selection.length
        ? selection.map(s => s.label).join(", ")
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
