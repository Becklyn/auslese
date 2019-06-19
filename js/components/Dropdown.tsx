import {Component, h} from "preact";
import {attachDropdown, AttachRemove} from "../lib/attach-dropdown";
import {LoadingIcon, SearchIcon} from "../lib/icons";


export interface DropdownProps
{
    isClearable: boolean;
    resetText: string;
    search: string;
    placeholder: string;
    hasSearchForm: boolean;
    onReset: EventListener;
    loading: boolean;
    onInput: (event: Event) => void;
    inputRef: (element: HTMLElement) => void;
    outerRef: HTMLElement;
    children: preact.ComponentChildren;
    overlay: HTMLElement;
}

export interface DropdownState
{
}

export class Dropdown extends Component<DropdownProps, DropdownState>
{
    private attachyDisable: AttachRemove|undefined;


    /**
     * @inheritDoc
     */
    public componentDidMount (): void
    {
        this.attachyDisable = attachDropdown(this.props.outerRef, this.props.overlay);
    }


    /**
     * @inheritDoc
     */
    public componentWillUnmount (): void
    {
        if (this.attachyDisable)
        {
            this.attachyDisable();
        }
    }


    /**
     * @inheritDoc
     */
    public render (props: DropdownProps, state: DropdownState): preact.ComponentChild
    {
        return (
            <div class="auslese-dropdown">
                {props.isClearable && (
                    <div class="auslese-clear">
                        <button
                            class="auslese-clear-button"
                            onClick={props.onReset}
                        >
                            {props.resetText}
                        </button>
                    </div>
                )}
                {props.hasSearchForm && (
                    <div class="auslese-search">
                        <label class="auslese-search-widget">
                            <SearchIcon />
                            <input
                                type="text"
                                class="auslese-search-input"
                                placeholder={props.placeholder}
                                value={props.search}
                                onInput={props.onInput}
                                ref={props.inputRef}
                            />
                        </label>
                    </div>
                )}
                <div class="auslese-window">
                    {props.children}
                </div>
                {props.loading && (
                    <div class="auslese-loading">
                        <LoadingIcon/>
                    </div>
                )}
            </div>
        );
    }
}
