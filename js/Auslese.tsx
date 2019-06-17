import {Component, h} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {CurrentLabels} from "./components/CurrentLabels";
import {CurrentText} from "./components/CurrentText";
import {Group} from "./components/Group";
import {flattenChoices, getSelectedChoices, isChildElement, prepareGroups} from "./lib/helper";
import {ChevronIcon, LoadingIcon, SearchIcon} from "./lib/icons";
import matchSorter from "match-sorter";



export interface AusleseProps
{
    choices: (AusleseTypes.Group|AusleseTypes.Choice)[];
    type?: AusleseTypes.SelectionType;
    placeholder?: string;
    emptyResultsMessage?: string;
    selections?: WeakMap<AusleseTypes.Choice, boolean>;
    hasSearch?: boolean;
}


export interface AusleseState
{
    groups: AusleseTypes.Group[];
    flattened: AusleseTypes.Choice[];
    open: boolean;
    focus: AusleseTypes.Choice|null;
    search: string;
    type: AusleseTypes.SelectionType;
    placeholder: string;
    selections: WeakMap<AusleseTypes.Choice, boolean>;
    loading: boolean;
    hasSearch: boolean;
}

export class Auslese extends Component<AusleseProps, AusleseState>
{
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
        let groups = prepareGroups(props.choices);
        let flattened = flattenChoices(groups);
        let type = props.type || "single";
        let hasSearch = undefined !== props.hasSearch
            ? props.hasSearch
            : flattened.length > 5;

        if ("tag" === type)
        {
            hasSearch = false;
        }

        return {
            groups: groups,
            flattened: flattened,
            open: false,
            focus: null,
            search: "",
            type: type,
            placeholder: props.placeholder || "Bitte wählen",
            selections: props.selections || new WeakMap<AusleseTypes.Choice, boolean>(),
            loading: false,
            hasSearch: hasSearch,
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

        let selectedChoices = getSelectedChoices(this.state.flattened, this.state.selections);
        let windowContent: preact.ComponentChildren = null;
        let searchQuery = state.search.trim();

        if ("" !== searchQuery)
        {
            let filtered = matchSorter(state.flattened, searchQuery, {keys: ["label"]});

            windowContent = filtered.length
                ? (
                    <Group
                        choices={filtered}
                        selections={state.selections}
                        onToggle={choice => this.toggleChoice(choice)}
                    />
                )
                : <div class="auslese-message">{props.emptyResultsMessage || "Keine passenden Einträge gefunden."}</div>;
        }
        else
        {
            windowContent = [
                this.state.groups.map(group => (
                    <Group
                        choices={group.choices}
                        headline={group.headline}
                        selections={this.state.selections}
                        onToggle={choice => this.toggleChoice(choice)}
                    />
                )),
            ];
        }

        return <div class={`auslese auslese-${state.type}-select ${state.open && "auslese-open"}`}>
            <div class="auslese-opener">
                {"tag" === state.type ? (
                    <CurrentLabels
                        selectedChoices={selectedChoices}
                        placeholder={state.placeholder}
                        search={state.search}
                        onInput={e => this.onInput(e)}
                        onRemove={choice => this.toggleChoice(choice)}
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
                            <button class="auslese-clear-button"
                                    onClick={() => this.setState({selections: new WeakMap<AusleseTypes.Choice, boolean>()})}
                            >
                                Auswahl zurücksetzen
                            </button>
                        </div>
                    )}
                    {state.hasSearch && (
                        <div class="auslese-search">
                            <label class="auslese-search-widget">
                                <SearchIcon />
                                <input
                                    type="text"
                                    class="auslese-search-input"
                                    placeholder={state.placeholder}
                                    value={state.search}
                                    onInput={e => this.onInput(e)}
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
        document.body.addEventListener("click", this.onBodyClickBound, false);
        this.setState({open: true});
    }


    /**
     * Closes the dropdown
     */
    private close () : void
    {
        document.body.removeEventListener("click", this.onBodyClickBound, false);
        this.setState({
            open: false,
            search: "",
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
}
