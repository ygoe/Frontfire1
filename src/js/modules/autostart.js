// Automatically apply all controls now. Must be loaded at the end of the document.
// Doing it now is faster than waiting for the DOM ready event, and when loaded at the end of the
// document, all relevant DOM parts are already there.

$(".accordion").accordion();
$(".carousel").carousel();
// TODO: dropdown
$("input[type=number]").spinner();
$("input[type=color]").colorPicker();
$("input[type=checkbox], input[type=radio]").styleCheckbox();
$("input[type=checkbox].three-state").threeState();
$("textarea.auto-height").autoHeight();
$(".menu").menu();
$(".critical.closable, .error.closable, .warning.closable, .information.closable, .success.closable").closableMessage();
// TODO: modal
$(".slider").slider();
$(".sortable").sortable();
$(".tabs").tabs();
