import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

var draggableClass = "ff-draggable";
var resetAllCursorsClass = "reset-all-cursors";

// Defines default options for the draggable plugin.
var draggableDefaults = {
	// The element(s) that can start a drag operation. Default: The element to drag.
	handle: undefined,

	// The element(s) that cannot start a drag operation. Default: None.
	cancel: undefined,

	// Constrains the drag movement along the "x" or "y" axis. Default: None.
	axis: undefined,

	// Constrains the drag movement inside the specified element or the "parent" of the dragged element or the "viewport". Default: None.
	containment: undefined,

	// The elements among which the dragged element will be pulled in the front. Default: None.
	stack: undefined,

	// The mouse cursor to show during dragging. Default: None.
	dragCursor: undefined,

	// A CSS class to add to the element while it's being dragged. Default: None.
	dragClass: undefined,

	// The grid to snap the dragged element to during dragging, as [x, y] in pixels. Default: [1, 1].
	grid: undefined,

	// Indicates whether the window should scroll to keep the dragged element visible. Default: false.
	scroll: false
};

// Makes each selected element draggable.
function draggable(options) {
	return this.each(function () {
		var elem = this;
		var $elem = $(elem);
		if ($elem.hasClass(draggableClass)) return;   // Already done
		$elem.addClass(draggableClass);
		var dragging, draggingCancelled, dragPoint, elemRect, minDragDistance, pointerId, htmlCursor;
		var opt = initOptions("draggable", draggableDefaults, $elem, {}, options);
		let $window = $(window);

		var handle = opt.handle ? $elem.find(opt.handle) : $elem;
		opt.handleElem = handle;

		// Allow Pointer API to work properly in Edge
		opt.originalTouchAction = handle.css("touch-action");
		if (opt.axis === "x")
			handle.css("touch-action", "pan-y pinch-zoom");
		else if (opt.axis === "y")
			handle.css("touch-action", "pan-x pinch-zoom");
		else
			handle.css("touch-action", "pinch-zoom");

		opt.eventRemovers = [];
		var eventRemovers = [];
		opt.eventRemovers.push(handle.pointer("down", function (event) {
			if (event.button === 0) {
				event.preventDefault();
				event.stopImmediatePropagation();
				if (dragging) return;
				draggingCancelled = false;
				dragPoint = { left: event.pageX, top: event.pageY };
				pointerId = event.pointerId;
				minDragDistance = event.pointerType === "touch" ? 8 : 4;
				eventRemovers.push($window.pointer("move", onMove, true));
				eventRemovers.push($window.pointer("up cancel", onEnd, true));
			}
		}));

		if (opt.cancel) {
			opt.eventRemovers.push($elem.find(opt.cancel).pointer("down", function (event) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}));
		}

		function onMove(event) {
			if (event.pointerId !== pointerId) return;   // Not my pointer
			if (draggingCancelled) return;   // Don't try again until the button was released

			// Consider starting a drag operation
			if (dragPoint && !dragging && !$elem.disabled()) {
				let distance = Math.sqrt(Math.pow(event.pageX - dragPoint.left, 2) + Math.pow(event.pageY - dragPoint.top, 2));
				if (distance >= minDragDistance) {
					elemRect = $elem.rect();
					let event2 = $.Event("draggablestart");
					event2.dragPoint = dragPoint;
					event2.newPoint = { left: event.pageX, top: event.pageY };
					$elem.trigger(event2);
					if (!event2.isDefaultPrevented()) {
						dragging = true;
						opt.dragClass && $elem.addClass(opt.dragClass);
						elem.setCapture && elem.setCapture();   // Firefox only (set cursor over entire desktop)
						$("html").addClass(resetAllCursorsClass);   // All browsers (set cursor at least within page)
						if (opt.stack) {
							stackElements($(opt.stack), elem);
						}
						htmlCursor = document.documentElement.style.getPropertyValue("cursor");
						document.documentElement.style.setProperty("cursor", opt.dragCursor || $elem.actualCursor(), "important");
					}
					else {
						draggingCancelled = true;
					}
				}
			}

			// Handle an ongoing drag operation
			if (dragging) {
				// Start with the default drag movement position
				var newPoint = {
					top: elemRect.top + event.pageY - dragPoint.top,
					left: elemRect.left + event.pageX - dragPoint.left
				};

				// Consider constraints
				if (opt.grid) {
					let gridBase = $elem.parent().offset();
					newPoint = {
						top: Math.round((newPoint.top - gridBase.top) / opt.grid[1]) * opt.grid[1] + gridBase.top,
						left: Math.round((newPoint.left - gridBase.left) / opt.grid[0]) * opt.grid[0] + gridBase.left
					};
				}
				if (opt.axis === "x") {
					newPoint.top = elemRect.top;
				}
				if (opt.axis === "y") {
					newPoint.left = elemRect.left;
				}
				if (opt.containment) {
					let cont, contRect;
					if (opt.containment === "parent") {
						cont = $elem.parent();
					}
					else if (opt.containment === "viewport") {
						let scrollTop = $window.scrollTop();
						let scrollLeft = $window.scrollLeft();
						contRect = {
							top: 0 + scrollTop,
							left: 0 + scrollLeft,
							bottom: $window.height() + scrollTop,
							right: $window.width() + scrollLeft
						};
					}
					else {
						cont = $(opt.containment);
					}
					if (cont && cont.length > 0) {
						contRect = cont.rect();
					}
					if (contRect) {
						let stepX = opt.grid ? opt.grid[0] : 1;
						let stepY = opt.grid ? opt.grid[1] : 1;
						while (newPoint.left < contRect.left) newPoint.left += stepX;
						while (newPoint.left + elemRect.width > contRect.right) newPoint.left -= stepX;
						while (newPoint.top < contRect.top) newPoint.top += stepY;
						while (newPoint.top + elemRect.height > contRect.bottom) newPoint.top -= stepY;
					}
				}

				// Move element
				let event2 = $.Event("draggablemove");
				event2.elemRect = elemRect;
				event2.newPoint = newPoint;
				$elem.trigger(event2);
				if (!event2.isDefaultPrevented()) {
					$elem.offset(event2.newPoint);
				}

				// Handle auto-scrolling
				if (opt.scroll) {
					scrollIntoView($elem.rect());
				}
			}
		}

		function onEnd(event) {
			if (event.pointerId !== pointerId) return;   // Not my pointer

			if (event.button === 0) {
				var wasDragging = dragging;
				dragPoint = undefined;
				dragging = false;
				pointerId = undefined;
				opt.dragClass && $elem.removeClass(opt.dragClass);

				eventRemovers.forEach(eventRemover => eventRemover());
				eventRemovers = [];

				if (wasDragging) {
					elem.releaseCapture && elem.releaseCapture();
					$("html").removeClass(resetAllCursorsClass);
					document.documentElement.style.setProperty("cursor", htmlCursor);

					let event2 = $.Event("draggableend");
					event2.revert = function () {
						$elem.offset(elemRect);
					};
					$elem.trigger(event2);
				}
			}
		}
	});
}

// Removes the draggable features from the elements.
function remove() {
	return this.each(function () {
		var elem = this;
		var $elem = $(elem);
		if (!$elem.hasClass(draggableClass)) return;
		$elem.removeClass(draggableClass);
		var opt = loadOptions("draggable", $elem);
		opt.handleElem.css("touch-action", opt.originalTouchAction);
		opt.eventRemovers.forEach(eventRemover => eventRemover());
	});
}

registerPlugin("draggable", draggable, {
	remove: remove
});
$.fn.draggable.defaults = draggableDefaults;
