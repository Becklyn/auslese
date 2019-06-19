import {Component, h} from "preact";
import {AttachDirector, attachDropdown} from "../lib/attach-dropdown";
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
    private attachment: AttachDirector|undefined;
    private needsUpdate: boolean = false;


    /**
     * @inheritDoc
     */
    public componentDidMount (): void
    {
        this.attachment = attachDropdown(this.props.outerRef, this.props.overlay);
    }


    /**
     * @inheritDoc
     */
    public componentWillUnmount (): void
    {
        if (this.attachment)
        {
            this.attachment.remove();
        }
    }


    /**
     * @inheritDoc
     */
    public componentWillUpdate (nextProps: Readonly<DropdownProps>): void
    {
        this.needsUpdate = this.needsAttachmentUpdate(nextProps);
    }


    /**
     * Returns whether the attachment needs an update
     * @param nextProps
     */
    private needsAttachmentUpdate (nextProps: Readonly<DropdownProps>) : boolean
    {
        let propsThatMightChangeTheHeight = [
            "isClearable",
            "resetText",
            "hasSearchForm",
            "loading",
        ];

        for (let i = 0; i < propsThatMightChangeTheHeight.length; i++)
        {
            let prop = propsThatMightChangeTheHeight[i];
            if (nextProps[prop] !== this.props[prop])
            {
                return true;
            }
        }

        // check only for the number of elements
        return (Array.isArray(this.props.children) && Array.isArray(nextProps.children) && this.props.children.length !== nextProps.children.length);
    }


    /**
     * @inheritDoc
     */
    public componentDidUpdate (): void
    {
        // update after rendering, as the dimensions might have changed
        if (this.attachment && this.needsUpdate)
        {
            this.attachment.update();
            this.needsUpdate = false;
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
