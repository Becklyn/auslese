import {children} from "mojave/dom/traverse";
import {extend} from "mojave/extend";
import {render, createElement} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {Auslese, AusleseProps} from "./Auslese";


interface AusleseMountOptions
{
    placeholder?: string;
    emptyResultsMessage?: string;
    emptyMessage?: string;
    resetText?: string;
    dropdownHolder?: HTMLElement;
    preferredHeadline?: string;
}


/**
 * Returns whether the given option is the "preferred" marker
 */
function isPreferredMarker (element: HTMLOptionElement) : boolean
{
    return element.disabled && element.value === "-------------------";
}


/**
 * Parses the options from the select
 *
 * @internal
 */
export function parseSelect (
    select: HTMLSelectElement,
    preferredLabel?: string
) : AusleseProps
{
    const selectChildren = children<HTMLOptionElement|HTMLOptGroupElement>(select);
    const firstChild = selectChildren[0];
    const selection: AusleseTypes.Selection = {};
    let placeholder = select.dataset.placeholder;
    let foundPreferredMarker = false;
    const choices: AusleseTypes.Group[] = [];

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
                    choices.push(lastGroup);
                    lastGroup = null;
                }

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
                    if (null === lastGroup.headline)
                    {
                        lastGroup.headline = preferredLabel || "Preferred Options";
                    }

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
}


/**
 * Mount auslese on the given elements
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

            const props = extend(parseSelect(select, options.preferredHeadline), options) as AusleseProps;
            props.onChange = selection => updateSelectState(select, selection);
            props.dropdownHolder = options.dropdownHolder;

            render(createElement(Auslese, props), select.parentElement);

            // replace all existing classes
            select.setAttribute("class", "auslese-bound-select");
        }
    );
}
