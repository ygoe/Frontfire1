import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, installDisabledchangeHook } from "../util";

var resizableClass = "ff-resizable";

// Defines default options for the resizable plugin.
var resizableDefaults = {
	// The aspect ratio (x/y) to maintain during resizing, or true to maintain the initial aspect ratio. Default: None.
	aspectRatio: undefined,

	// The resizing handles to use. Can be "all" or a combination of "n,ne,e,se,s,sw,w,nw". Default: All.
	handles: undefined,

	// Constrains the resizing inside the specified element or the "parent" of the resized element. Default: None.
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
	maxHeight: undefined
};

// Makes each selected element resizable.
function resizable(options) {
	return this.each(function () {
		var elem = this;
		var $elem = $(elem);
		if ($elem.hasClass(resizableClass)) return;   // Already done
		$elem.addClass(resizableClass);
		var htmlCursor;
		var handleElements = $();
		var opt = initOptions("resizable", resizableDefaults, $elem, {}, options);

		var aspectRatio = opt.aspectRatio;
		if (aspectRatio === true || aspectRatio === "true") aspectRatio = $elem.outerWidth() / $elem.outerHeight();
		if ($.isNumeric(aspectRatio)) aspectRatio = parseFloat(aspectRatio);
		if (aspectRatio === 0 || !isFinite(aspectRatio) || !$.isNumber(aspectRatio)) aspectRatio = undefined;

		if ($elem.css("position") === "static")
			$elem.css("position", "relative");

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
			if (optHandles.indexOf("n") !== -1)
				addHandle({ left: 5, right: 5, top: -5, height: 10 }, vCursor, true, true);   // Top edge
			if (optHandles.indexOf("e") !== -1)
				addHandle({ top: 5, bottom: 5, right: -5, width: 10 }, hCursor, false, false);   // Right edge
			if (optHandles.indexOf("s") !== -1)
				addHandle({ left: 5, right: 5, bottom: -5, height: 10 }, vCursor, true, false);   // Bottom edge
			if (optHandles.indexOf("w") !== -1)
				addHandle({ top: 5, bottom: 5, left: -5, width: 10 }, hCursor, false, true);   // Left edge

			if (optHandles.indexOf("ne") !== -1)
				addHandle({ right: -5, top: -5, width: 10, height: 10 }, neCursor, false, false, true, true);   // Top right corner
			if (optHandles.indexOf("se") !== -1)
				addHandle({ right: -5, bottom: -5, width: 10, height: 10 }, nwCursor, false, false, true, false);   // Bottom right corner
			if (optHandles.indexOf("sw") !== -1)
				addHandle({ left: -5, bottom: -5, width: 10, height: 10 }, neCursor, false, true, true, false);   // Bottom left corner
			if (optHandles.indexOf("nw") !== -1)
				addHandle({ left: -5, top: -5, width: 10, height: 10 }, nwCursor, false, true, true, true);   // Top left corner
		}

		installDisabledchangeHook();
		$elem.on("disabledchange", function () {
			handleElements.visible(!$elem.disabled());
		});

		function addHandle(style, cursor, vertical, negative, vertical2, negative2) {
			var handle = $("<div/>")
				.addClass("ff-resizable-handle " + opt.handleAddClass)
				.css(style)
				.css("position", "absolute")
				.css("cursor", cursor);
			$elem.append(handle);
			handleElements = handleElements.add(handle);
			handle.draggable();
			handle.on("draggablestart", function (event) {
				htmlCursor = document.documentElement.style.getPropertyValue("cursor");
				document.documentElement.style.setProperty("cursor", cursor, "important");
			});
			handle.on("draggablemove", function (event) {
				event.preventDefault();   // The handles already move with the element, don't touch their position
				resize(handle, event.newPoint, vertical, negative);
				if (vertical2 !== undefined)
					resize(handle, event.newPoint, vertical2, negative2);
			});
			handle.on("draggableend", function (event) {
				document.documentElement.style.setProperty("cursor", htmlCursor);
			});
			return handle;
		}

		function resize(handle, newPoint, vertical, negative) {
			var side = vertical ? "top" : "left";
			var extent = vertical ? "Height" : "Width";
			var extentLower = extent.toLowerCase();
			var delta = newPoint[side] - handle.offset()[side];
			if (negative) delta = -delta;

			var newElemOffset = $elem.offset();
			var step = opt.grid ? opt.grid[vertical ? 1 : 0] : 1;

			if (opt.grid) {
				let gridBase = $elem.parent().offset();
				if (negative) {
					delta = newElemOffset[side] - (Math.round(((newElemOffset[side] - delta) - gridBase[side]) / step) * step + gridBase[side]);
				}
				else {
					let length = $elem["outer" + extent]();
					delta = Math.round(((newElemOffset[side] + length + delta) - gridBase[side]) / step) * step + gridBase[side] - (newElemOffset[side] + length);
				}
			}

			var newLength = $elem["outer" + extent]() + delta;

			let minLength = Math.max($elem["outer" + extent]() - $elem[extentLower](), opt["min" + extent] || 0);
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
				let cont;
				if (opt.containment === "parent")
					cont = $elem.parent();
				else
					cont = $(opt.containment);
				if (cont.length !== 0) {
					let contRect = cont.rect();
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

			$elem["outer" + extent](newLength);
			if (negative) $elem.offset(newElemOffset);
		}
	});
}

registerPlugin("resizable", resizable);
$.fn.resizable.defaults = resizableDefaults;
