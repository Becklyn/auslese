1.x to 2.0
==========

*   `<Auslese>` now only accepts `Group`s as `choices`. You may need to wrap your choice list.
*   The type for selections has changed – check whether you need to adopt your code.
*   `value` for `Choice`s is now required, `string` or `number` is allowed.
*   The TypeScript types now use a `module` declaration instead of `namespace`.
