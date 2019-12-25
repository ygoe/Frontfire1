// Automatically apply all controls now. Must be loaded at the end of the document.
// Doing it now is faster than waiting for the DOM ready event, and when loaded at the end of the
// document, all relevant DOM parts are already there.

$.fn.frontfire = function (prefix) {
	if (prefix === undefined) prefix = "";
	let t = this;

	function findInclSelf(selector) {
		return t.find(selector).addBack(selector);
	}

	findInclSelf(prefix + ".accordion").accordion();
	findInclSelf(prefix + ".carousel").carousel();
	// TODO: dropdown
	findInclSelf(prefix + "input[type=number]").spinner();
	findInclSelf(prefix + "input[type=color]").colorPicker();
	// type=color has serious restrictions on acceptable values, ff-color is a workaround
	findInclSelf(prefix + "input[type=ff-color]").colorPicker();
	findInclSelf(prefix + "input[type=checkbox], input[type=radio]").styleCheckbox();
	findInclSelf(prefix + "input[type=checkbox].three-state").threeState();
	findInclSelf(prefix + "textarea.auto-height").autoHeight();
	findInclSelf(prefix + ".menu").menu();
	findInclSelf(prefix + ".critical.closable, .error.closable, .warning.closable, .information.closable, .success.closable").closableMessage();
	// TODO: modal
	findInclSelf(prefix + ".progressbar").progressbar();
	findInclSelf(prefix + ".slider").slider();
	findInclSelf(prefix + ".sortable").sortable();
	findInclSelf(prefix + ".tabs").tabs();
	findInclSelf(prefix + ".selectable").selectable();
	findInclSelf(prefix + "select").selectable();
	return this;
};

$(document).frontfire(":not(.no-autostart)");
