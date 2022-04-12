import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { forceReflow } from "../util";

var dropdownContainerClass = "ff-dropdown-container";

// Defines default options for the dropdown plugin.
var dropdownDefaults = {
	// The placement of the dropdown relative to the target element. Default: None.
	placement: undefined,

	// Indicates whether the dropdown is closed when clicking anywhere outside of it. Default: true.
	autoClose: true,
	
	// Indicates whether the dropdown is closed when the window is resized. Default: true.
	closeOnResize: true,
	
	// Indicates whether the dropdown is closed when the document is hidden. Default: true.
	closeOnHide: true,
	
	// The maximum height of the dropdown, in pixels. Default: 0 (no limit).
	maxHeight: 0,

	// Indicates whether the dropdown has fixed position instead of absolute. Default: false.
	fixed: false,

	// Additional CSS classes to add to the dropdown container. Default: None.
	cssClass: undefined,

	// Additional CSS styles to add to the dropdown container. Default: None.
	style: undefined
};

// Opens a dropdown with the selected element and places it at the specified target element.
function createDropdown(target, options) {
	var dropdown = this.first();
	if (dropdown.length === 0) return this;   // Nothing to do
	if (dropdown.parent().hasClass(dropdownContainerClass)) {
		let oldContainer = dropdown.parent();
		if (oldContainer.hasClass("closed")) {
			// Already closed but the transition hasn't completed yet. Bring it to an end right now.
			dropdown.appendTo("body");
			oldContainer.remove();
		}
		else {
			return;   // Already open
		}
	}
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

	// Measure before adding the dropdown to the document (which may add a scrollbar, virtually)
	var $window = $(window);
	var viewportWidth = $window.width() - 1;
	var viewportHeight = $window.height() - 1;
	var scrollTop = $window.scrollTop();
	var scrollLeft = $window.scrollLeft();
	var targetRect = $(target).rect();
	var isReducedHeight = false;
	var isRightAligned = false;
	var isHorizontallyCentered = false;

	var container = $("<div/>").addClass(dropdownContainerClass).appendTo("body");
	if (opt.cssClass) {
		container.addClass(opt.cssClass);
	}
	if (opt.style) {
		container.css(opt.style);
	}
	if (opt.fixed) {
		container.css("position", "fixed");
	}
	if (dropdown.hasClass("bordered")) {
		container.addClass("bordered");
	}
	if ($(document.body).hasClass("ff-dimmed")) {
		container.addClass("no-dim");
	}
	dropdown.appendTo(container);

	// Now measure the container with its contents
	var dropdownWidth = container.outerWidth();
	var dropdownHeight = container.outerHeight();

	// Limit height if specified, has effect on placement
	if (opt.maxHeight && opt.maxHeight < dropdownHeight) {
		dropdownHeight = opt.maxHeight;
		container.outerHeight(dropdownHeight);
		isReducedHeight = true;
		dropdownWidth = container.outerWidth();
	}

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
		isRightAligned = true;
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
		isRightAligned = true;
	}
	else if (optPlacement.endsWith("top")) {
		top = targetRect.top;
	}
	else if (optPlacement.endsWith("bottom")) {
		top = targetRect.bottom - dropdownHeight;
	}

	if (optPlacement === "top-center" || optPlacement === "bottom-center") {
		left = (targetRect.left + targetRect.right) / 2 - dropdownWidth / 2;
		isHorizontallyCentered = true;
	}
	else if (optPlacement === "left-center" || optPlacement === "right-center") {
		top = (targetRect.top + targetRect.bottom) / 2 - dropdownHeight / 2;
	}

	if (autoPlacement && left + dropdownWidth > viewportWidth) {
		left = viewportWidth - dropdownWidth;
	}
	if (autoPlacement && top + dropdownHeight > viewportHeight + scrollTop) {
		let topSpace = targetRect.top - scrollTop;
		let bottomSpace = viewportHeight + scrollTop - targetRect.bottom;
		if (topSpace > bottomSpace) {
			top = targetRect.top - dropdownHeight;
			direction = "top";
		}
	}
	
	let availableHeight;
	if (direction === "top") {
		availableHeight = targetRect.top - scrollTop;
	}
	else if (direction === "bottom") {
		availableHeight = viewportHeight + scrollTop - targetRect.bottom;
	}
	else {
		availableHeight = viewportHeight;
	}
	if (dropdownHeight > availableHeight) {
		dropdownHeight = availableHeight;
		container.outerHeight(dropdownHeight);
		isReducedHeight = true;
		if (direction === "top")
			top = targetRect.top - dropdownHeight;
	}

	if (direction === "left" || direction === "right") {
		if (top + dropdownHeight > viewportHeight + scrollTop) {
			top = viewportHeight + scrollTop - dropdownHeight;
		}
		else if (top < scrollTop) {
			top = scrollTop;
		}
	}
	else if (direction === "top" || direction === "bottom") {
		if (left + dropdownWidth > viewportWidth + scrollLeft) {
			left = viewportWidth + scrollLeft - dropdownWidth;
		}
		else if (left < scrollLeft) {
			left = scrollLeft;
		}
	}
	
	if (isReducedHeight) {
		let scrollbarWidth = container[0].offsetWidth - container[0].clientWidth;
		if (scrollbarWidth > 0) {
			dropdownWidth += scrollbarWidth;
			if (dropdownWidth > viewportWidth) {
				dropdownWidth = viewportWidth;
			}
			container.outerWidth(dropdownWidth);
			if (isRightAligned) {
				left -= scrollbarWidth;
			}
			else if (isHorizontallyCentered) {
				left -= scrollbarWidth / 2;
			}

			if (left + dropdownWidth > viewportWidth + scrollLeft) {
				left = viewportWidth + scrollLeft - dropdownWidth;
			}
			else if (left < scrollLeft) {
				left = scrollLeft;
			}
		}
	}

	// Scroll to the first selected item in the dropdown (used for selectable)
	let selectedChild = dropdown.children(".selected").first();
	if (selectedChild.length > 0) {
		let selectedTop = selectedChild.position().top;
		container.scrollTop(selectedTop + selectedChild.height() / 2 - dropdownHeight / 2);
	}

	container.offset({ top: top, left: left })
		.addClass("animate-" + direction);
	forceReflow();
	container.addClass("open");

	// Auto-close the dropdown when clicking outside of it
	if (opt.autoClose === undefined || opt.autoClose) {
		setTimeout(function () {
			// Close on mousedown instead of click because it's more targeted. A click event is also
			// triggered when the mouse button was pressed inside the dropdown and released outside
			// of it. This is considered "expected behaviour" of the click event.
			$(document).on("mousedown.dropdown-close", function (event) {
				tryClose();
			});
		}, 20);
		container.on("mousedown", function (event) {
			// Don't close the dropdown when clicking inside of it
			event.stopImmediatePropagation();
		});
	}
	
	if (opt.closeOnResize === undefined || opt.closeOnResize) {
		$window.on("resize.dropdown", tryClose);
	}
	
	if (opt.closeOnHide === undefined || opt.closeOnHide) {
		$(document).on("visibilitychange.dropdown", function () {
			if (document.hidden)
				tryClose();
		});
	}
	return this;

	function tryClose() {
		var event = $.Event("dropdownclose");
		dropdown.trigger(event);
		if (!event.isDefaultPrevented()) {
			dropdown.dropdown.close(true);
		}
	}
}

// Determines whether the dropdown is currently open.
//
function isDropdownOpen() {
	var dropdown = this.first();
	if (dropdown.length === 0) return this;   // Nothing to do
	var container = dropdown.parent();
	return container.hasClass(dropdownContainerClass);
}

// Closes the selected dropdown.
//
// closeEventTriggered: For internal use.
function closeDropdown(closeEventTriggered) {
	var dropdown = this.first();
	if (dropdown.length === 0) return this;   // Nothing to do
	var container = dropdown.parent();
	if (!container.hasClass(dropdownContainerClass)) return this;   // Dropdown is not open
	//var opt = loadOptions("dropdown", dropdown);

	$(document).off("mousedown.dropdown-close");
	container.removeClass("open").addClass("closed");
	container.on("transitionend", function () {
		dropdown.appendTo("body");
		container.remove();
	});
	if (!closeEventTriggered) {
		var event = $.Event("dropdownclose");
		dropdown.trigger(event);
	}
	$(window).off("resize.dropdown");
	$(document).off("visibilitychange.dropdown");
	return this;
}

registerPlugin("dropdown", createDropdown, {
	isOpen: isDropdownOpen,
	close: closeDropdown
});
$.fn.dropdown.defaults = dropdownDefaults;
