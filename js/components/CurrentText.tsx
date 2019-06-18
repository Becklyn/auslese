import {classes} from "mojave/classes";
import {h} from "preact";
import {AusleseState} from "../Auslese";
import {getSelectedChoices} from "../lib/helper";
import JSX = preact.createElement.JSX;


interface CurrentTextProps
{
    onClick: () => void;
    data: AusleseState;
}

export function CurrentText (props: CurrentTextProps): JSX.Element
{
    let selection = getSelectedChoices(props.data.flattened, props.data.selections);
    let text = selection.length
        ? selection.map(s => s.label).join(", ")
        : props.data.placeholder;

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
