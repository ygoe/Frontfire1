import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";
import { dimBackground, undimBackground } from "../dimmer";

var modalEventNamespace = ".ff-modal";
var modalClass = "ff-modal-container";
var modalCloseButtonClass = "ff-modal-close-button";

var modalLevel = 0;

// Defines default options for the modal plugin.
var modalDefaults = {
	// Indicates whether the modal is closed when clicking anywhere outside of it or pressing Esc.
	// This also shows a close button in the model overlay. Default: true.
	cancellable: true,
	
	// The tooltip text for the close button. Default: empty.
	closeTooltip: "",
	
	// Indicates whether the page background is dimmed while the modal is open. Default: true.
	dimBackground: true
};

// Opens a modal with the selected element.
function modal(options) {
	var modal = this.first();
	if (modal.length === 0) return this;   // Nothing to do
	if (modal.parent().hasClass(modalClass)) return this;   // Already open
	modalLevel++;
	var opt = initOptions("modal", modalDefaults, modal, {}, options);
	opt.level = modalLevel;
	if (opt.dimBackground && modalLevel === 1)
		dimBackground();

	var container = $("<div/>").addClass(modalClass).appendTo("body");
	modal.appendTo(container);
	modal.find(":focusable").first().focus().blur();

	if (modalLevel === 1)
		preventScrolling();

	// Prevent moving the focus out of the modal
	$(document).on("focusin" + modalEventNamespace + "-" + opt.level, function (event) {
		if ($(event.target).parents().filter(modal).length === 0) {
			// The focused element's ancestors do not include the modal, so the focus went out
			// of the modal. Bring it back.
			modal.find(":focusable").first().focus();
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
		}
	});

	var closeButton;
	if (opt.cancellable) {
		// Close on pressing the Escape key or clicking outside the modal
		$(document).on("keydown" + modalEventNamespace + "-" + opt.level, function (event) {
			if (event.keyCode === 27) {   // Escape
				if (modalLevel === opt.level) {   // There might be another modal on top
					event.preventDefault();
					modal.modal.close();
				}
			}
		});
		container.click(function (event) {
			if (event.button === 0 && event.target === this) {
				modal.modal.close();
			}
		});

		// Add default close button
		closeButton = $("<a/>").addClass(modalCloseButtonClass).attr("href", "#").appendTo(modal);
		if (opt.closeTooltip)
			closeButton[0].title = opt.closeTooltip;
		closeButton.click(function (event) {
			event.preventDefault();
			if (event.button === 0) {
				modal.modal.close();
			}
		});
	}
	return this;
}

// Closes the selected modal.
function closeModal() {
	var modal = this.first();
	if (modal.length === 0) return this;   // Nothing to do
	var container = modal.parent();
	if (!container.hasClass(modalClass)) return this;   // Modal is not open
	modalLevel--;
	var opt = loadOptions("modal", modal);
	var closeButton = modal.find("." + modalCloseButtonClass).first();

	if (!modalLevel)
		preventScrolling(false);
	$(document).off("focusin" + modalEventNamespace + "-" + opt.level);
	$(document).off("keydown" + modalEventNamespace + "-" + opt.level);
	modal.appendTo("body");
	container.remove();
	if (closeButton)
		closeButton.remove();
	if (opt.dimBackground && !modalLevel)
		undimBackground();

	let event = $.Event("close");
	modal.trigger(event);
	return this;
}

registerPlugin("modal", modal, {
	close: closeModal
});
$.fn.modal.defaults = modalDefaults;
