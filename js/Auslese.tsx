import {Component, h} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {CurrentLabels} from "./components/CurrentLabels";
import {CurrentText} from "./components/CurrentText";
import {Group} from "./components/Group";
import {
    buildRenderGroups,
    flattenChoices,
    focusableList,
    getSelectedChoices,
    isChildElement,
    sanitizeGroups,
} from "./lib/helper";
import {ChevronIcon, LoadingIcon, SearchIcon} from "./lib/icons";

export interface AusleseProps
{
    choices: (AusleseTypes.Group|AusleseTypes.Choice)[];
    type?: AusleseTypes.SelectionType;
    placeholder?: string;
    emptyResultsMessage?: string;
    selections?: WeakMap<AusleseTypes.Choice, boolean>;
}


export interface AusleseState
{
    groups: AusleseTypes.Group[];
    flattened: AusleseTypes.Choice[];
    open: boolean;
    search: string;
    type: AusleseTypes.SelectionType;
    placeholder: string;
    selections: WeakMap<AusleseTypes.Choice, boolean>;
    loading: boolean;
    hasSearchForm: boolean;
    focus: AusleseTypes.Choice|null;
}


export class Auslese extends Component<AusleseProps, AusleseState>
{
    private inlineSearch: HTMLElement|undefined;
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
    public componentWillReceiveProps (nextProps: Readonly<AusleseProps>, nextContext: any): void
    {
        this.setState(this.initState(nextProps));
    }


    /**
     * Generates the internal state
     */
    private initState (props: Readonly<AusleseProps>) : AusleseState
    {
        let groups = sanitizeGroups(props.choices);
        let flattened = flattenChoices(groups);
        let type = props.type || "single";
        let selections = props.selections || new WeakMap<AusleseTypes.Choice, boolean>();

        return {
            groups: groups,
            flattened: flattened,
            open: false,
            search: "",
            type: type,
            placeholder: props.placeholder || "Bitte wählen",
            selections: selections,
            loading: false,
            hasSearchForm: "tag" !== type && flattened.length > 5,
            focus: null,
        };
    }


    /**
     * @inheritDoc
     */
    public render (props: AusleseProps, state: AusleseState): preact.ComponentChild
    {
        if (!state.groups.length)
        {
            return null;
        }

        let windowContent: preact.ComponentChildren;
        let selectedChoices = getSelectedChoices(this.state.flattened, this.state.selections);
        let searchQuery = state.search.trim();
        let renderGroups = buildRenderGroups(
            state.groups,
            state.selections,
            state.type,
            searchQuery
        );


        // if has search and no matches
        if ("" !== searchQuery && !renderGroups.length)
        {
            windowContent = <div class="auslese-message">{props.emptyResultsMessage || "Keine passenden Einträge gefunden."}</div>;
        }
        else
        {
            windowContent = renderGroups.map(group => (
                <Group
                    choices={group.choices}
                    headline={group.headline}
                    selections={this.state.selections}
                    onToggle={choice => this.toggleChoice(choice)}
                    onFocus={choice => this.focusChoice(choice)}
                    focus={state.focus}
                />
            ));
        }

        return <div
            class={`auslese auslese-${state.type}-select ${state.open && "auslese-open"}`}
            onKeyDown={e => this.onKeyDown(e)}
        >
            <div class="auslese-opener">
                {"tag" === state.type ? (
                    <CurrentLabels
                        choices={selectedChoices}
                        placeholder={state.placeholder}
                        search={state.search}
                        onInput={e => this.onInput(e)}
                        onRemove={choice => this.toggleChoice(choice)}
                        onFocus={() => this.open()}
                    />
                ) : (
                    <CurrentText
                        onClick={() => this.toggleOpen()}
                        data={this.state}
                    />
                )}
                <button type="button" class="auslese-current-chevron" onClick={() => this.toggleOpen()}>
                    <ChevronIcon />
                </button>
            </div>
            {state.open && (
                <div class="auslese-dropdown">
                    {selectedChoices.length > 0 && (
                        <div class="auslese-clear">
                            <button
                                class="auslese-clear-button"
                                onClick={() => this.setState({selections: new WeakMap<AusleseTypes.Choice, boolean>()})}
                            >
                                Auswahl zurücksetzen
                            </button>
                        </div>
                    )}
                    {state.hasSearchForm && (
                        <div class="auslese-search">
                            <label class="auslese-search-widget">
                                <SearchIcon />
                                <input
                                    type="text"
                                    class="auslese-search-input"
                                    placeholder={state.placeholder}
                                    value={state.search}
                                    onInput={e => this.onInput(e)}
                                    ref={e => this.inlineSearch = e}
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
    private open () : void
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
            }
        );
    }


    /**
     * Closes the dropdown
     */
    private close () : void
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
     * Toggles the given choice
     */
    private toggleChoice (choice: AusleseTypes.Choice) : void
    {
        this.setState(state => {
            let selections = state.selections;

            if ("single" === state.type)
            {
                selections = new WeakMap<AusleseTypes.Choice, boolean>();
                selections.set(choice, true);
            }
            else
            {
                selections.set(choice, !selections.get(choice));
            }

            return {selections};
        });
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
    private focusChoice (focus: AusleseTypes.Choice|null) : void
    {
        this.setState({focus});
    }


    /**
     * Moves the choice focus in the given direction
     */
    private moveChoiceFocus (up: boolean) : void
    {
        let list = focusableList(buildRenderGroups(
            this.state.groups,
            this.state.selections,
            this.state.type,
            this.state.search
        ));
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
    private onKeyDown (event: KeyboardEvent) : void
    {
        let handled = false;
        let key = event.key.toLowerCase();

        switch (key)
        {
            case " ":
                if (this.state.focus !== null)
                {
                    this.moveChoiceFocus(false);
                    this.toggleChoice(this.state.focus);
                }
                break;

            case "tab":
            case "escape":
                this.close();
                break;

            case "arrowdown":
            case "arrowup":
                this.moveChoiceFocus("arrowup" === key);
                break;
        }

        if (handled)
        {
            event.preventDefault();
        }
    }
}
