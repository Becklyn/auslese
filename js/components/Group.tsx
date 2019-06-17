import {Component, h, render} from "preact";
import {AusleseTypes} from "../@types/auslese";
import {CheckIcon} from "../lib/icons";
import JSX = preact.createElement.JSX;


export interface GroupProps
{
    choices: AusleseTypes.Choice[];
    headline?: string|null;
    selections: WeakMap<AusleseTypes.Choice, boolean>;
    onToggle: (choice: AusleseTypes.Choice) => void;
    wrapClass?: string;

    // selection state:
    // true      -> only selected
    // false     -> only unselected
    // undefined -> all
    selectionState?: boolean;
}


export function Group (props: GroupProps): JSX.Element|null
{
    let choices = props.choices;

    if (undefined !== props.selectionState)
    {
        choices = choices.filter(c => props.selectionState === !!props.selections.get(c));
    }

    if (!choices.length)
    {
        return null;
    }

    return (
        <div class={`auslese-group ${props.wrapClass || ""}`}>
            {props.headline && (
                <h4 class="auslese-group-title">{props.headline}</h4>
            )}
            <ul>
                {choices.map(choice => (
                    <li class={`auslese-choice ${props.selections.get(choice) ? "auslese-selected" : ""}`}>
                        <button
                            type="button"
                            class="auslese-choice-button"
                            disabled={choice.disabled}
                            onClick={!choice.disabled ? (() => props.onToggle(choice)) : undefined}
                        >
                            <i class="auslese-check">
                                {props.selections.get(choice) && (
                                    <CheckIcon />
                                )}
                            </i>
                            {choice.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
