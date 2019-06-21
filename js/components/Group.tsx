import {classes} from "mojave/classes";
import {h} from "preact";
import {AusleseTypes} from "../@types/auslese";
import {Choice} from "./Choice";
import JSX = preact.createElement.JSX;



export interface GroupProps
{
    group: AusleseTypes.Group;
    selections: WeakMap<AusleseTypes.Choice, boolean>;
    onToggle: (choice: AusleseTypes.Choice) => void;
    onFocus: (choice: AusleseTypes.Choice) => void;
    focus: AusleseTypes.Choice|null;
    multiple: boolean;
}



export function Group (props: GroupProps): JSX.Element|null
{
    let group = props.group;

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
                        selected={!!props.selections.get(choice)}
                        disabled={!!choice.disabled}
                        focus={props.focus === choice}
                        onToggle={() => props.onToggle(choice)}
                        onFocus={() => props.onFocus(choice)}
                        multiple={props.multiple}
                    />
                ))}
            </ul>
        </div>
    );
}
