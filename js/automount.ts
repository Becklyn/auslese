import {after, createUnstyledElement} from "mojave/dom/manipulate";
import {children} from "mojave/dom/traverse";
import {render, createElement} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {Auslese, AusleseProps} from "./Auslese";


interface ParseSelectResult
{
    mapping: WeakMap<AusleseTypes.Choice, HTMLOptionElement>;
    props: AusleseProps;
}


/**
 * Parses the options from the select
 */
function parseSelect (select: HTMLSelectElement) : ParseSelectResult
{
    let selections = new WeakMap<AusleseTypes.Choice, boolean>();
    let mapping = new WeakMap<AusleseTypes.Choice, HTMLOptionElement>();
    let choices: (AusleseTypes.Choice|AusleseTypes.Group)[] = children<HTMLOptionElement|HTMLOptGroupElement>(select).map(
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
            choices: choices,
            selections: selections,
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
export function mountAuslese (selector: string, context?: Document|Element)
{
    (context || document).querySelectorAll(selector).forEach(
        select =>
        {
            if (!(select instanceof HTMLSelectElement))
            {
                return;
            }

            let wrapper = createUnstyledElement("div", {
                class: "auslese-wrapper",
            });
            after(select, wrapper);

            let data = parseSelect(select);
            data.props.onChange = selection => updateSelectState(select, data.mapping, selection);

            render(
                createElement(Auslese, data.props),
                wrapper
            );
        }
    );
}
