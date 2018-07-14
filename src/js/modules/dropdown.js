import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { forceReflow } from "../util";

var dropdownContainerClass = "ff-dropdown-container";

// Defines default options for the dropdown plugin.
var dropdownDefaults = {
	// The placement of the dropdown relative to the target element. Default: None.
	placement: undefined,

	// Indicates whether the dropdown is closed when clicking anywhere outside of it. Default: true.
	autoClose: true
};

// Opens a dropdown with the selected element and places it at the specified target element.
function createDropdown(target, options) {
	var dropdown = this.first();
	if (dropdown.length === 0) return this;   // Nothing to do
	if (dropdown.parent().hasClass(dropdownContainerClass)) return;   // Already open
	var opt = initOptions("dropdown", dropdownDefaults, dropdown, {}, options);

	var autoPlacement = false;
	if (!opt.placement) {
		opt.placement = "bottom-left";
		autoPlacement = true;
	}
	else if (opt.placement === "right") {
		opt.placement = "bottom-right";
		autoPlacement = true;
	}
	var optPlacement = opt.placement;

	var container = $("<div/>").addClass(dropdownContainerClass).appendTo("body");
	if (dropdown.hasClass("bordered")) {
		container.addClass("bordered");
	}
	dropdown.detach().appendTo(container);

	var viewportWidth = $(window).width();
	var viewportHeight = $(window).height();
	var dropdownWidth = container.outerWidth();
	var dropdownHeight = container.outerHeight();
	var targetRect = $(target).rect();

	// Place at bottom side, align left, by default
	var top = targetRect.bottom,
		left = targetRect.left,
		direction = "bottom";

	if (optPlacement.startsWith("top")) {
		top = targetRect.top - dropdownHeight;
		direction = "top";
	}
	else if (optPlacement.startsWith("bottom")) {
		top = targetRect.bottom;
		direction = "bottom";
	}
	else if (optPlacement.startsWith("left")) {
		left = targetRect.left - dropdownWidth;
		direction = "left";
	}
	else if (optPlacement.startsWith("right")) {
		left = targetRect.right;
		direction = "right";
	}

	if (optPlacement.endsWith("left")) {
		left = targetRect.left;
	}
	else if (optPlacement.endsWith("right")) {
		left = targetRect.right - dropdownWidth;
	}
	else if (optPlacement.endsWith("top")) {
		top = targetRect.top;
	}
	else if (optPlacement.endsWith("bottom")) {
		top = targetRect.bottom - dropdownHeight;
	}

	if (optPlacement === "top-center" || optPlacement === "bottom-center") {
		left = (targetRect.left + targetRect.right) / 2 - dropdownWidth / 2;
	}
	else if (optPlacement === "left-center" || optPlacement === "right-center") {
		top = (targetRect.top + targetRect.bottom) / 2 - dropdownHeight / 2;
	}

	if (autoPlacement && left + dropdownWidth > viewportWidth) {
		left = viewportWidth - dropdownWidth;
	}
	if (autoPlacement && top + dropdownHeight > viewportHeight + $(window).scrollTop()) {
		top = targetRect.top - dropdownHeight;
		direction = "top";
	}

	container.offset({ top: top, left: left })
		.addClass("animate-" + direction);
	forceReflow();
	container.addClass("open");

	// Auto-close the dropdown when clicking outside of it
	if (opt.autoClose === undefined || opt.autoClose) {
		setTimeout(function () {
			$(document).on("click.dropdown-close", function (event) {
				tryClose();
			});
		}, 20);
		container.click(function (event) {
			// Don't close the dropdown when clicking inside of it
			event.stopImmediatePropagation();
		});
	}
	return this;

	function tryClose() {
		var event = $.Event("dropdownclose");
		dropdown.trigger(event);
		if (!event.isDefaultPrevented()) {
			dropdown.dropdown.close();
		}
	}
}

// Closes the selected dropdown.
function closeDropdown() {
	var dropdown = this.first();
	if (dropdown.length === 0) return this;   // Nothing to do
	var container = dropdown.parent();
	if (!container.hasClass(dropdownContainerClass)) return this;   // Dropdown is not open
	//var opt = loadOptions("dropdown", dropdown);

	$(document).off("click.dropdown-close");
	container.removeClass("open").addClass("closed");
	container.on("transitionend", function () {
		dropdown.detach().appendTo("body");
		container.remove();
	});
	return this;
}

registerPlugin("dropdown", createDropdown, {
	close: closeDropdown
});
$.fn.dropdown.defaults = dropdownDefaults;
