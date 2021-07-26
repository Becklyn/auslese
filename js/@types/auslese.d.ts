export module AusleseTypes
{
    export type SelectionType = "single" | "multiple" | "tags";

    export interface Choice
    {
        label: string;
        value: string|number;
        disabled?: boolean;
        payload?: any;
        group?: FlatGroup;
    }

    export interface Group
    {
        headline: string|null;
        header?: boolean;
        choices: Choice[];
    }

    export interface FlatGroup
    {
        headline: string|null;
        header?: boolean;
    }


    export interface SelectedChoice
    {
        choice: Choice,
        toggle?: () => void;
    }

    export type Selection = Record<string|number, true>;

    export interface ChangeEvent
    {
        selection: Selection;
    }
}
