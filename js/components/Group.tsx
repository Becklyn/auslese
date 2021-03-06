import {classes} from "mojave/classes";
import {h} from "preact";
import {AusleseTypes} from "../@types/auslese";
import {Choice} from "./Choice";
import JSX = preact.createElement.JSX;



export interface GroupProps
{
    group: AusleseTypes.Group;
    selection: AusleseTypes.Selection;
    onToggle: (choice: AusleseTypes.Choice) => void;
    onMouseEnter: (choice: AusleseTypes.Choice) => void;
    focus: AusleseTypes.Choice|null;
    multiple: boolean;
}



export function Group (props: GroupProps): JSX.Element|null
{
    const group = props.group;

    if (!group.choices.length)
    {
        return null;
    }

    return (
        <div
            class={classes({
                "auslese-group": true,
                "auslese-header-group": !!group.header,
            })}
        >
            {group.headline && (
                <h4 class="auslese-group-title">{group.headline}</h4>
            )}
            <ul>
                {group.choices.map(choice => (
                    <Choice
                        label={choice.label}
                        selected={props.selection[choice.value]}
                        disabled={!!choice.disabled}
                        focus={props.focus === choice}
                        onToggle={() => props.onToggle(choice)}
                        onMouseEnter={() => props.onMouseEnter(choice)}
                        multiple={props.multiple}
                    />
                ))}
            </ul>
        </div>
    );
}
