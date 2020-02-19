next patch
==========

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
