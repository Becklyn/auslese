import {h} from "preact";
import JSX = preact.h.JSX;


let ICONS = {
    chevron: {
        fill: false,
        svg: <path d="M6 9l6 6 6-6"/>,
    },
    delete: {
        fill: false,
        svg: [<line x1="18" y1="6" x2="6" y2="18"/>, <line x1="6" y1="6" x2="18" y2="18"/>],
    },
    check: {
        fill: true,
        svg: <path d="M9.3 18.7L2.7 12l1.8-1.9 4.8 4.8L19.5 4.8l1.8 1.9z"/>,
    },
    search: {
        fill: false,
        svg: [<circle cx="11" cy="11" r="8"/>, <path d="M21 21l-4.35-4.35"/>],
    }
};

interface IconProps
{
    name: string;
}

/**
 *
 */
export function Icon ({name}: IconProps): JSX.Element
{
    if ("loading" === name)
    {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="15" height="15">
                <path d="M7.5 1.5a6 6 0 0 1 0 12V15A7.5 7.5 0 1 0 0 7.5h1.5a6.018 6.018 0 0 1 6-6z"/>
            </svg>
        );
    }

    let fill = ICONS[name].fill
        ? {fill: "currentColor", stroke: "none"}
        : {fill: "none", stroke: "currentColor"};

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            {...fill}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            {ICONS[name].svg}
        </svg>
    )
}
