import {h} from "preact";
import {AusleseTypes} from "../@types/auslese";
import {Choice} from "./Choice";
import JSX = preact.createElement.JSX;



export interface GroupProps
{
    choices: AusleseTypes.Choice[];
    headline?: string|null;
    selections: WeakMap<AusleseTypes.Choice, boolean>;
    onToggle: (choice: AusleseTypes.Choice) => void;
    onFocus: (choice: AusleseTypes.Choice) => void;
    wrapClass?: string;
    focus: AusleseTypes.Choice|null;

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
                    <Choice
                        label={choice.label}
                        selected={!!props.selections.get(choice)}
                        disabled={!!choice.disabled}
                        focus={props.focus === choice}
                        onToggle={() => props.onToggle(choice)}
                        onFocus={() => props.onFocus(choice)}
                    />
                ))}
            </ul>
        </div>
    );
}
