import {createPopper, Instance} from "@popperjs/core";
import {on} from "mojave/dom/events";
import {findOne} from "mojave/dom/traverse";
import {Component, h} from "preact";
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
    onInput: EventListener;
    outerRef: HTMLElement;
    children: preact.ComponentChildren;
    overlay: HTMLElement;
    onKeyDown: (event: KeyboardEvent) => void;
    class?: string|null;
}

export interface DropdownState
{
}

export class Dropdown extends Component<DropdownProps, DropdownState>
{
    private attachment: Instance|undefined;
    private needsUpdate: boolean = false;
    private window: HTMLElement|null = null;
    private input: HTMLInputElement|null = null;


    /**
     * @inheritDoc
     */
    public componentDidMount (): void
    {
        this.props.overlay.style.width = `${this.props.outerRef.offsetWidth}px`;

        this.attachment = createPopper(this.props.outerRef, this.props.overlay, {
            placement: "bottom",
            modifiers: [
                {
                    name: "preventOverflow",
                },
                {
                    name: "flip",
                    options: {
                        fallbackPlacements: ["top"],
                    },
                },
                {
                    name: 'offset',
                    options: {
                        offset: [0, 10],
                    },
                },
            ],
        });
        on((this.base as HTMLElement).parentElement, "auslese:scroll-to-focus", () => this.scrollToFocus());

        if (this.input)
        {
            // apparently we need to do it in the next task
            window.setTimeout(
                () => this.input && this.input.focus(),
                50
            );
        }
    }


    /**
     * @inheritDoc
     */
    public componentWillUnmount (): void
    {
        if (this.attachment)
        {
            this.attachment.destroy();
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

        if (this.input)
        {
            this.input.focus();
        }
    }


    /**
     * Returns whether the attachment needs an update
     * @param nextProps
     */
    private needsAttachmentUpdate (nextProps: Readonly<DropdownProps>) : boolean
    {
        let propsThatMightChangeTheHeight = [
            "hasSearchForm",
            "isClearable",
            "loading",
            "resetText",
            "search",
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
    public render (props: DropdownProps, state: DropdownState): preact.ComponentChild
    {
        return (
            <div class={`auslese-dropdown ${props.class || ""}`} onKeyDown={props.onKeyDown}>
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
                                ref={element => this.input = element}
                            />
                        </label>
                    </div>
                )}
                <div class="auslese-window" ref={element => this.window = element}>
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


    /**
     * Scrolls to the focused element
     */
    private scrollToFocus () : void
    {
        let focused = findOne(".auslese-focus", this.base as HTMLElement);

        if (!focused || !this.window)
        {
            return;
        }

        let windowBox = this.window.getBoundingClientRect();
        let windowScroll = this.window.scrollTop;
        let focusedBox = focused.getBoundingClientRect();
        let topOffset = focusedBox.top + windowScroll - windowBox.top;

        if (topOffset < windowScroll)
        {
            this.window.scrollTop = topOffset - 10;
            return;
        }

        let bottomOffset = windowScroll + focusedBox.bottom - windowBox.top;

        if (bottomOffset > (windowScroll + windowBox.height))
        {
            this.window.scrollTop = bottomOffset - windowBox.height + 10;
        }
    }
}
