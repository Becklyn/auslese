import {h, JSX} from "preact";
import {AusleseTypes} from "../@types/auslese";
import {filterDuplicateChoices, generateHierarchicalChoiceTextLabel} from "../lib/helper";
import {DeleteIcon} from "../lib/icons";

let renderIndex = 0;

export interface CurrentLabelsProps
{
    choices: AusleseTypes.Choice[];
    placeholder: string;
    search: string;
    onInput: (e: Event) => void;
    onRemove: (choice: AusleseTypes.Choice) => void;
    onFocus: () => void;
    inputRef: (element: HTMLInputElement) => void;
    disabled?: boolean;
    includeGroupHeadlineInSelectedChoiceLabel: boolean;
}


export function CurrentLabels (props: CurrentLabelsProps): JSX.Element
{
    const randomId = `auslese-current-tags-input-${++renderIndex}`;

    return (
        <label class="auslese-current auslese-current-tags" for={randomId}>
            {filterDuplicateChoices(props.choices).map(choice => (
                <span class="auslese-tag">
                    <span class="auslese-tag-label">{generateHierarchicalChoiceTextLabel(choice, props.includeGroupHeadlineInSelectedChoiceLabel)}</span>
                    {!choice.disabled && (
                        <button type="button" class="auslese-tag-delete" onClick={() => props.onRemove(choice)}>
                            <DeleteIcon />
                        </button>
                    )}
                </span>
            ))}
            <input
                type="text"
                class="auslese-tags-input"
                value={props.search}
                onInput={props.onInput}
                placeholder={props.placeholder}
                id={randomId}
                onFocus={props.onFocus}
                ref={props.inputRef}
                disabled={props.disabled}
            />
        </label>
    );
}
