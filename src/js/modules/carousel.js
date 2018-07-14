import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

var carouselClass = "ff-carousel";
var carouselIndicatorClass = "ff-carousel-indicator";

// Defines default options for the carousel plugin.
var carouselDefaults = {
	// The index of the initially active item. Default: 0.
	active: 0,

	// The number of items concurrently visible. Default: 1.
	items: 1,

	// Show an indicator dot each x items. Default: -1 means the same value as items.
	dotsEach: -1,

	// The margin between two items in pixels. Default: 0.
	gutter: 0,

	// Shows the indicator dots for the active item. Default: true.
	indicator: true,

	// Starts looping through all items automatically. Default: false.
	autoPlay: false,

	// Autoplay item switch interval in milliseconds. Default: 4000.
	autoPlayInterval: 4000,

	// Pauses autoplay while the carousel is hovered with the mouse. Default: true.
	pauseOnHover: true,

	// The mouse cursor to show during dragging. Default: None.
	dragCursor: undefined,

	// The animation between items. Default: slide-all.
	// Possible values: slide-all, slide-in, slide-out, fade, slide-fade
	// For more than one visible item, only slide-all is supported and automatically used.
	animation: "slide-all",

	// Loops all items at the end instead of rewinding/restricting. Default: false.
	// TODO
	loop: false
};

// Converts each selected element into a carousel.
function carousel(options) {
	return this.each(function () {
		var carousel = $(this);
		if (carousel.find("." + carouselClass).length) return;   // Already done
		var opt = initOptions("carousel", carouselDefaults, carousel, {}, options);

		if (opt.items > 1 || opt.gutter > 0) opt.animation = "slide-all";

		var stage = $("<div/>").addClass(carouselClass);

		opt._gutterWidth = (opt.items - 1) / opt.items * opt.gutter;
		opt._gutterOffset = 1 / opt.items * opt.gutter;
		opt._itemWidthPercent = 100 / opt.items;
		opt._layout = layout;

		var itemIndex = 0;
		var maxItemHeight = 0;
		var items = carousel.children();
		var autoPlayTimeout;
		var itemOffset, startItemOffset, prevItemOffset, dragDirection, itemOffsetMin, itemOffsetMax, itemWidth;
		var currentTransition = "";

		if (opt.dotsEach === -1) opt.dotsEach = opt.items;
		opt.dotsEach = minmax(opt.dotsEach, 0, opt.items);

		// Set up items positioning
		items.each$(function () {
			this.css("width", "calc(" + opt._itemWidthPercent + "% - " + opt._gutterWidth + "px)");
			maxItemHeight = Math.max(maxItemHeight, this.outerHeight());
			this.detach().appendTo(stage);
			itemIndex++;
		});
		stage.appendTo(carousel);
		stage.css("height", maxItemHeight);

		// Add controls
		if (opt.indicator) {
			var indicator = $("<div/>").addClass(carouselIndicatorClass).appendTo(carousel);
			var indicatorCount = Math.ceil(items.length / opt.dotsEach) - (opt.items - opt.dotsEach);
			for (let i = 0; i < indicatorCount; i++) {
				let dot = $("<span tabindex='0'><span/></span>").appendTo(indicator);
				let fn = function () {
					carousel.carousel.activeItem(i * opt.dotsEach);
					suspendAutoplay();
					resumeAutoplay();
				};
				dot.click(fn);
				dot.keydown(function (event) {
					if (event.which === 13) {   // Enter
						event.preventDefault();
						fn();
					}
				});
			}
		}

		carousel.carousel.activeItem(opt.active);

		stage.draggable({
			axis: "x",
			dragCursor: opt.dragCursor
		});
		stage.on("draggablestart", function (event) {
			var dx = Math.abs(event.dragPoint.left - event.newPoint.left);
			var dy = Math.abs(event.dragPoint.top - event.newPoint.top);
			if (dy > dx) {
				// Movement was mostly vertical, don't drag in that direction but leave scrolling intact
				event.preventDefault();
				return;
			}

			itemWidth = stage.width() / opt.items;
			prevItemOffset = startItemOffset = layout();
			var lastPageFirstItem = Math.max(0, items.length - opt.items);
			itemOffsetMin = -opt.active;
			itemOffsetMax = lastPageFirstItem - opt.active;
			opt._isDragging = true;

			// Disable transition and autoplay while dragging
			removeTransition();
			suspendAutoplay();
		});
		stage.on("draggablemove", function (event) {
			itemOffset = startItemOffset - (event.newPoint.left - event.elemRect.left) / itemWidth;
			dragDirection = itemOffset - prevItemOffset;
			prevItemOffset = itemOffset;

			// Don't move the stage anywhere! Just tell me how far the pointer is dragged and we'll
			// move something else (the items within the stage) to provide the expected visual feedback.
			event.newPoint = event.elemRect;

			// Restrict dragging at start/end
			if (itemOffset < itemOffsetMin)
				itemOffset = itemOffsetMin - elastic(itemOffsetMin - itemOffset);
			if (itemOffset > itemOffsetMax)
				itemOffset = itemOffsetMax + elastic(itemOffset - itemOffsetMax);

			function elastic(exceeding) {
				var max = 0.25;
				// This function has a slope of 1 for x = 0 and slowly approaches (but never reaches) max
				return -max / (exceeding / max + 1) + max;
			}

			layout(itemOffset);
		});
		stage.on("draggableend", function (event) {
			// Restore transition and autoplay
			addTransition();
			resumeAutoplay();
			opt._isDragging = false;

			// Snap to item, consider last drag direction
			var itemIndex = opt.active + itemOffset;
			var newDot = itemIndex / opt.dotsEach;
			if (dragDirection > 0)
				newDot = Math.ceil(newDot);
			else
				newDot = Math.floor(newDot);
			carousel.carousel.activeItem(newDot * opt.dotsEach);
		});

		// Add transition after setting position of every item
		forceReflow();
		addTransition();

		var autoplaySuspendLevel = 0;
		if (opt.autoPlay) {
			if (opt.pauseOnHover) {
				stage.mouseenter(suspendAutoplay);
				stage.mouseleave(resumeAutoplay);
			}

			autoPlayTimeout = setTimeout(next, opt.autoPlayInterval);
		}

		function suspendAutoplay() {
			autoPlayTimeout && clearTimeout(autoPlayTimeout);
			autoplaySuspendLevel++;
		}

		function resumeAutoplay(clearPending) {
			autoplaySuspendLevel--;
			if (opt.autoPlay && !autoplaySuspendLevel) {
				autoPlayTimeout = setTimeout(next, opt.autoPlayInterval * 2);
			}
		}

		function next() {
			var index = opt.active;
			index += opt.dotsEach;
			if (index > items.length - opt.items) index = 0;
			carousel.carousel.activeItem(index);
			autoPlayTimeout = setTimeout(next, opt.autoPlayInterval);
		}

		function removeTransition() {
			currentTransition = "";
			items.css("transition", currentTransition);
		}

		function addTransition() {
			let opacityTime = "0.4s";
			if (opt.animation === "fade")
				opacityTime = "0.8s";
			currentTransition = "left 0.4s ease-in-out, opacity " + opacityTime + " ease-in-out";
			items.css("transition", currentTransition);
		}

		// Modulo operation corrected for negative numbers.
		function mod(value, mod) {
			while (value < 0) value += mod;
			return value % mod;
		}

		// Item layouts for each animation type:
		// slide-all
		//   All items are positioned next to each other and moved simultaneously
		//   No z-index or opacity is used
		// slide-out
		//   There are two stacks next to each other
		//   The right stack is at left: 0 (visible in the stage), the left stack is directly next to it
		//   The active item and all following items are on the right (visible) stack, with z-index from front to back
		//   The previous items are on the left (invisible) stack
		//   Only one item can be moved to the other stack at a time
		// slide-in
		//   There are two stacks next to each other
		//   The left stack is at left: 0 (visible in the stage), the right stack is directly next to it
		//   The active item and all previous items are on the left (visible) stack, with z-index from back to front
		//   The following items are on the right (invisible) stack
		//   Only one item can be moved to the other stack at a time
		// fade
		//   All items are stacked above one another, at the same position (left: 0, in the stage)
		//   The visible item or the item that is becoming visible is on z-index 1, opacity is 1.
		//   The previously visible item or the item that is becoming invisible is on z-index 2, opacity is (becoming) 0, pointer-events is none.
		//   All other items are on z-index 0 with opacity 0.
		// slide-fade
		//   Based on slide-all but moving items by 1/10th of the stage width.
		//   The active/visible item has opacity 1, gradually changing to 0 for the adjacent and all other items.

		// Translates between an item offset and the current layout.
		// The getter is used to initialise the item offset when starting to drag during an ongoing transition.
		// The setter is used everywhere the items need to be laid out for a new active item or item offset.
		function layout(itemOffset) {
			// Getter
			if (itemOffset === undefined) {
				let pos = [];
				let allSame = true;
				switch (opt.animation) {
					case "fade":
						let z1, z2, z2Opacity;
						items.each$(function (index) {
							if (this.css("z-index") == 1)
								z1 = index;
							if (this.css("z-index") == 2) {
								z2 = index;
								z2Opacity = parseFloat(this.css("opacity"));
							}
						});
						//console.log("get layout: z1=" + z1 + " z2=" + z2 + " z2Opacity=" + z2Opacity + " active=" + opt.active);
						if (z2 !== undefined) {
							if (z1 > z2)   // Moving forward (a higher item index is in layer 1, becoming visible)
								return z1 + (1 - z2Opacity) - opt.active - 1;
							else   // Moving backward
								return z1 + z2Opacity - opt.active;
						}
						if (z1 !== undefined) return z1 - opt.active;
						return 0;
					case "slide-in":
						let anyZero = false;
						let firstGtZero = -1;
						items.each$(function (index) {
							let left = parseFloat(this.css("left"));
							pos.push(left);
							if (left !== pos[0]) allSame = false;
							if (left === 0) anyZero = true;
							if (left > 0 && firstGtZero === -1) firstGtZero = index;
						});
						if (allSame && pos[0] < 0) return items.length - 1 -pos[0] / itemWidth - opt.active;
						if (!anyZero) return -pos[0] / itemWidth - opt.active;
						if (firstGtZero > 0) return firstGtZero - pos[firstGtZero] / itemWidth - opt.active;
						return 0;
					case "slide-out":
						let anyPositive = false;
						let firstZero = -1;
						items.each$(function (index) {
							let left = parseFloat(this.css("left"));
							pos.push(left);
							if (left !== pos[0]) allSame = false;
							if (left >= 0) anyPositive = true;
							if (left === 0 && firstZero === -1) firstZero = index;
						});
						if (allSame && pos[0] > 0) return -pos[0] / itemWidth - opt.active;
						if (!anyPositive) return items.length - 1 + -pos[pos.length - 1] / itemWidth - opt.active;
						if (firstZero > 0) return firstZero - 1 + -pos[firstZero - 1] / itemWidth - opt.active;
						return 0;
					case "slide-fade":
						let activeItemLeft2 = parseFloat(items.eq(opt.active).css("left"));
						return -activeItemLeft2 / (itemWidth / 10);
					case "slide-all":
					default:
						let activeItemLeft = parseFloat(items.eq(opt.active).css("left"));
						return -activeItemLeft / itemWidth;
				}
			}

			// Setter
			switch (opt.animation) {
				case "fade":
					if (itemOffset !== 0) {
						let fullyVisible = opt.active + Math.trunc(itemOffset);
						let partiallyVisible = opt.active + Math.trunc(itemOffset) + Math.sign(itemOffset);
						//console.log(fullyVisible, partiallyVisible);
						items.each$(function (index) {
							if (index === fullyVisible) {
								this.css("z-index", 1).css("opacity", 1);
							}
							else if (index === partiallyVisible) {
								this.css("z-index", 2).css("opacity", Math.abs(itemOffset) - Math.trunc(Math.abs(itemOffset)));
							}
							else {
								this.css("z-index", 0).css("opacity", 0);
							}
						});
					}
					else {
						let z1, z2, z2Opacity;
						items.each$(function (index) {
							if (this.css("z-index") == 1)
								z1 = index;
							if (this.css("z-index") == 2) {
								z2 = index;
								z2Opacity = parseFloat(this.css("opacity"));
							}
						});
						//console.log("set layout: z1=" + z1 + " z2=" + z2 + " z2Opacity=" + z2Opacity + " active=" + opt.active);
						if (opt.active === z1) {
							items.eq(z2).css("opacity", 0).css("pointer-events", "none");
						}
						else if (opt.active === z2) {
							removeTransition();
							items.eq(z1).css("z-index", 2).css("opacity", 1 - z2Opacity);
							items.eq(z2).css("z-index", 1).css("opacity", 1).css("pointer-events", "");
							forceReflow();
							if (!opt._isDragging) addTransition();
							items.eq(z1).css("opacity", 0).css("pointer-events", "none");
						}
						else {
							let currentVisible;
							items.each$(function (index) {
								if (this.css("z-index") == 1)
									currentVisible = index;
							});
							removeTransition();
							items.eq(opt.active).css("z-index", 1).css("opacity", 1).css("pointer-events", "");
							forceReflow();
							if (!opt._isDragging) addTransition();
							items.each$(function (index) {
								if (index === opt.active) {
								}
								else if (index === currentVisible) {
									this.css("z-index", 2).css("opacity", 0).css("pointer-events", "none");
								}
								else {
									this.css("z-index", 0).css("opacity", 0).css("pointer-events", "");
								}
							});
						}
					}

					let status = "";
					items.each$(function (index) {
						status += index + ": z=" + this.css("z-index") + " op=" + this.css("opacity") + (index === opt.active ? " active" : "") + "\n";
					});
					//console.log(status);
					break;
				case "slide-in":
					items.each$(function (index) {
						let left = opt.active + itemOffset <= items.length - 1 ?
							minmax((index - opt.active - itemOffset) * 100, 0, 100) :
							(items.length - 1 - opt.active - itemOffset) * 100;
						this.css("left", left + "%");
						this.css("z-index", index);
					});
					break;
				case "slide-out":
					items.each$(function (index) {
						let left = opt.active + itemOffset >= 0 ?
							minmax((index - opt.active - itemOffset) * 100, -100, 0) :
							(-opt.active - itemOffset) * 100;
						this.css("left", left + "%");
						this.css("z-index", items.length - 1 - index);
					});
					break;
				case "slide-fade":
					items.each$(function (index) {
						let percent = (index - opt.active) * 100 / 10;
						let left = (index - opt.active) * opt._gutterOffset - itemOffset * stage.width() / 10;
						this.css("left", "calc(" + percent + "% + " + left + "px)");
						let opacity = 1 - minmax(Math.abs(index - (opt.active + itemOffset)), 0, 1);
						this.css("opacity", opacity);
					});
					break;
				case "slide-all":
				default:
					items.each$(function (index) {
						let percent = (index - opt.active) * opt._itemWidthPercent;
						let left = (index - opt.active) * opt._gutterOffset - itemOffset * stage.width() / opt.items;
						this.css("left", "calc(" + percent + "% + " + left + "px)");
					});
					break;
			}
		}
	});
}

// Gets the active item in a carousel.
// indexOrItem: Sets the active item in each selected carousel, either by index or the element.
function activeItem(indexOrItem) {
	// Getter
	if (indexOrItem === undefined) {
		var carousel = this.first();
		if (carousel.length === 0) return;   // Nothing to do
		var opt = loadOptions("carousel", carousel);
		return opt.active;
	}

	// Setter
	return this.each(function () {
		var carousel = $(this);
		var opt = loadOptions("carousel", carousel);
		if (opt._isDragging) return;   // Ignore request while dragging
		var items = carousel.find("." + carouselClass).children();
		if (indexOrItem === Infinity) indexOrItem = items.length;   // Infinity can't be handled by Math.min
		var index;
		if ($.isNumeric(indexOrItem)) {
			index = +indexOrItem;
		}
		else {
			index = indexOrItem.index();
		}

		index = minmax(index, 0, items.length - opt.items);
		opt.active = index;
		opt._layout(0);
		var dots = carousel.find("." + carouselIndicatorClass).children();
		dots.removeClass("active").eq(Math.ceil(index / opt.dotsEach)).addClass("active");
		carousel.trigger("activeItemChange");
	});
}

registerPlugin("carousel", carousel, {
	activeItem: activeItem
});
$.fn.carousel.defaults = carouselDefaults;
