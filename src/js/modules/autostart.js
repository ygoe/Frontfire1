// Automatically apply all controls now. Must be loaded at the end of the document.
// Doing it now is faster than waiting for the DOM ready event, and when loaded at the end of the
// document, all relevant DOM parts are already there.

$.fn.frontfire = function (prefix) {
	if (prefix === undefined) prefix = "";

	this.find(prefix + ".accordion").accordion();
	this.find(prefix + ".carousel").carousel();
	// TODO: dropdown
	this.find(prefix + "input[type=number]").spinner();
	this.find(prefix + "input[type=color]").colorPicker();
	this.find(prefix + "input[type=checkbox], input[type=radio]").styleCheckbox();
	this.find(prefix + "input[type=checkbox].three-state").threeState();
	this.find(prefix + "textarea.auto-height").autoHeight();
	this.find(prefix + ".menu").menu();
	this.find(prefix + ".critical.closable, .error.closable, .warning.closable, .information.closable, .success.closable").closableMessage();
	// TODO: modal
	this.find(prefix + ".slider").slider();
	this.find(prefix + ".sortable").sortable();
	this.find(prefix + ".tabs").tabs();
	return this;
};

$(document).frontfire(":not(.no-autostart)");
