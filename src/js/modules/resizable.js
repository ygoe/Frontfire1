import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, installDisabledchangeHook } from "../util";

var resizableClass = "ff-resizable";

// Defines default options for the resizable plugin.
var resizableDefaults = {
	// The aspect ratio (x/y) to maintain during resizing, or true to maintain the initial aspect ratio. Default: None.
	aspectRatio: undefined,

	// The resizing handles to use. Can be "all" or a combination of "n,ne,e,se,s,sw,w,nw". Default: All.
	handles: undefined,
	
	// The width of the default handles. Default: 10.
	handleWidth: 10,

	// Constrains the resizing inside the specified element or the "parent" of the resized element or the "viewport". Default: None.
	containment: undefined,

	// The grid to snap the resized element to during resizing, as [x, y] in pixels. Default: [1, 1].
	grid: undefined,

	// The minimum width to keep during resizing. Default: None.
	minWidth: undefined,

	// The minimum height to keep during resizing. Default: None.
	minHeight: undefined,

	// The maximum width to keep during resizing. Default: None.
	maxWidth: undefined,

	// The maximum height to keep during resizing. Default: None.
	maxHeight: undefined,

	// Indicates whether the window should scroll to keep the resized edge visible. Default: false.
	scroll: false
};

// Makes each selected element resizable.
function resizable(options) {
	return this.each$(function (_, elem) {
		if (elem.hasClass(resizableClass)) return;   // Already done
		elem.addClass(resizableClass);
		var handleElements = $();
		var opt = initOptions("resizable", resizableDefaults, elem, {}, options);
		let $window = $(window);

		var aspectRatio = opt.aspectRatio;
		if (aspectRatio === true || aspectRatio === "true") aspectRatio = elem.outerWidth() / elem.outerHeight();
		if ($.isNumeric(aspectRatio)) aspectRatio = parseFloat(aspectRatio);
		if (aspectRatio === 0 || !isFinite(aspectRatio) || !$.isNumber(aspectRatio)) aspectRatio = undefined;

		if (elem.css("position") === "static") {
			opt.wasPositionStatic = true;
			elem.css("position", "relative");
		}

		var optHandles = opt.handles;
		if (optHandles === undefined)
			optHandles = "all";
		if (optHandles === "all")
			optHandles = "n,ne,e,se,s,sw,w,nw";
		if ($.isString(optHandles))
			optHandles = optHandles.replace(/\s/g, "").toLowerCase().split(",");
		opt.handles = optHandles;

		var vCursor = "ns-resize";
		var hCursor = "ew-resize";
		var nwCursor = "nwse-resize";
		var neCursor = "nesw-resize";

		if (opt.handleAddClass === "box") {
			if (optHandles.indexOf("n") !== -1)
				addHandle({ left: "calc(50% - 4px)", top: -9 }, vCursor, true, true);   // Top edge
			if (optHandles.indexOf("e") !== -1)
				addHandle({ right: -9, top: "calc(50% - 4px)" }, hCursor, false, false);   // Right edge
			if (optHandles.indexOf("s") !== -1)
				addHandle({ left: "calc(50% - 4px)", bottom: -9 }, vCursor, true, false);   // Bottom edge
			if (optHandles.indexOf("w") !== -1)
				addHandle({ left: -9, top: "calc(50% - 4px)" }, hCursor, false, true);   // Left edge

			if (optHandles.indexOf("ne") !== -1)
				addHandle({ top: -9, right: -9 }, neCursor, false, false, true, true);   // Top right corner
			if (optHandles.indexOf("se") !== -1)
				addHandle({ bottom: -9, right: -9 }, nwCursor, false, false, true, false);   // Bottom right corner
			if (optHandles.indexOf("sw") !== -1)
				addHandle({ bottom: -9, left: -9 }, neCursor, false, true, true, false);   // Bottom left corner
			if (optHandles.indexOf("nw") !== -1)
				addHandle({ top: -9, left: -9 }, nwCursor, false, true, true, true);   // Top left corner
		}
		else {
			let w = opt.handleWidth;
			if (optHandles.indexOf("n") !== -1)
				addHandle({ left: w / 2, right: w / 2, top: -w / 2, height: w }, vCursor, true, true);   // Top edge
			if (optHandles.indexOf("e") !== -1)
				addHandle({ top: w / 2, bottom: w / 2, right: -w / 2, width: w }, hCursor, false, false);   // Right edge
			if (optHandles.indexOf("s") !== -1)
				addHandle({ left: w / 2, right: w / 2, bottom: -w / 2, height: w }, vCursor, true, false);   // Bottom edge
			if (optHandles.indexOf("w") !== -1)
				addHandle({ top: w / 2, bottom: w / 2, left: -w / 2, width: w }, hCursor, false, true);   // Left edge

			if (optHandles.indexOf("ne") !== -1)
				addHandle({ right: -w / 2, top: -w / 2, width: w, height: w }, neCursor, false, false, true, true);   // Top right corner
			if (optHandles.indexOf("se") !== -1)
				addHandle({ right: -w / 2, bottom: -w / 2, width: w, height: w }, nwCursor, false, false, true, false);   // Bottom right corner
			if (optHandles.indexOf("sw") !== -1)
				addHandle({ left: -w / 2, bottom: -w / 2, width: w, height: w }, neCursor, false, true, true, false);   // Bottom left corner
			if (optHandles.indexOf("nw") !== -1)
				addHandle({ left: -w / 2, top: -w / 2, width: w, height: w }, nwCursor, false, true, true, true);   // Top left corner
		}

		installDisabledchangeHook();
		elem.on("disabledchange.resizable", function () {
			handleElements.visible(!elem.disabled());
		});

		function addHandle(style, cursor, vertical, negative, vertical2, negative2) {
			var handle = $("<div/>")
				.addClass("ff-resizable-handle " + opt.handleAddClass)
				.css(style)
				.css("position", "absolute")
				.css("cursor", cursor);
			elem.append(handle);
			handleElements = handleElements.add(handle);
			handle.draggable({ scroll: opt.scroll, dragCursor: cursor });
			handle.on("draggablestart", function (event) {
				event.stopPropagation();   // Don't trigger for the resized (parent) element
				let event2 = elem.triggerNative("resizablestart", {
					vertical: vertical,
					negative: negative,
					edge: vertical ? (negative ? "top" : "bottom") : (negative ? "left" : "right")
				});
				if (event2.defaultPrevented) {
					event.preventDefault();
				}
			});
			handle.on("draggablemove", function (event) {
				event.stopPropagation();   // Don't trigger for the resized (parent) element
				event.preventDefault();   // The handles already move with the element, don't touch their position
				resize(handle, event.originalEvent.newPoint, vertical, negative);
				if (vertical2 !== undefined)
					resize(handle, event.originalEvent.newPoint, vertical2, negative2);
			});
			handle.on("draggableend", function (event) {
				event.stopPropagation();   // Don't trigger for the resized (parent) element
				elem.triggerNative("resizableend", {
					vertical: vertical,
					negative: negative,
					edge: vertical ? (negative ? "top" : "bottom") : (negative ? "left" : "right")
				});
			});
			return handle;
		}

		function resize(handle, newPoint, vertical, negative) {
			var side = vertical ? "top" : "left";
			var extent = vertical ? "Height" : "Width";
			var extentLower = extent.toLowerCase();
			var delta = newPoint[side] - handle.offset()[side];
			if (negative) delta = -delta;

			var newElemOffset = elem.offset();
			var step = opt.grid ? opt.grid[vertical ? 1 : 0] : 1;

			if (opt.grid) {
				let gridBase = elem.parent().offset();
				if (negative) {
					delta = newElemOffset[side] - (Math.round(((newElemOffset[side] - delta) - gridBase[side]) / step) * step + gridBase[side]);
				}
				else {
					let length = elem["outer" + extent]();
					delta = Math.round(((newElemOffset[side] + length + delta) - gridBase[side]) / step) * step + gridBase[side] - (newElemOffset[side] + length);
				}
			}

			var newLength = elem["outer" + extent]() + delta;

			let minLength = Math.max(elem["outer" + extent]() - elem[extentLower](), opt["min" + extent] || 0);
			while (newLength < minLength) {
				delta += step;
				newLength += step;
			}
			let maxLength = opt["max" + extent];
			while (maxLength && newLength > maxLength) {
				delta -= step;
				newLength -= step;
			}

			if (negative) newElemOffset[side] -= delta;

			if (opt.containment) {
				let cont, contRect;
				if (opt.containment === "parent") {
					cont = elem.parent();
				}
				else if (opt.containment === "viewport") {
					let scrollTop = $window.scrollTop();
					let scrollLeft = $window.scrollLeft();
					contRect = {
						top: 0 + scrollTop,
						left: 0 + scrollLeft,
						height: $window.height(),
						width: $window.width()
					};
				}
				else {
					cont = $(opt.containment);
				}
				if (cont && cont.length > 0) {
					contRect = cont.rect();
				}
				if (contRect) {
					if (negative) {
						while (newElemOffset[side] < contRect[side]) {
							newElemOffset[side] += step;
							delta -= step;
							newLength -= step;
						}
					}
					else {
						while (newElemOffset[side] + newLength > contRect[side] + contRect[extentLower]) {
							delta -= step;
							newLength -= step;
						}
					}
				}
			}

			let event2 = elem.triggerNative("resizing", {
				vertical: vertical,
				negative: negative,
				edge: vertical ? (negative ? "top" : "bottom") : (negative ? "left" : "right"),
				newLength: newLength,
				newPosition: newElemOffset[side]
			});
			if (!event2.defaultPrevented) {
				elem["outer" + extent](event2.newLength);
				newElemOffset[side] = event2.newPosition;
				if (negative) elem.offset(newElemOffset);
			}
		}
	});
}

// Removes the resizing features from the elements.
function remove() {
	return this.each$(function (_, elem) {
		if (!elem.hasClass(resizableClass)) return;
		elem.removeClass(resizableClass);
		var opt = loadOptions("resizable", elem);
		if (opt.wasPositionStatic)
			elem.css("position", "static");
		elem.find(".ff-resizable-handle").remove();
		elem.off("disabledchange.resizable");
	});
}

registerPlugin("resizable", resizable, {
	remove: remove
});
$.fn.resizable.defaults = resizableDefaults;
