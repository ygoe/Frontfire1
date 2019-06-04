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
		if (opt.level === modalLevel) {
			// This is the top-most modal now, handle the focus event
			if ($(event.target).parents().filter(modal).length === 0) {
				// The focused element's ancestors do not include the modal, so the focus went out
				// of the modal. Bring it back.
				modal.find(":focusable").first().focus();
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}
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

// Shows a standard message box modal with content and buttons.
//
// options.content: (jQuery) The message content to display.
// options.html: (String) The message HTML content to display.
// options.text: (String) The message text to display.
// options.buttons: (Array) The buttons to display in the modal.
// options.buttons[].text: (String) The button text.
// options.buttons[].icon: (String) The CSS class of an <i> element displayed before the text.
// options.buttons[].className: (String) Additional CSS classes for the button.
// options.buttons[].result: The result value of the button.
// options.resultHandler: (Function) The modal response handler. It is passed the button handler's return value, or false if cancelled.
//
// If a string is passed as first argument, it is displayed as text with an OK button.
$.modal = function (options) {
	if (typeof options === "string") {
		options = {
			text: options,
			buttons: "OK"
		};
	}
	
	let modal = $("<div/>")
		.addClass("modal");
	let content = $("<div/>")
		.appendTo(modal);
	if (options.content)
		content.append(options.content)
	else if (options.html)
		content.html(options.html)
	else if (options.text)
		content.text(options.text)

	let buttons = options.buttons;
	if (typeof buttons === "string") {
		switch (buttons) {
			case "OK":
				buttons = [
					{ text: "OK", className: "default", result: true }
				];
				break;
			case "OK cancel":
				buttons = [
					{ text: "OK", className: "default", result: true },
					{ text: "Cancel", className: "transparent", result: false }
				];
				break;
			case "YES no":
				buttons = [
					{ text: "Yes", className: "default", result: true },
					{ text: "No", result: false }
				];
				break;
			case "yes NO":
				buttons = [
					{ text: "Yes", result: true },
					{ text: "No", className: "default", result: false }
				];
				break;
			default:
				buttons = [];
				break;
		}
	}

	let buttonsElement;
	let buttonPressed = false;
	if (buttons && buttons.length > 0) {
		buttonsElement = $("<div/>")
			.addClass("buttons")
			.appendTo(modal);
		buttons.forEach(function (button) {
			let buttonElement = $("<button/>")
				.addClass(button.className)
				.appendTo(buttonsElement);
			if (button.icon)
				buttonElement.append($("<i/>").addClass(button.icon));
			if (button.icon && button.text)
				buttonElement.append(" ");
			if (button.text)
				buttonElement.append(button.text);
			buttonElement.click(function (event) {
				buttonPressed = true;
				modal.modal.close();
				if (options.resultHandler)
					options.resultHandler(button.result);
			});
		});
	}
	modal.modal(options);
	if (buttonsElement)
		buttonsElement.find("button.default").first().focus();
	if (options.resultHandler) {
		modal.on("close", function () {
			if (!buttonPressed)
				options.resultHandler();
		});
	}
}
