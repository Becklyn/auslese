import {classes} from "mojave/classes";
import {h} from "preact";
import {CheckIcon} from "../lib/icons";
import JSX = preact.h.JSX;

type SimpleEventHandler = (event: Event) => void;

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
    let onToggle: SimpleEventHandler|undefined;
    let onMouseEnter: SimpleEventHandler|undefined;

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
