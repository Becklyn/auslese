import {h} from "preact";
import {JSXInternal} from "preact/src/jsx";
import {classes} from "../lib/helper";
import {CheckIcon} from "../lib/icons";
import JSX = preact.h.JSX;
import EventHandler = JSXInternal.EventHandler;


export interface ChoiceProps
{
    label: string;
    selected: boolean;
    disabled: boolean;
    focus: boolean;
    onToggle: () => void;
    onFocus: () => void;
}



export function Choice (props: ChoiceProps): JSX.Element
{
    let onToggle: EventHandler<Event>|undefined;
    let onFocus: EventHandler<Event>|undefined;

    if (!props.disabled)
    {
        onToggle = (event: Event) =>
        {
            event.stopPropagation();
            props.onToggle();
        };

        onFocus = (event: Event) =>
        {
            event.stopPropagation();
            props.onFocus();
        };
    }

    return (
        <li class={`auslese-choice ${props.selected ? "auslese-selected" : ""}`}>
            <button
                type="button"
                class={classes({
                    "auslese-choice-button": true,
                    "auslese-focus": props.focus,
                })}
                disabled={props.disabled}
                onClick={onToggle}
                onMouseEnter={onFocus}
            >
                <i class="auslese-check">
                    {props.selected && (
                        <CheckIcon/>
                    )}
                </i>
                {props.label}
            </button>
        </li>
    );
}
