import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

var sortableClass = "ff-sortable";
var sortablePlaceholderClass = "ff-sortable-placeholder";

// Defines default options for the sortable plugin.
var sortableDefaults = {
	// The element(s) that can start a drag operation. Default: The element to drag.
	handle: undefined,

	// The element(s) that cannot start a drag operation. Default: None.
	cancel: undefined,

	// Constrains the drag movement along the "x" or "y" axis. Default: None.
	axis: undefined,

	// Constrains the drag movement inside the specified element or the "parent" of the dragged element. Default: None.
	containment: undefined,

	// The elements among which the dragged element will be pulled in the front, or true to stack all sortable children. Default: None.
	stack: undefined,

	// The mouse cursor to show during dragging. Default: None.
	dragCursor: undefined,

	// A CSS class to add to the element while it's being dragged. Default: None.
	dragClass: undefined,

	// Indicates whether the window should scroll to keep the dragged element visible. Default: false.
	scroll: false
};

// Makes the child elements in each selected element sortable by drag&drop.
function sortable(options) {
	return this.each(function () {
		var elem = this;
		var $elem = $(elem);
		if ($elem.hasClass(sortableClass)) return;   // Already done
		$elem.addClass(sortableClass);
		var opt = initOptions("sortable", sortableDefaults, $elem, {}, options);
		opt._prepareChild = prepareChild;

		// Remove text nodes between children which cause layout issues when dragging
		$elem.contents().filter(function () {
			return this.nodeType === 3;
		}).remove();

		var isVertical = isBlockDisplay($elem.firstChild().css("display"));
		var flowStart = isVertical ? "top" : "left";
		var flowEnd = isVertical ? "bottom" : "right";
		var crossStart = isVertical ? "left" : "top";
		var crossEnd = isVertical ? "right" : "bottom";

		$elem.children().each(prepareChild);
		
		function prepareChild() {
			var child = $(this);
			var placeholder, initialChildAfterElement, placeholderAfterElement, betweenChildren, initialChildIndex;
			var stack = opt.stack;
			if (stack === true)
				stack = $elem.children();

			child.draggable({
				handle: opt.handle,
				cancel: opt.cancel,
				axis: opt.axis,
				containment: opt.containment,
				stack: stack,
				dragCursor: opt.dragCursor,
				dragClass: opt.dragClass,
				scroll: opt.scroll
			});
			child.on("draggablestart", function (event) {
				event.stopImmediatePropagation();
				let event2 = $.Event("sortablestart");
				child.trigger(event2);
				if (event2.isDefaultPrevented()) {
					event.preventDefault();
					return;
				}

				// Remember where the element was before it was dragged, so it can be moved back there
				initialChildAfterElement = child.prev();
				if (initialChildAfterElement.length === 0)
					initialChildAfterElement = null;
				initialChildIndex = child.index();

				let rect = child.rect();

				// Fix the size of table row cells while dragging
				if (child[0].nodeName === "TR") {
					let table = child.closest("table").find("tr").first().children("td, th").each$(function () {
						this.data("width-before-drag", this[0].style.width || "");
						this.css("width", this.outerWidth());
					});
					child.children("td, th").each$(function () {
						this.css("width", this.outerWidth());
					});
					child.css("min-width", child.outerWidth() + 1);
				}
				
				// Create the placeholder element that will take the place of the dragged element
				placeholder = $("<" + child[0].nodeName + "/>")
					.addClass(child[0].className)
					.addClass(sortablePlaceholderClass)
					.text("\xa0")
					.css({ width: rect.width, height: rect.height });
				if (child[0].nodeName === "TR") {
					let colCount = child.children("td, th")
						.map(td => $(td).attr("colspan") || 1)
						.get()   // Convert jQuery array to Array
						.reduce((a, b) => a + b);
					placeholder.append($("<td/>").attr("colspan", colCount));
				}

				// Insert the placeholder where the dragged element is, and take that out of the layout flow
				child.after(placeholder);
				child.css({ position: "absolute", width: rect.width, height: rect.height });
				updateChildren();
			});
			child.on("draggablemove", function (event) {
				event.stopImmediatePropagation();
				let event2 = $.Event("sortablemove");
				child.trigger(event2);
				if (event2.isDefaultPrevented()) {
					event.preventDefault();
					return;
				}

				// Find the center points of the dragged element, both at the start and end in flow direction
				var rect = child.rect();
				var childStartCenter = center(rect);
				childStartCenter[flowStart] = rect[flowStart];
				var childEndCenter = center(rect);
				childEndCenter[flowStart] = rect[flowEnd];

				var minStartDistance = Infinity;
				var minEndDistance = Infinity;
				var newPlaceholderAfterElementStart;
				var newPlaceholderAfterElementEnd;

				// Iterate betweenChildren to find the closest line connecting two elements
				betweenChildren.forEach(function (x) {
					var startDistance = distToSegment(childStartCenter, x.p1, x.p2);
					if (startDistance < minStartDistance) {
						minStartDistance = startDistance;
						newPlaceholderAfterElementStart = x.after;
					}
					var endDistance = distToSegment(childEndCenter, x.p1, x.p2);
					if (endDistance < minEndDistance) {
						minEndDistance = endDistance;
						newPlaceholderAfterElementEnd = x.after;
					}
				});

				// Find the suggested new placeholder location that's different from the current...
				// TODO: If a short item is dragged over a long item at the beginning of a row and its placeholder still fits into the previous row, this flickers
				// * Visualise the generated lines between the items to get an idea of what the code sees
				//console.log("start is after center of " + $(newPlaceholderAfterElementStart).text());
				//console.log("end is after center of " + $(newPlaceholderAfterElementEnd).text());
				var newPlaceholderAfterElement;
				if (newPlaceholderAfterElementStart !== placeholderAfterElement)
					newPlaceholderAfterElement = newPlaceholderAfterElementStart;
				if (newPlaceholderAfterElementEnd !== placeholderAfterElement)
					newPlaceholderAfterElement = newPlaceholderAfterElementEnd;

				// ...and move it there
				if (newPlaceholderAfterElement !== undefined) {
					var eventCancelled = false;
					if (placeholderAfterElement !== undefined) {
						let event2 = $.Event("sortablechange");
						event2.after = newPlaceholderAfterElement;
						child.trigger(event2);
						eventCancelled = event2.isDefaultPrevented();
					}
					if (!eventCancelled) {
						if (!newPlaceholderAfterElement)
							placeholder.detach().insertBefore($elem.firstChild());
						else
							placeholder.detach().insertAfter(newPlaceholderAfterElement);
						placeholderAfterElement = newPlaceholderAfterElement;
						updateChildren();
					}
				}
			});
			child.on("draggableend", function (event) {
				event.stopImmediatePropagation();
				child.css({ position: "", width: "", height: "", top: "", left: "" });
				placeholder.replaceWith(child);
				placeholder = undefined;
				betweenChildren = undefined;

				// Reset the size of table row cells
				if (child[0].nodeName === "TR") {
					let table = child.closest("table").find("tr").first().children("td, th").each$(function () {
						this.css("width", this.data("width-before-drag"));
						this.data("width-before-drag", null);
					});
					child.children("td, th").each$(function () {
						this.css("width", "");
					});
					child.css("width", "");
				}

				let event2 = $.Event("sortableend");
				event2.initialIndex = initialChildIndex;
				event2.newIndex = child.index();
				event2.after = placeholderAfterElement;
				child.trigger(event2);
				if (event2.isDefaultPrevented()) {
					if (!initialChildAfterElement)
						child.detach().insertBefore($elem.firstChild());
					else
						child.detach().insertAfter(initialChildAfterElement);
				}
				initialChildAfterElement = undefined;
			});

			function updateChildren() {
				betweenChildren = [];
				var rowElements = [];
				var rowMin, rowMax, currentPos, elem = null;
				$elem.children().each(function () {
					if (this !== child[0]) {
						var rect = $(this).rect();
						if (rect[flowStart] + 0.1 < currentPos) {   // Need to compensate for rounding issues from the 4th decimal in Chrome/Edge/IE
							// This element is in a new row
							addRow();
						}

						// Remember the width of a row
						if (rowMin === undefined || rect[crossStart] < rowMin) rowMin = rect[crossStart];
						if (rowMax === undefined || rect[crossEnd] < rowMax) rowMax = rect[crossEnd];

						// Remember how far the row has been used
						currentPos = rect[flowEnd];

						if (this !== placeholder[0]) elem = this;
						rowElements.push({ elem: elem, rect: rect });
					}
				});

				// Don't forget the last row
				addRow();

				function addRow() {
					var rowCenter = (rowMin + rowMax) / 2;

					// Add line before the first element in the row
					betweenChildren.push({
						// far away
						p1: createPoint(-10000, rowCenter),
						// the first row element's center
						p2: createPoint(center(rowElements[0].rect)[flowStart], rowCenter),
						// the position after the last element of the previous row, if any
						after: betweenChildren.length > 0 ? betweenChildren[betweenChildren.length - 1].after : null
					});

					// Now add lines after each element in the row
					rowElements.forEach(function (x, i) {
						betweenChildren.push({
							// the current row element's center
							p1: createPoint(center(x.rect)[flowStart], rowCenter),
							// the next row element's center, if any; otherwise far away
							p2: createPoint(i < rowElements.length - 1 ? center(rowElements[i + 1].rect)[flowStart] : 10000, rowCenter),
							// the position after the current row element
							after: x.elem
						});
					});

					// Reset values for the new row
					rowMin = rowMax = currentPos = undefined;
					rowElements = [];
				}
			}
		}

		// Returns an absolute point with "left" and "top" coordinates for the current orientation.
		function createPoint(flow, cross) {
			var p = {};
			p[flowStart] = flow;
			p[crossStart] = cross;
			return p;
		}
	});

	// Returns the center point of the specified rectangle.
	function center(rect) {
		return {
			top: rect.top + rect.height / 2,
			left: rect.left + rect.width / 2
		};
	}

	// Determines whether the specified CSS display value defines a block instead of an inline.
	function isBlockDisplay(value) {
		return ["block", "flex", "grid", "list-item", "table", "table-footer-group", "table-header-group", "table-row", "table-row-group"].indexOf(value) !== -1;
	}

	// Source: https://jsfiddle.net/beentaken/9k1sf6p2/ (modified)
	function dist2(v, w) {
		return (v.left - w.left) ** 2 + (v.top - w.top) ** 2;
	}

	function distToSegmentSquared(p, v, w) {
		var l2 = dist2(v, w);
		if (l2 == 0) return dist2(p, v);
		var t = ((p.left - v.left) * (w.left - v.left) + (p.top - v.top) * (w.top - v.top)) / l2;
		if (t < 0) return dist2(p, v);
		if (t > 1) return dist2(p, w);
		return dist2(p, { left: v.left + t * (w.left - v.left), top: v.top + t * (w.top - v.top) });
	}

	function distToSegment(p, v, w) {
		return Math.sqrt(distToSegmentSquared(p, v, w));
	}
}

// Notifies the sortable plugin about a new child that needs to be initialized.
function addChild(child) {
	var sortable = $(this);
	var opt = loadOptions("sortable", sortable);
	opt._prepareChild.call(child);
}

registerPlugin("sortable", sortable, {
	addChild: addChild
});
$.fn.sortable.defaults = sortableDefaults;
