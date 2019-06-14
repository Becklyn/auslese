import {Component, h} from "preact";
import {AusleseTypes} from "./@types/auslese";
import {ControlledAuslese, ControlledAusleseProps} from "./ControlledAuslese";
import {isChildElement} from "./lib/helper";


interface AusleseProps extends ControlledAusleseProps
{
    placeholder?: string;
    choices: AusleseTypes.ChoiceGroup[]|AusleseTypes.Choice[];
    multiple: boolean;
}

interface AusleseState
{
    open: boolean;
}

export class Auslese extends Component<AusleseProps, AusleseState>
{
    private selections: AusleseTypes.Selections;
    private onBodyClickBound: (event: Event) => void;
    private selectRef: Component|null = null;

    /**
     *
     */
    public constructor (props: AusleseProps)
    {
        super(props);
        this.selections = new WeakMap<AusleseTypes.Choice, boolean>();
        this.state = {
            open: false,
        };

        this.onBodyClickBound = event => this.onBodyClick(event);
    }


    public componentDidMount (): void
    {
        this.open();
    }


    /**
     * Unifies the choice groups
     */
    private getChoiceGroups (choices: AusleseTypes.ChoiceGroup[]|AusleseTypes.Choice[]) : AusleseTypes.ChoiceGroup[]
    {
        let previousType: string|null = null;

        choices.forEach(
            group => {
                let type = group.headline !== undefined
                    ? "groups"
                    : "choices";

                if (null === previousType)
                {
                    previousType = type;
                }
                else if (previousType !== type)
                {
                    throw new Error("Can't mix choices with choice groups.");
                }
            }
        );

        return previousType === "choices"
            ? [{headline: null, choices: choices}] as AusleseTypes.ChoiceGroup[]
            : choices as AusleseTypes.ChoiceGroup[];
    }


    /**
     * @inheritDoc
     */
    public render (props: Readonly<AusleseProps>, state: Readonly<AusleseState>): preact.ComponentChild
    {
        return (
            <ControlledAuslese
                placeholder={props.placeholder}
                open={state.open}
                groups={this.getChoiceGroups(props.choices)}
                multiple={props.multiple}
                selections={this.selections}
                onButtonClick={() => this.toggleOpen()}
                onElementClick={(choice, event) => this.onChoiceClick(choice)}
                ref={el => this.selectRef = el}
            />
        );
    }


    /**
     * Callback on when a choice was clicked
     */
    private onChoiceClick (choice: AusleseTypes.Choice, event: Event) : void
    {
        event.preventDefault();

        if (this.props.multiple)
        {
            this.selections.set(choice, !this.selections.get(choice));
            this.forceUpdate();
        }
        else
        {
            this.selections = new WeakMap<AusleseTypes.Choice, boolean>();
            this.selections.set(choice, true);
            this.close();
        }
    }

    private open ()
    {
        document.body.addEventListener("click", this.onBodyClickBound, false);
        this.setState({open: true});
    }

    private close ()
    {
        document.body.removeEventListener("click", this.onBodyClickBound, false);
        this.setState({open: false});
    }


    /**
     *
     */
    private toggleOpen ()
    {
        if (this.state.open)
        {
            this.close();
        }
        else
        {
            this.open();
        }
    }


    /**
     * Callback on when the body was clicked
     */
    private onBodyClick (event)
    {
        if (!this.selectRef)
        {
            return;
        }

        if (!isChildElement(this.selectRef.base as Element, event.target))
        {
            console.log(this.selectRef.base as Element, event.target);
//            this.close();
        }
    }
}
