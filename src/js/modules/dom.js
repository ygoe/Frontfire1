import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

const replacementKey = "ff-replacement";

// Add support for jQuery DOM functions with replaced elements by Frontfire (like selectable)
let origToggle = $.fn.toggle;
$.fn.toggle = function () {
	let args = arguments;
	return this.each$(function (_, obj) {
		origToggle.apply(obj.data(replacementKey) || obj, args);
	});
};

let origShow = $.fn.show;
$.fn.show = function () {
	let args = arguments;
	return this.each$(function (_, obj) {
		origShow.apply(obj.data(replacementKey) || obj, args);
	});
};

let origHide = $.fn.hide;
$.fn.hide = function () {
	let args = arguments;
	return this.each$(function (_, obj) {
		origHide.apply(obj.data(replacementKey) || obj, args);
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
	let el = this.data(replacementKey) || this;
	return el.css("display") !== "none" && el.css("visibility") !== "collapse";
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
			if (obj.data(replacementKey))
				obj.data(replacementKey).enable(false);
		}
		else if (obj.attr("disabled") !== undefined) {
			// Don't set the property or it will be added where not supported.
			// Only remove HTML attribute to allow CSS styling other elements than inputs
			obj.removeAttr("disabled");
			// Trigger the event manually
			obj.triggerNative("disabledchange");
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
			if (obj.data(replacementKey))
				obj.data(replacementKey).disable(false);
		}
		else if (obj.attr("disabled") === undefined) {
			// Don't set the property or it will be added where not supported.
			// Only set HTML attribute to allow CSS styling other elements than inputs
			obj.attr("disabled", "");
			// Trigger the event manually
			obj.triggerNative("disabledchange");
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

// Determines whether the selected element is readonly.
//
// value: Sets the readonly state of the selected elements. Unsupported elements are disabled instead.
$.fn.readonly = function (value) {
	// Setter
	if (value !== undefined) {
		return this.each(function (_, obj) {
			let supportsReadonlyProp = "readonly" in obj;
			let supportsDisabledProp = "disable" in obj;
			obj = $(obj);
			if (value) {
				if (supportsReadonlyProp) {
					obj.prop("readonly", true);
					if (obj.data(replacementKey))
						obj.data(replacementKey).readonly(true);
				}
				else if (supportsDisabledProp) {
					obj.prop("disabled", true);
					if (obj.data(replacementKey))
						obj.data(replacementKey).readonly(true);
				}
				else if (obj.attr("readonly") === undefined) {
					obj.attr("readonly", "");
					obj.triggerNative("readonlychange");
				}
			}
			else {
				if (supportsReadonlyProp) {
					obj.prop("readonly", false);
					if (obj.data(replacementKey))
						obj.data(replacementKey).readonly(false);
				}
				else if (supportsDisabledProp) {
					obj.prop("disabled", false);
					if (obj.data(replacementKey))
						obj.data(replacementKey).readonly(false);
				}
				else if (obj.attr("readonly") !== undefined) {
					obj.removeAttr("readonly");
					obj.triggerNative("readonlychange");
				}
			}
		});
	}

	// Getter
	if (this.length === 0) return;
	return this[0].readonly || this.attr("readonly") !== undefined;
}

// Returns the first child of each selected element, in the fastest possible way.
$.fn.firstChild = function () {
	var ret = $();
	this.each(function (_, obj) {
		ret = ret.add(obj.firstElementChild);
	});
	return ret;
};

// Sets the last-column class to the last visible column in a table, if following columns are hidden.
// This ensures (together with CSS rules) that the border and padding of the last visible column is
// correct.
$.fn.updateLastColumn = function () {
	return this.each$(function (_, table) {
		let lastColumn, lastVisibleColumn;
		// TODO: Ignore nested tables
		// TODO: This looks strange, is it per-row?
		table.find("th, td").each$(function (_, td) {
			td.removeClass("last-column");
			lastColumn = td;
			if (td.visible())
				lastVisibleColumn = td;
		});
		if (lastColumn && lastVisibleColumn && lastColumn !== lastVisibleColumn)
			lastVisibleColumn.addClass("last-column");
	});
};

// Sets the first-row and last-row class to the first/last visible row in a table, if
// preceding/following rows are hidden. This ensures (together with CSS rules) that the border and
// padding of the first and last visible row is correct.
$.fn.updateFirstLastRow = function () {
	return this.each$(function (_, table) {
		let lastRow, lastVisibleRow, seenFirstRow;
		// TODO: Ignore nested tables
		table.find("tr").each$(function (_, tr) {
			tr.removeClass("first-row");
			tr.removeClass("last-row");
			tr.removeClass("hidden-row");
			lastRow = tr;
			if (tr.visible()) {
				if (!seenFirstRow) {
					seenFirstRow = true;
					tr.addClass("first-row");
				}
				lastVisibleRow = tr;
			}
			else {
				tr.addClass("hidden-row");
			}
		});
		if (lastRow && lastVisibleRow && lastRow !== lastVisibleRow)
			lastVisibleRow.addClass("last-row");
	});
};

// Returns the closest parent of each selected element that matches the predicate function.
//
// predicate: A function that is called with each parent as first argument and the starting element
//   as second argument. If it returns true, the search is stopped and the parent element is added
//   to the returned list.
$.fn.parentWhere = function (predicate) {
	var ret = $();
	this.each(function (_, obj) {
		let parent = obj;
		do
		{
			if (predicate(parent, obj)) {
				ret = ret.add(parent);
				break;
			}
			parent = parent.parentElement;
		}
		while (parent);
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

// Immediately scrolls the page so that the first selected element is at the top.
// offset: The vertical offset to scroll the element to.
$.fn.scrollToTop = function (offset) {
	if (this.length) {
		$(window).scrollTop(this.offset().top - (offset || 0));
	}
};

var scrollAnimationTimeout;

// Smoothly scrolls the page so that the first selected element is at the top.
// offset: The vertical offset to scroll the element to.
$.fn.animateScrollToTop = function (offset) {
	if (this.length) {
		if (scrollAnimationTimeout)
			clearTimeout(scrollAnimationTimeout);

		const scrollStart = window.scrollY;
		const scrollEnd = this.offset().top - (offset || 0);

		const animationDelay = 10;
		const animationCount = 40;
		let animationPosition = 0;
		animate();
		
		function animate() {
			if (++animationPosition <= animationCount) {
				const r = Math.sin(animationPosition / animationCount * Math.PI / 2);
				const pos = scrollStart + (scrollEnd - scrollStart) * r;
				$(window).scrollTop(pos);
				scrollAnimationTimeout = setTimeout(animate, animationDelay);
			}
		}
	}
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
// capture: Specifies the capture option. If true, DOM addEventListener is used instead of jQuery.
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
