// Automatically apply all controls now. Must be loaded at the end of the document.
// Doing it now is faster than waiting for the DOM ready event, and when loaded at the end of the
// document, all relevant DOM parts are already there.

$.fn.frontfire = function (prefix, isAutostart) {
	if (prefix === undefined) prefix = "";
	let t = this;

	function findInclSelf(selector) {
		let q = t.find(selector).addBack(selector);
		if (isAutostart)
			q = q.filter((_, n) => !n.classList.contains("no-frontfire") && !n.closest(".no-frontfire"));
		return q;
	}

	findInclSelf(prefix + ".accordion").accordion();
	findInclSelf(prefix + ".carousel").carousel();
	findInclSelf(prefix + ".gallery").gallery();
	// TODO: dropdown
	findInclSelf(prefix + "input[type=number]").spinner();
	findInclSelf(prefix + "input[type=checkbox].toggle-button").toggleButton();
	findInclSelf(prefix + "input[type=color]").colorPicker();
	// type=color has serious restrictions on acceptable values, ff-color is a workaround
	findInclSelf(prefix + "input[type=ff-color]").colorPicker();
	findInclSelf(prefix + "input[type=checkbox], input[type=radio]").styleCheckbox();
	findInclSelf(prefix + "input[type=checkbox].three-state").threeState();
	findInclSelf(prefix + "input[type=submit].submit-lock, button[type=submit].submit-lock").submitLock();
	findInclSelf(prefix + "input[type=date],input[type=datetime-local],input[type=month],input[type=time],input[type=week]").timePicker();
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
	
	// Duplicate all overlay texts to separate background and foreground opacity.
	// This effect cannot be achieved with a single element and rgba() background
	// because the semitransparent backgrounds of each text line overlap a bit and
	// reduce transparency in these areas. The line gap cannot be determined reliably
	// so a bit overlap is necessary to avoid empty space between the lines.
	findInclSelf(prefix + "div.image-overlay-text, " + prefix + "a.image-overlay-text").each$((_, el) => {
		// Skip images (they're styled differently) and already marked elements
		el.children(":not(img):not(.ff-foreground-only):not(.ff-background-only)").each$((_, el) => {
			// The second (duplicate) will show only the text.
			el.clone().addClass("ff-foreground-only").insertAfter(el);
			// The first (original) will show only the background and have a
			// fully opaque background, but the entire element's opacity is reduced.
			// Also exclude it from screen reading, one is enough.
			el.addClass("ff-background-only").attr("aria-hidden", "true");
		});
	});
	
	return this;
};

if (document.body) {
	// We expect this script to be placed at the end of <body> after all visible elements.
	$(document).frontfire("", true);
}
else {
	// If the script is included in <head>, document.body is still null, so gracefully revert to the
	// DOM ready event to run this.
	$(() => {
		$(document).frontfire("", true);
	});
}
