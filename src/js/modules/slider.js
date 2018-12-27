import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, installDisabledchangeHook } from "../util";

var rangeClass = "ff-range";
var ticksClass = "ff-ticks";
var handleClass = "ff-handle";
var resetAllCursorsClass = "reset-all-cursors";

// Defines default options for the slider plugin.
var sliderDefaults = {
	// The orientation of the slider, either "h" or "v". Default: "h".
	orientation: "h",

	// The current value of the slider. Default: 0.
	value: 0,

	// The current values of the slider. Overrides the single value option. Default: null.
	values: null,

	// The minimum value of the slider range. Default: 0.
	min: 0,

	// The maximum value of the slider range. Default: 100.
	max: 100,

	// The base value of the range rectangle ("min", "max", any value e.g. 0). Default: "min".
	rangeBase: 0,

	// The large step of the slider. Default: 10.
	largeStep: 10,

	// The small step of the slider. Default: 1.
	smallStep: 1,

	// Indicates whether the large step ticks are visible. Default: true.
	largeTicks: true,

	// Indicates whether the small step ticks are visible. Default: false.
	smallTicks: false,

	// Indicates whether the large step ticks have their value as label. Default: true.
	largeTickLabels: true,

	// Indicates whether the small step ticks have their value as label. Default: false.
	smallTickLabels: false,

	// The location of the tick marks in the slider ("topleft", "bottomright", "both", "none"). Default: "topleft".
	tickPlacement: "topleft",

	// The number of slider handles. Default: 1.
	handleCount: 1,

	// How multiple handles interact with each other while dragging ("locked", "push", "free"). Default: "locked".
	handleInteractionMode: "locked",

	// Overflow the range if the two handles have the same value. Default: false.
	rangeOverflowEqual: false,

	// Individual ranges. Overrides the rangeBase option and two-handle range behaviour. Default: null.
	// Each range object has the properties: start, end, overflowEqual, color, className.
	// start and end can be fixed values, "min"/"max", or zero-based handle references prefixed with "#".
	ranges: null,

	// Indicates whether the slider has a logarithmic scale. Default: false.
	logarithmic: false,   // TODO

	// The mouse cursor to show during dragging the slider. Default: None.
	dragCursor: undefined
};

// Creates a slider widget.
function slider(options) {
	return this.each(function () {
		var slider = $(this);
		if (slider.children("div." + handleClass).length !== 0) return;   // Already done
		var opt = initOptions("slider", sliderDefaults, slider, {}, options);
		var htmlCursor, draggedHandleCursor;
		var dragHandleOffset = [], dragHandlePointerId = [];
		var lastTouchedHandleIndex = 0;
		var isVertical = opt.orientation === "v";
		var sliderBorder;
		var initialTabindex;

		opt._setValue = setValue;

		if (!opt.values) opt.values = [opt.value];
		if (opt.max < opt.min) opt.max = opt.min;
		if (opt.handleCount < 1) opt.handleCount = 1;

		// Create 1 pair of ranges by default; more only if individually specified
		var ranges = [];
		for (let index = 0; index < Math.max(1, opt.ranges && opt.ranges.length); index++) {
			ranges[index * 2] = $("<div/>").addClass(rangeClass).appendTo(slider);
			ranges[index * 2 + 1] = $("<div/>").addClass(rangeClass).appendTo(slider);
		}
		if (opt.ranges) {
			opt.ranges.forEach(function (rangeItem, index) {
				if (rangeItem.color) {
					ranges[index * 2].css("background", rangeItem.color);
					ranges[index * 2 + 1].css("background", rangeItem.color);
				}
				if (rangeItem.className) {
					ranges[index * 2].addClass(rangeItem.className);
					ranges[index * 2 + 1].addClass(rangeItem.className);
				}
			});
		}

		// Create ticks layer, it will contain the actual ticks with their labels
		var ticks = $("<div/>").addClass(ticksClass).appendTo(slider);

		// Create handles
		// Also keep them in a jQuery collection to add events to
		var handles = [], $handles = $();
		for (let index = 0; index < opt.handleCount; index++) {
			handles[index] = $("<div/>").addClass(handleClass).appendTo(slider);
			$handles = $handles.add(handles[index]);
		}

		// Use precision to avoid ugly JavaScript floating point rounding issues
		// (like 35 * 0.01 = 0.35000000000000003)
		var decimals = -Math.floor(Math.log10(opt.smallStep));

		var rangeBaseValue = opt.rangeBase;
		if (rangeBaseValue === "min") rangeBaseValue = opt.min;
		if (rangeBaseValue === "max") rangeBaseValue = opt.max;
		rangeBaseValue = minmax(rangeBaseValue, opt.min, opt.max);
		var rangeBasePos = Math.round((rangeBaseValue - opt.min) / (opt.max - opt.min) * 10000) / 100;

		var startAttr, endAttr;
		var handleLength;   // Length of the handle in drag direction

		if (isVertical) {
			startAttr = "bottom";
			endAttr = "top";
			slider.addClass("vertical");
			sliderBorder = (slider.outerHeight() - slider.innerHeight()) / 2;
			handleLength = handles[0].outerHeight();
		}
		else {
			startAttr = "left";
			endAttr = "right";
			slider.removeClass("vertical");
			sliderBorder = (slider.outerWidth() - slider.innerWidth()) / 2;
			handleLength = handles[0].outerWidth();
		}
		for (let index = 0; index < opt.handleCount; index++) {
			resetDragHandleOffset(index);
			setValue(index, opt.values[index]);
		}

		// Draw ticks
		if (opt.smallTicks || opt.largeTicks) {
			var minTick = Math.ceil(opt.min / opt.smallStep) * opt.smallStep;
			for (let value = minTick; value <= opt.max; value += opt.smallStep) {
				value = round(value, decimals);
				let large = value / opt.largeStep === Math.trunc(value / opt.largeStep);
				if (!large && !opt.smallTicks) continue;

				let pos = Math.round((value - opt.min) / (opt.max - opt.min) * 10000) / 100;
				let tickArr = $();
				if (opt.tickPlacement === "both" || opt.tickPlacement === "topleft") {
					tickArr = tickArr.add($("<div/>").css(startAttr, pos + "%").appendTo(ticks));
				}
				if (opt.tickPlacement === "both" || opt.tickPlacement === "bottomright") {
					tickArr = tickArr.add($("<div/>").addClass("opposite").css(startAttr, pos + "%").appendTo(ticks));
				}
				if (large) {
					tickArr.addClass("large");
				}
				if (opt.smallTickLabels || opt.largeTickLabels && large) {
					tickArr.attr("data-label", value);
				}
			}
		}

		// Allow Pointer API to work properly in Edge
		slider.css("touch-action", "none");

		var eventRemovers = [];
		$handles.pointer("down", function (event) {
			event.preventDefault();

			// Select touched handle
			var handle = $(event.target).closest("." + handleClass);
			var index = $.inArray(handle[0], $handles);
			if (index === -1) {
				console.warn("Clicked handle not found");
				return;   // Should not happen: handle not found
			}

			// Remember where the handle was dragged (probably not exactly the center)
			if (isVertical)
				dragHandleOffset[index] = handles[index].offset().top + handles[index].outerHeight() - event.pageY;
			else
				dragHandleOffset[index] = event.pageX - handles[index].offset().left;

			draggedHandleCursor = handles[index].actualCursor();
		});
		slider.pointer("down", function (event) {
			if (slider.disabled()) return;
			if (event.button === 0) {
				event.preventDefault();
				event.stopImmediatePropagation();
				slider.focus();

				var isFirstDrag = true;
				dragHandlePointerId.forEach(function (item) {
					if (item !== undefined) isFirstDrag = false;
				});
				if (isFirstDrag)
					slider.trigger("firstdragstart");

				// Select touched or nearest handle and remember by pointerId
				var handle = $(event.target).closest("." + handleClass);
				var index = $.inArray(handle[0], $handles);
				if (index === -1) {
					// Not clicked on a handle.
					// Find nearest handle, prefer same direction (for locked handles on the same value)
					var pointerValue = getValueFromEvent(event);
					var minValueDistance = Infinity;
					opt.values.forEach(function (value, valueIndex) {
						var valueDistance = Math.abs(value - pointerValue);
						if (valueDistance < minValueDistance ||
							pointerValue > value && valueDistance <= minValueDistance) {
							minValueDistance = valueDistance;
							index = valueIndex;
						}
					});
				}
				dragHandlePointerId[index] = event.pointerId;
				lastTouchedHandleIndex = index;

				handles[index].addClass("pressed");
				onMove(event);

				if (isFirstDrag) {
					slider.setCapture && slider.setCapture();   // Firefox only (set cursor over entire desktop)
					$("html").addClass(resetAllCursorsClass);   // All browsers (set cursor at least within page)
					htmlCursor = document.documentElement.style.getPropertyValue("cursor");
					document.documentElement.style.setProperty("cursor", opt.dragCursor || draggedHandleCursor || slider.actualCursor(), "important");

					eventRemovers.push($(window).pointer("move", onMove, true));
					eventRemovers.push($(window).pointer("up cancel", onEnd, true));
				}
			}
		});

		// Make the element focusable if not already specified
		initialTabindex = slider.attr("tabindex");
		if (initialTabindex === undefined) {
			initialTabindex = "0";
			slider.attr("tabindex", initialTabindex);
		}

		// Make the element unfocusable when disabled
		installDisabledchangeHook();
		slider.on("disabledchange", function () {
			if (slider.disabled()) {
				slider.removeAttr("tabindex");
			}
			else {
				slider.attr("tabindex", initialTabindex);
			}
		});

		slider.keydown(onKeydown);

		// TODO: Trigger "remove" event for DOM elements being removed, like jQuery UI overrides $.cleanData (once!)
		// TODO: slider.on("remove", /* cancel current drag operation and remove all events */) - also in other widgets!

		function onMove(event) {
			// Select dragged handle from pointerId
			var index = dragHandlePointerId.indexOf(event.pointerId);
			if (index === -1) return;   // Not my pointer

			var value = getValueFromEvent(event);

			if (opt.handleCount > 1) {
				switch (opt.handleInteractionMode) {
					case "locked":
						if (index > 0 && value < opt.values[index - 1])
							value = opt.values[index - 1];
						if (index < opt.handleCount - 1 && value > opt.values[index + 1])
							value = opt.values[index + 1];
						break;

					case "push":
						for (let otherIndex = index - 1; otherIndex >= 0; otherIndex--) {
							if (value < opt.values[otherIndex])
								setValue(otherIndex, value);
						}
						for (let otherIndex = index + 1; otherIndex < opt.handleCount; otherIndex++) {
							if (value > opt.values[otherIndex])
								setValue(otherIndex, value);
						}
						break;
				}
			}

			setValue(index, value);
		}

		function onEnd(event) {
			// Select dragged handle from pointerId
			var index = dragHandlePointerId.indexOf(event.pointerId);
			if (index === -1) return;   // Not my pointer

			if (event.button === 0) {
				dragHandlePointerId[index] = undefined;
				handles[index].removeClass("pressed");
				resetDragHandleOffset(index);

				var isLastDrag = true;
				dragHandlePointerId.forEach(function (item) {
					if (item !== undefined) isLastDrag = false;
				});
				if (isLastDrag) {
					slider.releaseCapture && slider.releaseCapture();
					$("html").removeClass(resetAllCursorsClass);
					document.documentElement.style.setProperty("cursor", htmlCursor);

					eventRemovers.forEach(function (eventRemover) { eventRemover(); });
					eventRemovers = [];

					slider.trigger("lastdragend");
				}
			}
		}

		function onKeydown(event) {
			if (slider.disabled()) return;
			if (event.keyCode === 40 || event.keyCode === 37) {   // Down, Left
				event.preventDefault();
				setValue(lastTouchedHandleIndex, opt.values[lastTouchedHandleIndex] - (event.shiftKey ? opt.largeStep : opt.smallStep));
			}
			if (event.keyCode === 38 || event.keyCode === 39) {   // Up, Right
				event.preventDefault();
				setValue(lastTouchedHandleIndex, opt.values[lastTouchedHandleIndex] + (event.shiftKey ? opt.largeStep : opt.smallStep));
			}
			if (event.keyCode === 36) {   // Home
				event.preventDefault();
				setValue(lastTouchedHandleIndex, opt.min);
			}
			if (event.keyCode === 35) {   // End
				event.preventDefault();
				setValue(lastTouchedHandleIndex, opt.max);
			}
		}

		// Gets the slider value from the coordinates of a pointer event.
		function getValueFromEvent(event) {
			// Select dragged handle from pointerId
			var index = dragHandlePointerId.indexOf(event.pointerId);

			// Assume center click if pointer is unknown
			var myDragHandleOffset = handleLength / 2;
			if (index !== -1) myDragHandleOffset = dragHandleOffset[index];

			var sliderRect = slider.rect();
			var pointerPosIntoSlider;   // Distance from min end of the slider to the pointer
			var sliderLength;   // Length of the slider in drag direction
			if (isVertical) {
				pointerPosIntoSlider = sliderRect.bottom - sliderBorder - event.pageY;
				sliderLength = slider.innerHeight();
			}
			else {
				pointerPosIntoSlider = event.pageX - sliderRect.left - sliderBorder;
				sliderLength = slider.innerWidth();
			}

			var handleCenterPos = pointerPosIntoSlider - myDragHandleOffset + handleLength / 2;   // Position of the handle's center
			var value = handleCenterPos / sliderLength * (opt.max - opt.min) + opt.min;   // Selected value
			return value;
		}

		// Sets a slider value and triggers the change event. Also moves the handle.
		function setValue(index, value) {
			value = minmax(value, opt.min, opt.max);
			value = Math.round(value / opt.smallStep) * opt.smallStep;   // Snap to steps
			value = round(value, decimals);
			moveHandle(index, value);
			if (value !== opt.values[index]) {
				opt.values[index] = value;
				slider.trigger("valuechange");   // TODO: Indicate the changed value index
			}
		}

		// Moves a handle to the specified slider value and updates the ranges.
		function moveHandle(index, value) {
			var pos = getPosFromValue(value);
			handles[index].css(startAttr, "calc(" + pos + "% - " + (handleLength / 2) + "px)");

			// Also update ranges
			if (opt.ranges) {
				opt.ranges.forEach(function (rangeItem, rangeIndex) {
					var start = rangeItem.start, startHandleIndex;
					if (start === "min") {
						start = opt.min;
					}
					else if (start === "max") {
						start = opt.max;
					}
					else if (start[0] === "#") {
						startHandleIndex = Number(start.substr(1));
						start = startHandleIndex === index ? value : opt.values[startHandleIndex];
					}
					var end = rangeItem.end, endHandleIndex;
					if (end === "min") {
						end = opt.min;
					}
					else if (end === "max") {
						end = opt.max;
					}
					else if (end[0] === "#") {
						endHandleIndex = Number(end.substr(1));
						end = endHandleIndex === index ? value : opt.values[endHandleIndex];
					}
					var startPos = getPosFromValue(start);
					var endPos = getPosFromValue(end);
					var overflowEqual = rangeItem.overflowEqual ||
						startHandleIndex !== undefined && endHandleIndex !== undefined && endHandleIndex < startHandleIndex;
					setRange(rangeIndex, startPos, endPos, overflowEqual);
				});
			}
			else if (opt.handleCount === 1) {
				if (pos < rangeBasePos)
					setRange(0, pos, rangeBasePos);
				else
					setRange(0, rangeBasePos, pos);
			}
			else if (opt.handleCount === 2) {
				var pos0 = index === 0 ? pos : getPosFromValue(opt.values[0]);
				var pos1 = index === 1 ? pos : getPosFromValue(opt.values[1]);
				setRange(0, pos0, pos1, opt.rangeOverflowEqual);
			}
		}

		// Sets the size of a range element for a start and end value, supporting overflow.
		function setRange(index, start, end, overflowEqual) {
			if (start < end || start === end && !overflowEqual) {
				// Only one contiguous range, hide the second element
				ranges[index * 2].css(startAttr, start + "%");
				ranges[index * 2].css(endAttr, (100 - end) + "%");
				ranges[index * 2 + 1].css(startAttr, "0%");
				ranges[index * 2 + 1].css(endAttr, "100%");
			}
			else {
				// Overflow range, split in two elements from either end of the slider
				ranges[index * 2].css(startAttr, "0%");
				ranges[index * 2].css(endAttr, (100 - end) + "%");
				ranges[index * 2 + 1].css(startAttr, start + "%");
				ranges[index * 2 + 1].css(endAttr, "0%");
			}
		}

		// Returns the relative position in percent from the slider value.
		function getPosFromValue(value) {
			var pos = Math.round((value - opt.min) / (opt.max - opt.min) * 10000) / 100;
			return pos;
		}

		// Resets the drag offset as if the handle was dragged exactly in the middle.
		function resetDragHandleOffset(index) {
			dragHandleOffset[index] = handleLength / 2;
		}
	});
}

// Gets the current slider value.
//
// value: Sets the slider value.
function sliderValue(value) {
	return this.slider.multivalue(0, value);
}

// Gets the current value of the specified slider handle.
//
// value: Sets the value of the specified slider handle.
function sliderMultiValue(index, value) {
	// Getter
	if (value === undefined) {
		var slider = this.first();
		if (slider.length === 0) return;   // Nothing to do
		var opt = loadOptions("slider", slider);
		return opt.values[index];
	}

	// Setter
	return this.each(function () {
		var slider = $(this);
		var opt = loadOptions("slider", slider);
		opt._setValue(index, value);
	});
}

registerPlugin("slider", slider, {
	value: sliderValue,
	multivalue: sliderMultiValue
});
$.fn.slider.defaults = sliderDefaults;
