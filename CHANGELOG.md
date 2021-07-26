2.4.0
=====

* (feature) Add new option `includeGroupHeadlineInChoiceLabel` to include a `Choice`'s `Group`'s headline as prefix for:

    * the „selected” header inside the dropdown
    * when rendering the current text/tags instead of the dropdown's placeholder


2.3.0
=====

*   (feature) Added `preferredOptionsGroupText` to `AusleseMountOptions` in order to allow overriding the default „Preferred Options” text.
    Setting this option is now possible with the `mountAuslese*` functions.
    You can now optionally pass in an `AusleseMountOptions` object into `parseSelect`. 


2.2.1
=====

*   (bug) Correctly handle `disabled` state. That includes mounting on an `<select disabled>` Element or passing in the `disabled` prop during mounting.  


2.2.0
=====

*   (feature) Trigger `auslese:change` event for auto-mounted selects, as a replacement for the original `change` event.


2.1.3
=====

*   (bug) Keep bound selects focusable (for browser inline validation).
*   (improvement) Bump all dependencies.


2.1.2
=====

*   (improvement) Make `searchable` configurable.
*   (internal) Mark functions as `@internal`.
*   (internal) Remove obsolete function.


2.1.1
=====

*   (improvement) Make `mountAusleseOnElement()` easier to use by just ignoring non-`select` elements.


2.1.0
=====

*   (feature) Add `mountAusleseOnElement()`.


2.0.3
=====

*   (bug) Fix key + type of `mountAuslese` options `config.preferred` value.
*   (improvement) Also add headline for the list after the "preferred" choices. 


2.0.2
=====

*   (bug) Rename `createChoiceGroup()` to `prepareMinimalChoices()` and fix return type.


2.0.1
=====

*   (improvement) Add `createChoiceGroup()` helper.


2.0.0
=====

*   (bc) `<Auslese>` now only accepts `Group`s as `choices`.
*   (bc) Refactored selections to just use a value map, instead of a actual reference map (via `Weakmap`).
*   (bc) `value` for `Choice`s is now required.
*   (bc) Use `module` declaration instead of `namespace` for TypeScript types.
*   (feature) Automounting now correctly handles preferred choices.
*   (feature) Added proper support for duplicate values (which can occur for preferred choices).
*   (improvement) Added `preferredHeadline` automount option, to set the headline of the "preferred choices" group.
*   (internal) Completely refactor the testing infrastructure.



1.1.8
=====

*   (feature) Allow selecting choices by pressing <kbd>Enter</kbd>


1.1.7
=====

*   (bug) Fix invalid dropdown default class.
*   (improvement) Hide dropdown if opener is not visible anymore.
*   (improvement) Bump dependencies.


1.1.6
=====

*   (improvement) Add new option `dropdownClass` to pass custom classes to the dropdown.


1.1.5
=====

*   (bug) Use `popper.js` instead of custom placement implementation, to solve all dropdown issues.


1.1.4
=====

*   Fix several issues, in which the component reinitialized itself and lost all settings (like selections).
*   Cache more derived data in the state (might give a minimal performance boost). 


1.1.3
=====

*   Use `mojave@5`.


1.1.2
=====

*   Properly close dropdowns if another one is opened.
*   Make dropdown holder configurable
*   Properly render check item in smaller font sizes
*   Improve checked multi item rendering.
*   Don't display separator line after header group, if nothing comes after it.


1.1.1
=====

*   Fixed a missing import.


1.1.0
=====

*   Fixed an invalid variable access that lead to an error.
*   Fix rendering if the select is empty, now a info message is displayed instead.
*   Made static texts configurable when automounting.


1.0.1
=====

*   Added more info in the package.json


1.0.0
=====

Initial release `\o/`
