import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

// Add support for jQuery DOM functions with replaced elements by Frontfire (like selectable)
let origToggle = $.fn.toggle;
$.fn.toggle = function () {
	let args = arguments;
	return this.each$(function (_, obj) {
		origToggle.apply(obj.data("ff-replacement") || obj, args);
	});
};

let origShow = $.fn.show;
$.fn.show = function () {
	let args = arguments;
	return this.each$(function (_, obj) {
		origShow.apply(obj.data("ff-replacement") || obj, args);
	});
};

let origHide = $.fn.hide;
$.fn.hide = function () {
	let args = arguments;
	return this.each$(function (_, obj) {
		origHide.apply(obj.data("ff-replacement") || obj, args);
	});
};

// Gets the offset and dimensions of the first selected element.
//
// relative: true to return the position relative to the offset parent, false for page position.
$.fn.rect = function (relative) {
	var offset = relative ? this.position() : this.offset();
	var width = this.outerWidth();
	var height = this.outerHeight();
	return {
		top: offset.top,
		left: offset.left,
		right: offset.left + width,
		bottom: offset.top + height,
		width: width,
		height: height
	};
};

// Determines whether the selected element is visible.
//
// value: Sets the visible state of the selected elements.
$.fn.visible = function (value) {
	// Setter
	if (value !== undefined) {
		return this.each(function (_, obj) {
			if (value)
				$(obj).show();
			else
				$(obj).hide();
		});
	}

	// Getter
	if (this.length === 0) return;
	let el = this.data("ff-replacement") || this;
	return el.css("display") !== "none";
};

// Determines whether the selected element is disabled.
//
// value: Sets the disabled state of the selected elements and the associated label(s).
// includeLabel: Also updates the parent form row label, if there is one. Default: true.
$.fn.disabled = function (value, includeLabel) {
	// Setter
	if (value !== undefined) {
		return this.each(function (_, obj) {
			if (value)
				$(obj).disable(includeLabel);
			else
				$(obj).enable(includeLabel);
		});
	}

	// Getter
	if (this.length === 0) return;
	// Also explicitly check for the property to support the disabledchange hook
	return this[0].disabled || this.attr("disabled") !== undefined;
};

// Enables the selected elements and the associated label(s).
//
// includeLabel: Also updates the parent form row label, if there is one. Default: true.
$.fn.enable = function (includeLabel) {
	return this.each$(function (_, obj) {
		var supportsDisabledProp = "disabled" in obj[0];
		if (supportsDisabledProp) {
			// Set property so that the hook can trigger the change event.
			// This automatically removes the HTML attribute as well.
			obj.prop("disabled", false);
			// Also update replacement elements of Frontfire controls
			if (obj.data("ff-replacement"))
				obj.data("ff-replacement").enable(false);
		}
		else if (obj.attr("disabled") !== undefined) {
			// Don't set the property or it will be added where not supported.
			// Only remove HTML attribute to allow CSS styling other elements than inputs
			obj.removeAttr("disabled");
			// Trigger the event manually
			obj.trigger("disabledchange");
		}

		obj.parents("label").enable();
		var id = obj.attr("id");
		if (id)
			$("label[for='" + id + "']").enable();
		
		if (includeLabel !== false) {
			// Find previous .label sibling up on the .form-row level
			let refNode = obj;
			while (refNode.parent().length > 0 && !refNode.parent().hasClass("form-row"))
				refNode = refNode.parent();
			let label = refNode.prev();
			if (label.hasClass("label"))
				label.enable();
		}
	});
};

// Disables the selected elements and the associated label(s).
//
// includeLabel: Also updates the parent form row label, if there is one. Default: true.
$.fn.disable = function (includeLabel) {
	return this.each$(function (_, obj) {
		var supportsDisabledProp = "disabled" in obj[0];
		if (supportsDisabledProp) {
			// Set property so that the hook can trigger the change event.
			// This automatically sets the HTML attribute as well.
			obj.prop("disabled", true);
			// Also update replacement elements of Frontfire controls
			if (obj.data("ff-replacement"))
				obj.data("ff-replacement").disable(false);
		}
		else if (obj.attr("disabled") === undefined) {
			// Don't set the property or it will be added where not supported.
			// Only set HTML attribute to allow CSS styling other elements than inputs
			obj.attr("disabled", "");
			// Trigger the event manually
			obj.trigger("disabledchange");
		}

		obj.parents("label").disable();
		var id = obj.attr("id");
		if (id)
			$("label[for='" + id + "']").disable();
		
		if (includeLabel !== false) {
			// Find previous .label sibling up on the .form-row level
			let refNode = obj;
			while (refNode.parent().length > 0 && !refNode.parent().hasClass("form-row"))
				refNode = refNode.parent();
			let label = refNode.prev();
			if (label.hasClass("label"))
				label.disable();
		}
	});
};

// Toggles the disabled state of the selected elements and the associated label(s).
//
// includeLabel: Also updates the parent form row label, if there is one. Default: true.
$.fn.toggleDisabled = function (includeLabel) {
	return this.each$(function (_, obj) {
		if (obj.disabled())
			obj.enable(includeLabel);
		else
			obj.disable(includeLabel);
	});
};

// Returns the first child of each selected element, in the fastest possible way.
$.fn.firstChild = function () {
	var ret = $();
	this.each(function (_, obj) {
		ret = ret.add(obj.firstElementChild);
	});
	return ret;
};

// Determines the actual cursor of the first selected element. "auto" is returned as "default".
$.fn.actualCursor = function () {
	// Most elements like <a>, <input>, <textarea> or <area> already compute their actual cursor
	// value so there's nothing to do.
	var cursor = this.css("cursor");
	if (cursor !== "auto" || cursor === undefined) return cursor;

	// "auto" is mostly used for inline text content. Ignore that and just return the default
	// cursor that is shown over the empty areas of that element.
	return "default";
};

// Determines whether the specified font exists on the client.
// TODO: This fails completely on any Android browser, see https://stackoverflow.com/q/48077942
$.fontExists = function (font) {
	// Test each probe letter separately so that their differences can't cancel each other
	var probes = ["A", "j", "l", "Q", "W", "1", "^", "{", "&", "@"];
	// Compare with different fonts, of which two different ones should be available everywhere
	var refFonts = ["Courier", "Times New Roman", "Arial", "Courier New", "Roboto"];
	var container = $("<span style='font-size: 100px; line-height: 100%; margin: 0; padding: 0; position: absolute; top: -1000px; left: -1000px;'/>").appendTo($("body"));

	for (var i = 0; i < probes.length; i++) {
		// Extend the probe to make small differences more easily measured, using a prime factor :)
		let probe = "";
		for (var k = 0; k < 7; k++) {
			probe += probes[i];
		}
		container.text(probe);
		for (var j = 0; j < refFonts.length; j++) {
			container.css("font-family", refFonts[j]);
			var width = container.width();
			var height = container.height();
			container.css("font-family", "\"" + font + "\",\"" + refFonts[j] + "\"");
			if (container.width() != width || container.height() != height) {
				container.remove();
				return true;
			}
		}
	}
	container.remove();
	return false;
};

// Adds a pointer event handler to the selected elements, with mouse and touch fallbacks as supported.
//
// type: The event type ("down", "move", "up", "cancel"). Multiple types can be space-delimited.
// handler: The event handler function.
// capture: Specifies the capture option. If true, DOM addEventListener ist used instead of jQuery.
// Returns a function that removes the event handler. Keep it and call it, there is no other way to remove it.
$.fn.pointer = function (type, handler, capture) {
	var add, remove, pointer, mouse, touch, touchType = type, mouseHandler, touchHandler;
	var types = type.trim().split(/\s+/);

	// Handle multiple types
	if (types.length > 1) {
		// Call self for each type and combine all event remover functions in a new function to return
		let eventRemovers = [];
		let that = this;
		types.forEach(function (type) {
			eventRemovers.push($(that).pointer(type, handler, capture));
		});
		return function () {
			eventRemovers.forEach(function (eventRemover) { eventRemover(); });
		};
	}

	// Set up the functions to call and bind their context
	if (capture) {
		// Handle multiple selected elements
		if (this.length > 1) {
			// Call self for each element and combine all event remover functions in a new function to return
			let eventRemovers = [];
			this.each$(function (_, obj) {
				eventRemovers.push(obj.pointer(type, handler, capture));
			});
			return function () {
				eventRemovers.forEach(function (eventRemover) { eventRemover(); });
			};
		}
		add = this[0].addEventListener.bind(this[0]);
		remove = this[0].removeEventListener.bind(this[0]);
	}
	else {
		add = this.on.bind(this);
		remove = this.off.bind(this);
		capture = undefined;
	}

	// Fix touch event type names that are a little different
	switch (type) {
		case "down": touchType = "start"; break;
		case "up": touchType = "end"; break;
	}

	// Determine the supported (and necessary) event types
	pointer = "onpointer" + type in window;
	if (!pointer) {
		mouse = "onmouse" + type in window;
		touch = "ontouch" + touchType in window;
	}

	// Prepare adapted handlers for fallback event types
	if (mouse) mouseHandler = event => handleMouseEvent(handler, event);
	if (touch) touchHandler = event => handleTouchEvent(handler, event);

	// Add event handlers
	if (pointer) add("pointer" + type, handler, capture);
	if (mouse) add("mouse" + type, mouseHandler, capture);
	if (touch) add("touch" + touchType, touchHandler, capture);

	// Return a function that removes all added event handlers, for the caller to call later
	return function () {
		if (pointer) remove("pointer" + type, handler, capture);
		if (mouse) remove("mouse" + type, mouseHandler, capture);
		if (touch) remove("touch" + touchType, touchHandler, capture);
	};
};

// Calls a pointer event handler for a mouse event.
function handleMouseEvent(handler, event) {
	var event2 = $.Event(event.type, event);
	event2.pointerId = -event.button;
	event2.pointerType = "mouse";
	return handler(event2);
}

// Calls a pointer event handler for a touch event.
function handleTouchEvent(handler, event) {
	for (var index = 0; index < event.changedTouches.length; index++) {
		var event2 = $.Event(event.type, event);
		event2.pageX = event.changedTouches[index].pageX;
		event2.pageY = event.changedTouches[index].pageY;
		event2.pointerId = event.changedTouches[index].identifier;
		event2.button = 0;
		event2.pointerType = "touch";
		if (handler(event2) === false) return false;
	}
}
