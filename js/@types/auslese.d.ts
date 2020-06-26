export module AusleseTypes
{
    export type SelectionType = "single" | "multiple" | "tags";

    export interface Choice
    {
        label: string;
        disabled?: boolean;
        value: string|number;
        payload?: any;
    }

    export interface Group
    {
        headline: string|null;
        header?: boolean;
        choices: Choice[];
    }


    export interface SelectedChoice
    {
        choice: Choice,
        toggle?: () => void;
    }

    export type Selection = Record<string|number, true>;
}
