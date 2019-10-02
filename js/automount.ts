import {children} from "mojave/dom/traverse";
import {extend} from "mojave/extend";
import {render, createElement} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {Auslese, AusleseProps} from "./Auslese";


interface ParseSelectResult
{
    mapping: WeakMap<AusleseTypes.Choice, HTMLOptionElement>;
    props: AusleseProps;
}

interface AusleseMountOptions
{
    placeholder?: string;
    emptyResultsMessage?: string;
    emptyMessage?: string;
    resetText?: string;
    dropdownHolder?: HTMLElement;
}


/**
 * Parses the options from the select
 */
function parseSelect (select: HTMLSelectElement) : ParseSelectResult
{
    let selections = new WeakMap<AusleseTypes.Choice, boolean>();
    let mapping = new WeakMap<AusleseTypes.Choice, HTMLOptionElement>();
    let selectChildren = children<HTMLOptionElement|HTMLOptGroupElement>(select);
    let firstChild = selectChildren[0];
    let placeholder = select.dataset.placeholder;

    if (firstChild instanceof HTMLOptionElement && "" === firstChild.value)
    {
        placeholder = firstChild.textContent || "";
        selectChildren.shift();
    }

    let choices: (AusleseTypes.Choice|AusleseTypes.Group)[] = selectChildren.map(
        element =>
        {
            return (element instanceof HTMLOptGroupElement)
                ? {
                    headline: element.label,
                    choices: children<HTMLOptionElement>(element).map(option => parseOption(option, selections, mapping)),
                }
                : parseOption(element, selections, mapping);
        }
    );

    return {
        mapping: mapping,
        props: {
            class: select.getAttribute("class"),
            choices: choices,
            selections: selections,
            placeholder: placeholder,
            type: select.multiple
                ? ("tags" === select.dataset.auslese ? "tags" : "multiple")
                : "single",
        },
    };
}


/**
 * Parses a single <option> tag
 */
function parseOption (
    option: HTMLOptionElement,
    selections: WeakMap<AusleseTypes.Choice, boolean>,
    mapping: WeakMap<AusleseTypes.Choice, HTMLOptionElement>
) : AusleseTypes.Choice
{
    let choice = {
        label: option.textContent || "",
        value: option.value,
        disabled: option.disabled,
    };

    mapping.set(choice, option);

    if (option.selected)
    {
        selections.set(choice, true);
    }

    return choice;
}

/**
 * Updates the bound select
 */
function updateSelectState (
    select: HTMLSelectElement,
    mapping: WeakMap<AusleseTypes.Choice, HTMLOptionElement>,
    selection: AusleseTypes.SelectedChoice[]
) : void
{
    let options = Array.from(select.options).filter(o => !o.disabled);

    // reset all selected states
    options.forEach(o => o.selected = false);

    selection.forEach(
        entry =>
        {
            let option = mapping.get(entry.choice);

            if (option)
            {
                option.selected = true;
            }
        }
    );
}


/**
 * Mount auslese on the given elements
 */
export function mountAuslese (selector: string, context?: Document|Element, options: AusleseMountOptions = {})
{
    (context || document).querySelectorAll(selector).forEach(
        select =>
        {
            if (!(select instanceof HTMLSelectElement))
            {
                return;
            }

            let data = parseSelect(select);
            data.props = extend(data.props, options) as AusleseProps;
            data.props.onChange = selection => updateSelectState(select, data.mapping, selection);
            data.props.dropdownHolder = options.dropdownHolder;

            render(
                createElement(Auslese, data.props),
                select.parentElement as Element
            );

            // replace all existing classes
            select.setAttribute("class", "auslese-bound-select");
        }
    );
}
