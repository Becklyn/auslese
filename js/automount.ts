import {children} from "mojave/dom/traverse";
import {extend} from "mojave/extend";
import {render, createElement} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {Auslese, AusleseProps} from "./Auslese";
import {trigger} from "mojave/dom/events";
import ChangeEvent = AusleseTypes.ChangeEvent;


interface PreferredGroupOptions
{
    headline?: string;
    after?: string;
}

interface AusleseMountOptions
{
    placeholder?: string;
    emptyResultsMessage?: string;
    emptyMessage?: string;
    resetText?: string;
    dropdownHolder?: HTMLElement;
    /**
     * The headline of the preferred group + the one after it
     */
    preferred?: PreferredGroupOptions;
}


/**
 * Returns whether the given option is the "preferred" marker
 */
function isPreferredMarker (element: HTMLOptionElement) : boolean
{
    return element.disabled && element.value === "-------------------";
}

/**
 * Sets the group headline without overwriting an existing one.
 */
function safeSetGroupHeadline (group: AusleseTypes.Group, headline?: string|null) : void
{
    if (null === group.headline && headline)
    {
        group.headline = headline;
    }
}

/**
 * Parses the options from the select
 *
 * @internal
 */
export function parseSelect (
    select: HTMLSelectElement,
    preferred?: PreferredGroupOptions
) : AusleseProps
{
    const selectChildren = children<HTMLOptionElement|HTMLOptGroupElement>(select);
    const firstChild = selectChildren[0];
    const selection: AusleseTypes.Selection = {};
    let placeholder = select.dataset.placeholder;
    let foundPreferredMarker = false;
    const choices: AusleseTypes.Group[] = [];

    let nextGroupMergeHeadline: string|null = null;
    let lastGroup: AusleseTypes.Group|null = null;

    if (firstChild instanceof HTMLOptionElement && "" === firstChild.value)
    {
        placeholder = firstChild.textContent || "";
        selectChildren.shift();
    }


    selectChildren.forEach(
        element =>
        {
            if (element instanceof HTMLOptGroupElement)
            {
                const groupElements = children<HTMLOptionElement>(element);

                // skip empty groups
                if (!groupElements.length)
                {
                    return;
                }

                if (lastGroup !== null)
                {
                    safeSetGroupHeadline(lastGroup, nextGroupMergeHeadline);
                    choices.push(lastGroup);
                    lastGroup = null;
                }

                nextGroupMergeHeadline = null;

                // push the group as new group
                choices.push({
                    headline: element.label,
                    choices: groupElements.map(option => {
                        if (option.selected)
                        {
                            selection[option.value] = true;
                        }

                        return parseOption(option);
                    }),
                });

                return;
            }

            // check for "preferred values" placeholder
            if (isPreferredMarker(element))
            {
                // if this is the second "preferred" marker
                if (foundPreferredMarker)
                {
                    throw new Error("Multiple preferred markers found");
                }

                foundPreferredMarker = true;

                // if there is a last group, push it as
                if (null !== lastGroup)
                {
                    const headline = preferred ? preferred.headline : null;
                    safeSetGroupHeadline(lastGroup, headline || "Preferred Options");

                    nextGroupMergeHeadline = preferred ? (preferred.after || null) : null;
                    choices.push(lastGroup);
                    lastGroup = null;
                }

                return;
            }

            if (null === lastGroup)
            {
                lastGroup = {headline: null, choices: []};
            }

            if (element.selected)
            {
                selection[element.value] = true;
            }

            lastGroup.choices.push(parseOption(element));
        }
    );

    if (null !== lastGroup)
    {
        safeSetGroupHeadline(lastGroup, nextGroupMergeHeadline);
        choices.push(lastGroup);
    }

    return {
        class: select.getAttribute("class"),
        choices,
        selection,
        placeholder,
        type: select.multiple
            ? ("tags" === select.dataset.auslese ? "tags" : "multiple")
            : "single",
    };
}


/**
 * Parses a single <option> tag
 */
function parseOption (option: HTMLOptionElement) : AusleseTypes.Choice
{
    if (isPreferredMarker(option))
    {
        throw new Error("Found invalid preferred marker");
    }

    return {
        label: option.textContent || "",
        value: option.value,
        disabled: option.disabled,
    };
}


/**
 * Updates the bound select
 */
function updateSelectState (
    select: HTMLSelectElement,
    selection: AusleseTypes.Selection
) : void
{
    const options = Array.from(select.options).filter(o => !o.disabled);

    // reset all selected states
    options.forEach(option => {
        option.selected = selection[option.value];
    });

    trigger(select, "auslese:change", {
        selection: selection,
    } as ChangeEvent);
}


/**
 * Mount auslese on the given elements, found by the selector
 */
export function mountAuslese (selector: string, context?: Document|Element, options: AusleseMountOptions = {})
{
    (context || document).querySelectorAll(selector).forEach(
        select =>
        {
            if (!(select instanceof HTMLSelectElement) || !select.parentElement)
            {
                return;
            }

            mountAusleseOnElement(select, options);
        }
    );
}

/**
 * Mount auslese on the given select element
 */
export function mountAusleseOnElement (select: HTMLElement, options: AusleseMountOptions = {}) : void
{
    if (!(select instanceof HTMLSelectElement) || !select.parentElement)
    {
        return;
    }

    const props = extend(parseSelect(select, options.preferred), options) as AusleseProps;
    props.onChange = selection => updateSelectState(select, selection);
    props.dropdownHolder = options.dropdownHolder;

    render(createElement(Auslese, props), select.parentElement);

    // replace all existing classes
    select.setAttribute("class", "auslese-bound-select");
    // the original select is still focusable, so we need to remove it from the tab
    // order, so that tab-navigation isn't broken.
    select.setAttribute("tabindex", "-1");
}
