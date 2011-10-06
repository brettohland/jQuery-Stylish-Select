#jQuery stylishSelect:
See the demo at the project page: http://brettohland.github.com/jQuery-Stylish-Select/

## CSS:
The div box that apprears requires a bit of CSS, you can see a bit of an example on the demo page.

##KNOWN ISSUES:
Firefox has an bug where it doesn't properly prevent the default action on a select box.
The temporary fix was to hide each option element using CSS (since the goal was to be non-distructive). There may still be some visual issues in FFOX that you'll have to tweak using CSS if there's a phantom box appearing.
