import {off, on} from "mojave/dom/events";
import {getScrollParent} from "mojave/scroll";
import {onNextAnimationFrame} from "mojave/timing";

export type AttachRemove = () => void;
// the number of pixels that the element must be from the border
const INTERSECTION = 20;
const DISTANCE = 10;


/**
 * Returns the top offset for the overlay
 */
function getTop (elementBox: ClientRect, overlayBox: ClientRect, scrollable: Element) : number
{
    let scrollTop = scrollable.scrollTop;
    let elementTop = scrollTop + elementBox.top;

    let possibleTop = elementTop + elementBox.height + DISTANCE;

    // try bottom, if it doesn't fit use top
    if ((possibleTop + overlayBox.height + INTERSECTION) > (scrollTop + window.innerHeight))
    {
        possibleTop = elementTop - overlayBox.height - DISTANCE;
    }

    return possibleTop;
}


/**
 * Returns the left offset for the overlay
 */
function getLeft (elementBox: ClientRect, overlayBox: ClientRect, scrollable: Element) : number
{
    let scrollLeft = scrollable.scrollLeft;
    let possibleLeft = scrollLeft + elementBox.left;

    // try left, if it doesn't fit use right
    if ((possibleLeft + overlayBox.width + INTERSECTION) > (scrollLeft + window.innerWidth))
    {
        possibleLeft += elementBox.width - overlayBox.width;
    }

    return possibleLeft;
}


/**
 * Updates the position of the element
 */
function update (element: Element, overlay: HTMLElement, scrollable: Element) : void
{
    let style = overlay.style;
    style.display = 'block';

    let elementBox = element.getBoundingClientRect();
    let elementOverlay = overlay.getBoundingClientRect();

    style.left = `${getLeft(elementBox, elementOverlay, scrollable)}px`;
    style.top = `${getTop(elementBox, elementOverlay, scrollable)}px`;
}


/**
 * Attaches the overlay to the element
 */
export function attachDropdown (element: HTMLElement, overlay: HTMLElement) : AttachRemove
{
    let scrollParent = getScrollParent(element.parentNode);
    let scrollableListener = scrollParent || window;
    overlay.style.minWidth = `${Math.max(450, element.getBoundingClientRect().width)}px`;
    overlay.style.maxWidth = `100vw`;
    overlay.style.maxHeight = `100vh`;

    let onUpdate = onNextAnimationFrame(() => update(element, overlay, scrollParent || document.documentElement));
    onUpdate();

    // register event listener
    on(scrollableListener, "scroll", onUpdate);
    on(window, "resize", onUpdate);

    // return disable handler
    return () =>
    {
        off(scrollableListener, "scroll", onUpdate);
        off(window, "resize", onUpdate);
        overlay.style.minWidth = "";
        overlay.style.maxWidth = "";
        overlay.style.maxHeight = "";
    };
}
