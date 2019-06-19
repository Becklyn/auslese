import {Component, h} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {CurrentLabels} from "./components/CurrentLabels";
import {CurrentText} from "./components/CurrentText";
import {Group} from "./components/Group";
import {
    buildRenderGroups,
    flattenChoices,
    isChildElement,
    sanitizeGroups,
} from "./lib/helper";
import {ChevronIcon, LoadingIcon, SearchIcon} from "./lib/icons";


export interface AusleseProps
{
    choices: (AusleseTypes.Group | AusleseTypes.Choice)[];
    type?: AusleseTypes.SelectionType;
    selections?: WeakMap<AusleseTypes.Choice, boolean>;
    onChange?: (selection: AusleseTypes.SelectedChoice[]) => void;
    placeholder?: string;
    emptyResultsMessage?: string;
    resetText?: string;
}


export interface AusleseState
{
    groups: AusleseTypes.Group[];
    type: AusleseTypes.SelectionType;
    open: boolean;
    search: string;
    selection: WeakMap<AusleseTypes.Choice, boolean>
    loading: boolean;
    focus: AusleseTypes.Choice | null;
}


export class Auslese extends Component<AusleseProps, AusleseState>
{
    private inlineSearch: HTMLElement | undefined;


    private onBodyClickBound: (event: Event) => void;


    /**
     * @inheritDoc
     */
    public constructor (props: Readonly<AusleseProps>)
    {
        super(props);
        this.state = this.initState(props);
        this.onBodyClickBound = event => this.onBodyClick(event);
    }


    /**
     * @inheritDoc
     */
    public componentWillReceiveProps (nextProps: Readonly<AusleseProps>): void
    {
        this.setState(this.initState(nextProps));
    }


    /**
     * Generates the internal state
     */
    private initState (props: Readonly<AusleseProps>): AusleseState
    {
        return {
            groups: sanitizeGroups(props.choices),
            selection: props.selections || new WeakMap<AusleseTypes.Choice, boolean>(),
            open: false,
            search: "",
            type: props.type || "single",
            loading: false,
            focus: null,
        };
    }


    /**
     * @inheritDoc
     */
    public render (props: AusleseProps, state: AusleseState): preact.ComponentChild
    {
        let {groups, selection, type} = state;

        if (!state.groups.length)
        {
            return null;
        }

        // Prepare basic data
        let flattenedChoices = flattenChoices(groups);
        let selectedChoices = flattenedChoices.filter(choice => selection.get(choice));
        let searchQuery = state.search.trim();
        let renderGroups = buildRenderGroups(groups, selection, type, searchQuery);
        let placeholder = props.placeholder || "Bitte wählen";
        let isClearable = selectedChoices.some(choice => !choice.disabled);
        let hasSearchForm = "tags" !== type && flattenedChoices.length > 5;


        let windowContent: preact.ComponentChildren;
        // if has search and no matches
        if ("" !== searchQuery && !renderGroups.length)
        {
            windowContent =
                <div class="auslese-message">{props.emptyResultsMessage || "Keine passenden Einträge gefunden."}</div>;
        }
        else
        {
            windowContent = renderGroups.map(group => (
                <Group
                    group={group}
                    selections={selection}
                    onToggle={choice => this.toggleChoice(choice)}
                    onFocus={choice => this.focusChoice(choice)}
                    focus={state.focus}
                />
            ));
        }

        return <div
            class={`auslese auslese-${type}-select ${state.open && "auslese-open"}`}
            onKeyDown={e => this.onKeyDown(e, renderGroups)}
        >
            <div class="auslese-opener">
                {"tags" === type ? (
                    <CurrentLabels
                        choices={selectedChoices}
                        placeholder={placeholder}
                        search={state.search}
                        onInput={event => this.onInput(event)}
                        onRemove={choice => this.toggleChoice(choice)}
                        onFocus={() => this.open()}
                    />
                ) : (
                    <CurrentText
                        onClick={() => this.toggleOpen()}
                        placeholder={placeholder}
                        selected={selectedChoices}
                    />
                )}
                <button type="button" class="auslese-current-chevron" onClick={() => this.toggleOpen()}>
                    <ChevronIcon/>
                </button>
            </div>
            {state.open && (
                <div class="auslese-dropdown">
                    {isClearable && (
                        <div class="auslese-clear">
                            <button
                                class="auslese-clear-button"
                                onClick={() => this.reset()}
                            >
                                {props.resetText || "Auswahl zurücksetzen"}
                            </button>
                        </div>
                    )}
                    {hasSearchForm && (
                        <div class="auslese-search">
                            <label class="auslese-search-widget">
                                <SearchIcon/>
                                <input
                                    type="text"
                                    class="auslese-search-input"
                                    placeholder={placeholder}
                                    value={state.search}
                                    onInput={event => this.onInput(event)}
                                    ref={element => this.inlineSearch = element}
                                />
                            </label>
                        </div>
                    )}
                    <div class="auslese-window">
                        {windowContent}
                    </div>
                    {this.state.loading && (
                        <div class="auslese-loading">
                            <LoadingIcon/>
                        </div>
                    )}
                </div>
            )}
        </div>;
    }


    /**
     * Opens the dropdown
     */
    private open (): void
    {
        if (this.state.open)
        {
            return;
        }

        document.body.addEventListener("click", this.onBodyClickBound, false);
        this.setState(
            {open: true},
            () => {
                if (this.inlineSearch)
                {
                    this.inlineSearch.focus();
                }
            },
        );
    }


    /**
     * Closes the dropdown
     */
    private close (): void
    {
        if (!this.state.open)
        {
            return;
        }

        document.body.removeEventListener("click", this.onBodyClickBound, false);
        this.setState({
            open: false,
            search: "",
            focus: null,
        });
    }


    /**
     *
     */
    private reset (): void
    {
        this.setState({
                selection: this.clearSelection(),
            }, () => this.emitUpdate(),
        );
    }


    /**
     * Creates a cleared selection element, that only contains the always selected elements
     */
    private clearSelection (): WeakMap<AusleseTypes.Choice, boolean>
    {
        let newSelections = new WeakMap<AusleseTypes.Choice, boolean>();
        let {groups, type, selection} = this.state;

        if ("single" !== type)
        {
            flattenChoices(groups).forEach(
                choice =>
                {
                    if (selection.get(choice) && choice.disabled)
                    {
                        newSelections.set(choice, true);
                    }
                },
            );
        }

        return newSelections;
    }


    /**
     * Toggles the given choice
     */
    private toggleChoice (choice: AusleseTypes.Choice): void
    {
        if (choice.disabled)
        {
            return;
        }

        this.setState(
            state =>
            {
                let selection = state.selection;

                if ("single" === state.type)
                {
                    selection = this.clearSelection();
                    selection.set(choice, true);
                }
                else
                {
                    selection.set(choice, !selection.get(choice));
                }

                return {selection};
            },
            () => this.emitUpdate(),
        );
    }


    /**
     * Emits an update
     */
    private emitUpdate ()
    {
        if (this.props.onChange)
        {
            let update = this.getSelected().map(
                choice =>
                {
                    return {
                        choice: choice,
                        toggle: !choice.disabled
                            ? () => this.toggleChoice(choice)
                            : undefined,
                    };
                },
            );

            this.props.onChange(update);
        }
    }


    /**
     * Toggles the dropdown
     */
    private toggleOpen ()
    {
        if (this.state.open)
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
    private onBodyClick (event)
    {
        if (!isChildElement(this.base as Element, event.target))
        {
            this.close();
        }
    }


    /**
     * Handler for when the input changes
     */
    private onInput (event)
    {
        this.setState({
            search: (event.target as HTMLInputElement).value,
            open: true,
        });
    }


    /**
     * Focuses the given element
     */
    private focusChoice (focus: AusleseTypes.Choice | null): void
    {
        this.setState({focus});
    }


    /**
     * Moves the choice focus in the given direction
     */
    private moveChoiceFocus (renderGroups: AusleseTypes.Group[], up: boolean): void
    {
        let list = flattenChoices(renderGroups).filter(choice => !choice.disabled);
        let first = list[0] || null;
        this.open();

        if (null === this.state.focus)
        {
            return this.focusChoice(up ? null : first);
        }

        let index = list.indexOf(this.state.focus);

        if (-1 === index)
        {
            return this.focusChoice(first);
        }

        let newIndex = index + (up ? -1 : 1);

        if (newIndex < 0)
        {
            this.close();
        }
        else if (newIndex < list.length)
        {
            return this.focusChoice(list[newIndex]);
        }

        // do nothing if we are at the end and press down
    }


    /**
     * Global callback for key down
     */
    private onKeyDown (event: KeyboardEvent, renderGroups: AusleseTypes.Group[]): void
    {
        let handled = false;
        let key = event.key.toLowerCase();

        switch (key)
        {
            case " ":
                if (this.state.focus !== null)
                {
                    this.moveChoiceFocus(renderGroups, false);
                    this.toggleChoice(this.state.focus);
                }
                break;

            case "tab":
            case "escape":
                this.close();
                break;

            case "arrowdown":
            case "arrowup":
                this.moveChoiceFocus(renderGroups, "arrowup" === key);
                break;
        }

        if (handled)
        {
            event.preventDefault();
        }
    }


    /**
     * Returns the selected choices
     */
    private getSelected (): AusleseTypes.Choice[]
    {
        return this.getChoices().filter(choice => this.state.selection.get(choice));
    }


    /**
     * Returns the choices
     */
    private getChoices (): AusleseTypes.Choice[]
    {
        let flattened: AusleseTypes.Choice[] = [];

        this.state.groups.forEach(
            group => group.choices.forEach(c => flattened.push(c)),
        );

        return flattened;
    }
}
