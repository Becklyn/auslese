import {trigger} from "mojave/dom/events";
import {Component, h, render} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {CurrentLabels} from "./components/CurrentLabels";
import {CurrentText} from "./components/CurrentText";
import {Dropdown} from "./components/Dropdown";
import {Group} from "./components/Group";
import {
    buildRenderGroups,
    flattenChoices,
    isChildElement,
} from "./lib/helper";
import {ChevronIcon} from "./lib/icons";


export interface AusleseProps
{
    choices: AusleseTypes.Group[];
    type?: AusleseTypes.SelectionType;
    onChange?: (selection: Readonly<AusleseTypes.Selection>) => void;
    dropdownHolder?: HTMLElement;
    dropdownClass?: string|null;
    class?: string|null;
    placeholder?: string;
    emptyResultsMessage?: string;
    emptyMessage?: string;
    resetText?: string;
    selection?: AusleseTypes.Selection;
}


export interface AusleseState
{
    choices: AusleseTypes.Group[];
    flattened: AusleseTypes.Choice[];
    type: AusleseTypes.SelectionType;
    dropdown: HTMLElement|null;
    search: string;
    selection: AusleseTypes.Selection;
    loading: boolean;
    focus: AusleseTypes.Choice | null;
}


export class Auslese extends Component<AusleseProps, AusleseState>
{
    private onBodyClickBound: (event: Event) => void;
    private dropdownHolder: Element;
    private labelInput: HTMLInputElement|undefined;


    /**
     * @inheritDoc
     */
    public constructor (props: Readonly<AusleseProps>)
    {
        super(props);
        this.dropdownHolder = props.dropdownHolder || document.body;
        this.state = Auslese.initState(props);
        this.onBodyClickBound = event => this.onBodyClick(event);
    }


    /**
     * @inheritDoc
     */
    public static getDerivedStateFromProps (props: Readonly<AusleseProps>, state: Readonly<AusleseState>): Partial<AusleseState>|null
    {
        // reset if the choices have changed
        if (props.choices !== state.choices)
        {
            // if there is an open dropdown -> close it
            // setting the state to `null` happens in `initState()` and removing the event listener will happen on the next click
            if (state.dropdown)
            {
                Auslese.removeDropdown(state.dropdown);
            }

            return Auslese.initState(props);
        }

        return null;
    }


    /**
     * Generates the internal state
     */
    private static initState (props: Readonly<AusleseProps>): AusleseState
    {
        return {
            choices: props.choices,
            flattened: flattenChoices(props.choices),
            selection: props.selection || {},
            dropdown: null,
            search: "",
            type: props.type || "single",
            loading: false,
            focus: null,
        };
    }


    /**
     * @inheritDoc
     */
    public componentDidUpdate (): void
    {
        if (this.labelInput && this.state.dropdown)
        {
            this.labelInput.focus();
        }
    }


    /**
     * @inheritDoc
     */
    public render (props: AusleseProps, state: AusleseState): preact.ComponentChild
    {
        const {choices, flattened, selection, type} = state;

        // Prepare basic data
        const selectedChoices = flattened.filter(choice => selection[choice.value]);
        const searchQuery = state.search.trim();
        const renderGroups = buildRenderGroups(choices, selection, type, searchQuery);
        const placeholder = props.placeholder || "Bitte wählen";
        const isClearable = selectedChoices.some(choice => !choice.disabled);
        const hasSearchForm = "tags" !== type && flattened.length > 5;
        // you can reset the form if it is either multi select or if there is a placeholder
        const canClear = "single" !== type || !!props.placeholder;

        let dropdownContent: preact.ComponentChildren;

        // if has search and no matches
        if (!renderGroups.length)
        {
            const message = ("" !== searchQuery)
                ? (props.emptyResultsMessage || "Keine passenden Einträge gefunden.")
                : (props.emptyMessage || "Keine Einträge vorhanden.");
            dropdownContent = <div class="auslese-message">{message}</div>;
        }
        else
        {
            dropdownContent = renderGroups.map(group => (
                <Group
                    group={group}
                    selection={selection}
                    onToggle={choice => this.toggleChoice(choice)}
                    onMouseEnter={choice => this.focusChoice(choice, false)}
                    focus={state.focus}
                    multiple={"single" !== type}
                />
            ));
        }

        if (state.dropdown)
        {
            render((
                    <Dropdown
                        isClearable={canClear && isClearable}
                        resetText={props.resetText || "Auswahl zurücksetzen"}
                        search={state.search}
                        placeholder={placeholder}
                        hasSearchForm={hasSearchForm}
                        onReset={event => this.reset(event)}
                        loading={state.loading}
                        onInput={event => this.onInput(event)}
                        outerRef={this.base as HTMLElement}
                        overlay={state.dropdown}
                        onKeyDown={event => this.onKeyDown(event, renderGroups)}
                        class={props.dropdownClass}
                    >
                        {dropdownContent}
                    </Dropdown>
                ),
                state.dropdown
            );
        }

        return <div
            class={`auslese auslese-${type}-select ${state.dropdown ? "auslese-open" : ""} ${props.class || ""}`}
            onKeyDown={e => this.onKeyDown(e, renderGroups)}
        >
            {"tags" === type ? (
                <CurrentLabels
                    choices={selectedChoices}
                    placeholder={placeholder}
                    search={state.search}
                    onInput={event => this.onInput(event)}
                    onRemove={choice => this.toggleChoice(choice)}
                    onFocus={() => this.open()}
                    inputRef={element => this.labelInput = element}
                />
            ) : (
                <CurrentText
                    onClick={event => this.toggleOpen(event)}
                    placeholder={placeholder}
                    selected={selectedChoices}
                />
            )}
            <button type="button" class="auslese-current-chevron" onClick={event => this.toggleOpen(event)}>
                <ChevronIcon/>
            </button>
        </div>;
    }


    /**
     * Opens the dropdown
     */
    private open (): void
    {
        if (this.state.dropdown)
        {
            return;
        }

        // be sure to clean up the event listener, to not have it multiple times
        document.body.removeEventListener("click", this.onBodyClickBound, false);

        const dropdown = document.createElement("div");
        dropdown.setAttribute("class", "auslese-overlay");
        this.dropdownHolder.appendChild(dropdown);

        document.body.addEventListener("click", this.onBodyClickBound, false);
        this.setState({dropdown});
    }


    /**
     * Closes the dropdown
     */
    private close (): void
    {
        if (!this.state.dropdown)
        {
            return;
        }

        Auslese.removeDropdown(this.state.dropdown);
        document.body.removeEventListener("click", this.onBodyClickBound, false);
        this.setState({
            dropdown: null,
            search: "",
            focus: null,
        });
    }


    /**
     * Removes the rendered dropdown from the DOM
     */
    private static removeDropdown (dropdown: HTMLElement) : void
    {
        render(null, dropdown);
        (dropdown.parentNode as Element).removeChild(dropdown);
    }


    /**
     *
     */
    private reset (event: Event): void
    {
        event.stopPropagation();

        this.setState(
            {selection: this.createEmptySelection()},
            () => this.emitUpdate()
        );
    }

    private createEmptySelection (): AusleseTypes.Selection
    {
        const empty: AusleseTypes.Selection = {};
        const {flattened, selection} = this.state;

        flattened.forEach(choice => {
            // keep disabled selected choices
            if (choice.disabled && selection[choice.value])
            {
                empty[choice.value] = true;
            }
        });

        return empty;
    }


    /**
     * Toggles the given choice
     */
    private toggleChoice (choice: AusleseTypes.Choice): void
    {
        const value = choice.value;

        if (choice.disabled)
        {
            return;
        }

        const isSingle = ("single" === this.state.type);

        this.setState(
            state =>
            {
                const old = state.selection;
                const newSelection: AusleseTypes.Selection = this.createEmptySelection();

                if (isSingle)
                {
                    // single -> just always enable this option
                    newSelection[value] = true;
                }
                else
                {
                    // multiple -> copy all true values except the on changed
                    for (const key in old)
                    {
                        if (key !== value && old[key])
                        {
                            newSelection[key] = true;
                        }
                    }

                    // set the new key, if it wasn't active before (to toggle it)
                    if (!old[value])
                    {
                        newSelection[value] = true;
                    }
                }

                return {
                    selection: newSelection,
                    search: "",
                    focus: null,
                };
            },
            () =>
            {
                this.emitUpdate();

                if (isSingle)
                {
                    this.close();
                }
            },
        );
    }


    /**
     * Emits an update
     */
    private emitUpdate ()
    {
        if (this.props.onChange)
        {

            this.props.onChange(this.state.selection);
        }
    }


    /**
     * Toggles the dropdown
     */
    private toggleOpen (event?: Event)
    {
        if (event)
        {
            event.preventDefault();
        }

        if (this.state.dropdown)
        {
            this.close();
        }
        else
        {
            this.open();
        }
    }


    /**
     * Callback on when the body was clicked
     */
    private onBodyClick (event: Event): void
    {
        if (!this.state.dropdown)
        {
            // if a props change closed the popup, the event listener is still registered.
            // so if we end up here, this is probably the case. Be sure to now really remove the listener
            document.body.removeEventListener("click", this.onBodyClickBound, false);
            return;
        }

        const base = this.base as Element;
        const target = event.target as Element;

        if (!isChildElement(base, target) && !isChildElement(this.state.dropdown, target))
        {
            this.close();
        }
    }


    /**
     * Handler for when the input changes
     */
    private onInput (event: Event): void
    {
        this.setState({
            search: (event.target as HTMLInputElement).value,
        }, () => this.open());
    }


    /**
     * Focuses the given element
     */
    private focusChoice (focus: AusleseTypes.Choice | null, scrollTo: boolean = false): void
    {
        this.setState({focus}, () => {
            if (scrollTo && this.state.dropdown)
            {
                trigger(this.state.dropdown, "auslese:scroll-to-focus");
            }
        });
    }


    /**
     * Moves the choice focus in the given direction
     */
    private moveChoiceFocus (renderGroups: AusleseTypes.Group[], up: boolean): void
    {
        const list = flattenChoices(renderGroups).filter(choice => !choice.disabled);
        const first = list[0] || null;
        this.open();

        if (null === this.state.focus)
        {
            return this.focusChoice(first, true);
        }

        const index = list.indexOf(this.state.focus);

        if (-1 === index)
        {
            return this.focusChoice(first, true);
        }

        const newIndex = index + (up ? -1 : 1);

        if (newIndex < 0)
        {
            this.close();
        }
        else if (newIndex < list.length)
        {
            return this.focusChoice(list[newIndex], true);
        }

        // do nothing if we are at the end and press down
    }


    /**
     * Global callback for key down
     */
    private onKeyDown (event: KeyboardEvent, renderGroups: AusleseTypes.Group[]): void
    {
        const key = event.key.toLowerCase();

        switch (key)
        {
            case " ":
            case "enter":
                if (this.state.focus !== null)
                {
                    this.toggleChoice(this.state.focus);

                    // we need to move the focus, as the element will disappear
                    if ("multiple" === this.state.type)
                    {
                        this.moveChoiceFocus(renderGroups, false);
                    }

                    event.preventDefault();
                }
                break;

            case "tab":
            case "escape":
                this.close();
                break;

            case "arrowdown":
            case "arrowup":
                this.moveChoiceFocus(renderGroups, "arrowup" === key);
                event.preventDefault();
                break;
        }
    }
}
