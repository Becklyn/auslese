import {Component, h} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {getSelectedChoices} from "./lib/helper";
import {CheckIcon, ChevronIcon} from "./lib/icons";
import Downshift from "downshift/preact";

export interface ControlledAusleseProps
{
    placeholder?: string;
    open: boolean;
    multiple?: boolean;
    selections?: AusleseTypes.Selections;
    groups: AusleseTypes.ChoiceGroup[];
    onButtonClick?: () => void;
    onElementClick?: (choice: AusleseTypes.Choice) => void;
}


export class ControlledAuslese extends Component<ControlledAusleseProps>
{
    /**
     * @inheritDoc
     */
    public render (props: Readonly<ControlledAusleseProps>): preact.ComponentChild
    {
        let containerClass = `auslese ${props.multiple ? "is-multi-select" : "is-single-select"} ${props.open ? "is-open" : ""}`;
        let selections = props.selections || new WeakMap<AusleseTypes.Choice, boolean>();

        return (
            <Downshift
                onChange={selection => console.log(selection)}
                itemToString={item => item ? item.label : ""}
            >{
                ({
                    getInputProps,
                    getToggleButtonProps,
                    getMenuProps,
                }) => (
                    <div class={containerClass}>
                        <button type="button" class="auslese-opener" onClick={props.onButtonClick}>
                            {this.renderCurrentLabel(props.groups, selections, props.placeholder)}
                            <span className="auslese-current-chevron">
                            <ChevronIcon/>
                        </span>
                        </button>
                        {props.open ? this.renderDropdown(props.groups, selections) : null}
                    </div>
                )
            }
            </Downshift>
        );
    }


    /**
     * Renders the label for the current element
     */
    private renderCurrentLabel (groups: AusleseTypes.ChoiceGroup[], selections: AusleseTypes.Selections, placeholder?: string) : preact.ComponentChild
    {
        let selected = getSelectedChoices(groups, selections);

        return (
            <span class={`auslese-current ${selected.length === 0 ? "is-placeholder" : ""}`}>
                {selected.length > 0
                    ? selected.map(c => c.label).join(", ")
                    : (placeholder || "Please choose")
                }
            </span>
        );
    }

    /**
     * Renders the complete dropdown
     */
    private renderDropdown (groups: AusleseTypes.ChoiceGroup[], selections: AusleseTypes.Selections): preact.ComponentChild
    {
        return (
            <div class="auslese-dropdown-container">
                <div className="auslese-dropdown">
                    <div className="auslese-dropdown-window">
                        {groups.map(group => this.renderGroup(group, selections))}
                    </div>
                </div>
            </div>
        );
    }


    /**
     * Renders a single choice group
     */
    private renderGroup (group: AusleseTypes.ChoiceGroup, selections: AusleseTypes.Selections): preact.ComponentChild
    {
        if (!group.choices.length)
        {
            return null;
        }

        return (
            <div class="auslese-choice-group">
                {group.headline && (
                    <h4 class="auslese-group-title">{group.headline}</h4>
                )}
                <ul>
                    {group.choices.map(choice => (
                        <li class={`auslese-choice ${selections.get(choice) ? "is-selected" : ""}`}>
                            <button
                                type="button"
                                class="auslese-choice-button"
                                disabled={choice.disabled}
                                onClick={!choice.disabled  ? () => this.onElementClick(choice) : undefined}
                            >
                                <i class="auslese-check">{selections.get(choice) && <CheckIcon />}</i>
                                {choice.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }


    /**
     * Callback on element click
     */
    private onElementClick (choice: AusleseTypes.Choice) : void
    {
        if (this.props.onElementClick)
        {
            this.props.onElementClick(choice);
        }
    }
}
