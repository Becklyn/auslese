import {classes} from "mojave/classes";
import {h} from "preact";
import {JSXInternal} from "preact/src/jsx";
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
    onMouseEnter: () => void;
    multiple: boolean;
}



export function Choice (props: ChoiceProps): JSX.Element
{
    let onToggle: EventHandler<Event>|undefined;
    let onMouseEnter: EventHandler<Event>|undefined;

    if (!props.disabled)
    {
        onToggle = (event: Event) =>
        {
            event.stopPropagation();
            props.onToggle();
        };

        onMouseEnter = (event: Event) =>
        {
            event.stopPropagation();
            props.onMouseEnter();
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
                onMouseEnter={onMouseEnter}
            >
                <i class={`auslese-check ${props.multiple ? "auslese-check-multiple" : "auslese-check-single"}`}>
                    {props.selected && (
                        <CheckIcon/>
                    )}
                </i>
                {props.label}
            </button>
        </li>
    );
}
