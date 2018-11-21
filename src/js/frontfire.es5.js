'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! frontfire.js v0.1 | @license MIT | unclassified.software/source/frontfire */
(function ($, window, document) {
	'use strict';

	// Bring older browsers to a usable level

	// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill

	if (!String.prototype.includes) {
		String.prototype.includes = function (search, start) {
			if (typeof start !== "number") start = 0;
			if (start + search.length > this.length) return false;
			return this.indexOf(search, start) !== -1;
		};
	}

	// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith#Polyfill
	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function (search, pos) {
			return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
		};
	}

	// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith#Polyfill
	if (!String.prototype.endsWith) {
		String.prototype.endsWith = function (search, this_len) {
			if (this_len === undefined || this_len > this.length) this_len = this.length;
			return this.substring(this_len - search.length, this_len) === search;
		};
	}

	// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd#Polyfill
	if (!String.prototype.padEnd) {
		String.prototype.padEnd = function padEnd(targetLength, padString) {
			targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
			padString = String(padString || ' ');
			if (this.length > targetLength) return String(this);
			targetLength = targetLength - this.length;
			if (targetLength > padString.length) padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
			return String(this) + padString.slice(0, targetLength);
		};
	}

	// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart#Polyfill
	if (!String.prototype.padStart) {
		String.prototype.padStart = function padStart(targetLength, padString) {
			targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
			padString = String(padString || ' ');
			if (this.length > targetLength) return String(this);
			targetLength = targetLength - this.length;
			if (targetLength > padString.length) padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
			return padString.slice(0, targetLength) + String(this);
		};
	}

	// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat#Polyfill
	if (!String.prototype.repeat) {
		String.prototype.repeat = function (count) {
			if (this == null) {
				throw new TypeError('can\'t convert ' + this + ' to object');
			}
			var str = '' + this;
			count = +count;
			if (count != count) {
				count = 0;
			}
			if (count < 0) {
				throw new RangeError('repeat count must be non-negative');
			}
			if (count == Infinity) {
				throw new RangeError('repeat count must be less than infinity');
			}
			count = Math.floor(count);
			if (str.length == 0 || count == 0) {
				return '';
			}
			// Ensuring count is a 31-bit integer allows us to heavily optimize the
			// main part. But anyway, most current (August 2014) browsers can't handle
			// strings 1 << 28 chars or longer, so:
			if (str.length * count >= 1 << 28) {
				throw new RangeError('repeat count must not overflow maximum string size');
			}
			var rpt = '';
			for (var i = 0; i < count; i++) {
				rpt += str;
			}
			return rpt;
		};
	}

	// Source: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc#Polyfill
	Math.trunc = Math.trunc || function (x) {
		return x - x % 1;
	};

	// Source: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/log10#Polyfill
	Math.log10 = Math.log10 || function (x) {
		return Math.log(x) * Math.LOG10E;
	};

	// Define some more helper functions as jQuery plugins. Similar functions already exist in
	// jQuery and these complement the set.

	// A variant of $.each that uses $(this) as the called function's context instead of this.
	$.fn.each$ = function (fn) {
		return this.each(function (index, element) {
			return fn.call($(this), index, element);
		});
	};

	// Determines whether the value is set (i. e. not undefined or null).
	$.isSet = function (value) {
		return typeof value !== "undefined" && value !== null;
	};

	// Determines whether the value is boolean.
	$.isBoolean = function (value) {
		return typeof value === "boolean";
	};

	// Determines whether the value is a number.
	$.isNumber = function (value) {
		return typeof value === "number";
	};

	// Determines whether the value is a string.
	$.isString = function (value) {
		return typeof value === "string";
	};

	// Determines whether the value is an even number.
	$.isEven = function (value) {
		return $.isNumber(value) && value % 2 === 0;
	};

	// Determines whether the value is an odd number.
	$.isOdd = function (value) {
		return $.isNumber(value) && value % 2 === 1;
	};

	// Determines whether the client operating system is Android.
	$.isAndroid = function () {
		return !!navigator.userAgent.match(/Android/);
	};

	// Determines whether the client operating system is iOS.
	$.isIos = function () {
		return !!navigator.platform.match(/iPhone|iPad|iPod/);
	};

	// Determines whether the client operating system is Linux (not Android).
	$.isLinux = function () {
		return !!navigator.platform.match(/Linux/) && !$.isAndroid();
	};

	// Determines whether the client operating system is macOS.
	$.isMac = function () {
		return !!navigator.platform.match(/Mac/);
	};

	// Determines whether the client operating system is Windows.
	$.isWindows = function () {
		return !!navigator.platform.match(/Win/);
	};

	if ($.isAndroid()) {
		$("html").addClass("simple-dimmer");
	}

	/*! jQuery UI - v1.12.1 - 2017-12-25
 * http://jqueryui.com
 * Includes: focusable.js
 * Copyright jQuery Foundation and other contributors; Licensed MIT */

	// NOTE: This file was modified to not include unnecessary jQuery UI stuff.
	// IE8 support removed, which was introduced in
	// * https://bugs.jqueryui.com/ticket/14596
	// * https://github.com/jquery/jquery-ui/commit/d3025968f349c37a8ca41bfc63ee1b37d9d7354f

	/*
  * jQuery UI Focusable 1.12.1
  * http://jqueryui.com
  *
  * Copyright jQuery Foundation and other contributors
  * Released under the MIT license.
  * http://jquery.org/license
  */

	//>>label: :focusable Selector
	//>>group: Core
	//>>description: Selects elements which can be focused.
	//>>docs: http://api.jqueryui.com/focusable-selector/


	// Selectors
	var _focusable = function _focusable(element, hasTabindex) {
		var map,
		    mapName,
		    img,
		    focusableIfVisible,
		    fieldset,
		    nodeName = element.nodeName.toLowerCase();

		if ("area" === nodeName) {
			map = element.parentNode;
			mapName = map.name;
			if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
				return false;
			}
			img = $("img[usemap='#" + mapName + "']");
			return img.length > 0 && img.is(":visible");
		}

		if (/^(input|select|textarea|button|object)$/.test(nodeName)) {
			focusableIfVisible = !element.disabled;

			if (focusableIfVisible) {

				// Form controls within a disabled fieldset are disabled.
				// However, controls within the fieldset's legend do not get disabled.
				// Since controls generally aren't placed inside legends, we skip
				// this portion of the check.
				fieldset = $(element).closest("fieldset")[0];
				if (fieldset) {
					focusableIfVisible = !fieldset.disabled;
				}
			}
		} else if ("a" === nodeName) {
			focusableIfVisible = element.href || hasTabindex;
		} else {
			focusableIfVisible = hasTabindex;
		}

		return focusableIfVisible && $(element).is(":visible") && $(element).css("visibility") === "visible";
	};

	$.extend($.expr[":"], {
		focusable: function focusable(element) {
			return _focusable(element, $.attr(element, "tabindex") !== undefined);
		}
	});

	// Registers a jQuery plugin.
	function registerPlugin(name, create, obj) {
		// Define a new property for each jQuery object in which the plugin is accessible.
		// This property getter is called whenever the plugin or one of its additional functions is called.
		Object.defineProperty($.fn, name, {
			get: function get() {
				// Plugin default function
				// Returned to make this property callable
				var ret = create;

				// Plugin additional functions, added to the returned function
				// Bound to whoever has called this property to pass on "this" to the next function
				for (var key in obj) {
					if ($.isFunction(obj[key])) {
						ret[key] = obj[key].bind(this);
					}
				}
				return ret;
			}
		});
	}
	function initOptions(name, defaults, elem, converters, params) {
		params = params || {};

		// Start with the defaults
		var opts = $.extend({}, defaults);

		// Look for a combined HTML data-opt attribute containing a JSON object
		var optValue = $(elem).data("opt");
		if (optValue !== undefined) {
			try {
				optValue = new Function("return " + optValue + ";")();
				opts = $.extend(opts, optValue);
			} catch (err) {
				console.error("ERROR: data-opt value for " + name + " cannot be parsed:", optValue, err);
			}
		}

		// Then overwrite with individual HTML data attributes
		for (var key in defaults) {
			// Only do the work if it's not overridden again by params
			if (params[key] === undefined) {
				var elemDataValue = $(elem).data("opt-" + key);
				if (elemDataValue !== undefined) {
					if ($.isFunction(converters[key])) {
						opts[key] = converters[key](elemDataValue);
					} else {
						opts[key] = elemDataValue;
					}
				}
			}
		}

		// Finally overwrite with params
		$.extend(opts, params);

		// Keep options in DOM element's data
		$(elem).data("ff-" + name + "-options", opts);

		return opts;
	}
	function loadOptions(name, elem) {
		return $(elem).data("ff-" + name + "-options") || {};
	}

	// Returns the value in the range between min and max.
	function minmax(value, min, max) {
		return Math.max(min, Math.min(value, max));
	}

	// Returns the value rounded to the specified number of decimals.
	function round(value, decimals) {
		if (decimals === undefined) decimals = 0;
		var precision = Math.pow(10, decimals);
		return Math.round(value * precision) / precision;
	}

	// Forces a browser layout reflow. This can be used to start CSS transitions on new elements.
	function forceReflow() {
		// Try two different methods
		var body = $("body");
		body.css("display");
		body.offset();
	}

	// Installs a jQuery hook if it isn't installed yet. Existing hooks are chained to the new hook.
	// hooks: The hooks collection, like $.attrHooks or $.propHooks
	// name: The name of the hooked entry
	// id: The internal ID with which an already installed hook can be recognised
	// get: The get function (optional)
	// set: The set function (optional)
	function installHook(hooks, name, id, _get, _set) {
		// Explanation: https://blog.rodneyrehm.de/archives/11-jQuery-Hooks.html
		var hookInstalled = name in hooks && "ffId" in hooks[name] && hooks[name].ffId === id;
		if (!hookInstalled) {
			var prevHook = hooks[name];
			hooks[name] = {
				ffId: id,
				get: function get(a, b, c) {
					if (_get) {
						var result = _get(a, b, c);
						if (result !== null) return result;
					}
					if (prevHook && prevHook.get) return prevHook.get(a, b, c);
					return null;
				},
				set: function set(a, b, c) {
					if (_set) {
						var result = _set(a, b, c);
						if (result !== undefined) return result;
					}
					if (prevHook && prevHook.set) return prevHook.set(a, b, c);
				}
			};
		}
	}

	// Installs a hook that triggers the "disabledchange" event for input elements.
	function installDisabledchangeHook() {
		installHook($.propHooks, "disabled", "disabledchange", undefined, function (elem, value, name) {
			if (elem.disabled !== value) {
				elem.disabled = value; // Set before triggering change event
				$(elem).trigger("disabledchange");
			}
		});
	}

	// Binds the disabled state of the input element to the associated buttons.
	function bindInputButtonsDisabled(input, buttons) {
		// When the input element was disabled or enabled, also update other elements
		installDisabledchangeHook();
		var handler = function handler() {
			if (input.disabled()) {
				input.disable(); // Disable everything related as well (label etc.)
				buttons.forEach(function (button) {
					return button.disable();
				});
			} else {
				input.enable(); // Enable everything related as well (label etc.)
				buttons.forEach(function (button) {
					return button.enable();
				});
			}
		};
		input.on("disabledchange", handler);

		// Setup disabled state initially.
		// Also enable elements. If they were disabled and the page is reloaded, their state
		// may be restored halfway. This setup brings everything in the same state.
		handler();
	}

	// Scrolls the window so that the rectangle is fully visible.
	function scrollIntoView(rect) {
		var cont = $(window);
		var viewportWidth = cont.width() - 1;
		var viewportHeight = cont.height() - 1;
		var scrollTop = cont.scrollTop();
		var scrollLeft = cont.scrollLeft();

		if (rect.top < scrollTop) {
			cont.scrollTop(rect.top);
		}
		if (rect.bottom > scrollTop + viewportHeight) {
			cont.scrollTop(scrollTop + (rect.bottom - (scrollTop + viewportHeight)));
		}
		if (rect.left < scrollLeft) {
			cont.scrollLeft(rect.left);
		}
		if (rect.right > scrollLeft + viewportWidth) {
			cont.scrollLeft(scrollLeft + (rect.right - (scrollLeft + viewportWidth)));
		}
	}

	// Prevents scrolling the document.
	// state: Enable or disable the scrolling prevention.
	function preventScrolling(state) {
		var $document = $(document),
		    $html = $("html");
		if (state || state === undefined) {
			var scrollTop = $document.scrollTop();
			var scrollLeft = $document.scrollLeft();
			$document.on("scroll.ff-prevent-scrolling", function () {
				$document.scrollTop(scrollTop);
				$document.scrollLeft(scrollLeft);
			});
			$html.css("touch-action", "none");
		} else {
			$document.off("scroll.ff-prevent-scrolling");
			$html.css("touch-action", "");
		}
	}

	// Stacks the selected elements and moved one element to the top.
	function stackElements(stackedElems, topElem) {
		// Find all selected stackable elements and sort them by:
		//   currently dragging, then z-index, then DOM index
		// and assign their new z-index
		stackedElems = stackedElems.map(function (index, el) {
			var zIndex = parseInt($(el).css("z-index"));
			if (!$.isNumeric(zIndex)) zIndex = stackedElems.length;
			return { elem: el, dragElem: el === topElem ? 1 : 0, index: index, zIndex: zIndex };
		}).sort(function (a, b) {
			if (a.dragElem !== b.dragElem) return a.dragElem - b.dragElem;
			if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
			return a.index - b.index;
		});
		if (stackedElems.length !== 0) {
			var maxZIndex = Math.max.apply(Math, stackedElems.toArray().map(function (o) {
				return o.zIndex;
			}));
			stackedElems.each(function (index) {
				$(this.elem).css("z-index", maxZIndex - (stackedElems.length - 1) + index);
			});
		}
	}

	var accordionClass = "ff-accordion";

	// Defines default options for the accordion plugin.
	var accordionDefaults = {
		// Exclusive mode allows only one item to be expanded at a time. Default: false.
		exclusive: false,
		// Offset to consider when scrolling to an item, when there are fixed elements at the top. Default: 0.
		scrollOffset: 0,
		// Element whose height to consider when scrolling to an item. Both offsets are added. Default: null.
		scrollOffsetElement: null
	};

	// Converts all div elements in each selected element into accordion pages.
	function accordion(options) {
		return this.each(function () {
			var accordion = $(this);
			if (accordion.hasClass(accordionClass)) return; // Already done
			var opt = initOptions("accordion", accordionDefaults, accordion, {}, options);

			accordion.addClass(accordionClass);
			var items = $(this).children("div");
			items.each$(function () {
				var item = this;
				var header = item.children("div").first();
				var content = item.children("div").last();

				header.css("transition", "none");
				header.addClass("ff-accordion-header");
				forceReflow();
				header.css("transition", "");
				header.attr("tabindex", "0");

				content.addClass("ff-accordion-content");

				header.click(function () {
					if (content[0].clientHeight) {
						accordion.accordion.collapse(item);
					} else {
						accordion.accordion.expand(item);
					}
				});
				header.keydown(function (event) {
					if (event.which === 13) {
						// Enter
						event.preventDefault();
						header.click();
					}
				});

				var id = item.attr("id");
				if (id !== undefined && location.hash === "#" + id) {
					// Manually set item expanded
					item.addClass("expanded");
					content.css("height", "auto");
					$(function () {
						var offset = opt.scrollOffset || 0;
						if (opt.scrollOffsetElement) {
							offset += $(opt.scrollOffsetElement).height();
						}
						$("html,body").animate({ scrollTop: item.offset().top - offset });
					});
				} else {
					content.css("transition", "none");
					accordion.accordion.collapse(item);
					forceReflow();
					content.css("transition", "");
				}
			});
		});
	}

	function collapse(indexOrItem) {
		return this.each(function () {
			var accordion = $(this);
			var opt = loadOptions("accordion", accordion);

			var items = accordion.children("div");
			if (indexOrItem === undefined) {
				// Collapse all items
				items.each(function () {
					accordion.accordion.collapse(this);
				});
				return;
			}

			var item;
			if ($.isNumeric(indexOrItem)) {
				item = items.eq(+indexOrItem);
			} else {
				item = $(indexOrItem);
			}

			var content = item.children("div.ff-accordion-content").first();
			if (!content.hasClass("ff-fixed-height")) {
				content.css("height", content[0].scrollHeight); // explicitly set to current value
				forceReflow();
				content.css("height", 0); // now animate to 0
				content.addClass("ff-fixed-height");
				item.removeClass("expanded");

				var event = $.Event("itemCollapse");
				event.item = item;
				accordion.trigger(event);
			}

			var id = item.attr("id");
			if (id !== undefined && location.hash === "#" + id) {
				history.replaceState(null, document.title, location.pathname + location.search);
			}
		});
	}

	function expand(indexOrItem) {
		return this.each(function () {
			var accordion = $(this);
			var opt = loadOptions("accordion", accordion);

			var items = accordion.children("div");
			if (indexOrItem === undefined && !opt.exclusive) {
				// Expand all items
				items.each(function () {
					accordion.accordion.expand(this);
				});
				return;
			}

			var item;
			if ($.isNumeric(indexOrItem)) {
				item = items.eq(+indexOrItem);
			} else {
				item = $(indexOrItem);
			}

			var content = item.children("div.ff-accordion-content").first();
			if (content[0].clientHeight) {
				return; // Already expanded
			}
			content.css("height", content[0].scrollHeight); // animate to desired height
			function onTransitionEnd(event) {
				if (event.originalEvent.propertyName == "height") {
					content.css("height", "auto"); // allow free layout again after animation has completed
					content.off("transitionend", onTransitionEnd);
					content.removeClass("ff-fixed-height");
				}
			}
			content.on("transitionend", onTransitionEnd);
			item.addClass("expanded");

			var event = $.Event("itemExpand");
			event.item = item;
			accordion.trigger(event);

			var previousItemCollapsedHeight = 0;
			if (opt.exclusive) {
				var passedExpandedItem = false;
				items.each(function () {
					if (this !== item[0]) {
						if (!passedExpandedItem) previousItemCollapsedHeight += $(this).children("div.ff-accordion-content").height();
						accordion.accordion.collapse(this);
					} else {
						passedExpandedItem = true;
					}
				});
			}

			// If a previous item was collapsed, scroll so that the expanded header stays where it is on the screen
			//if (previousItemCollapsedHeight) {
			//	$("html,body").animate({ scrollTop: "-=" + previousItemCollapsedHeight }, 200);
			//}

			// TODO: At least keep the expanded header visible if a previous item was collapsed

			// TODO: Maybe also scroll to make the new content section visible as much as possible, while not pushing out its header (option)

			var id = item.attr("id");
			if (id !== undefined) {
				history.replaceState(null, document.title, "#" + id);
			}
		});
	}

	registerPlugin("accordion", accordion, {
		collapse: collapse,
		expand: expand
	});
	$.fn.accordion.defaults = accordionDefaults;

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
			if (carousel.find("." + carouselClass).length) return; // Already done
			var opt = initOptions("carousel", carouselDefaults, carousel, {}, options);

			if (opt.items > 1 || opt.gutter > 0) opt.animation = "slide-all";

			var stage = $("<div/>").addClass(carouselClass);

			opt._gutterWidth = (opt.items - 1) / opt.items * opt.gutter;
			opt._gutterOffset = 1 / opt.items * opt.gutter;
			opt._itemWidthPercent = 100 / opt.items;
			opt._layout = layout;
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
			});
			stage.appendTo(carousel);
			stage.css("height", maxItemHeight);

			// Add controls
			if (opt.indicator) {
				var indicator = $("<div/>").addClass(carouselIndicatorClass).appendTo(carousel);
				var indicatorCount = Math.ceil(items.length / opt.dotsEach) - (opt.items - opt.dotsEach);

				var _loop = function _loop(i) {
					var dot = $("<span tabindex='0'><span/></span>").appendTo(indicator);
					var fn = function fn() {
						carousel.carousel.activeItem(i * opt.dotsEach);
						suspendAutoplay();
						resumeAutoplay();
					};
					dot.click(fn);
					dot.keydown(function (event) {
						if (event.which === 13) {
							// Enter
							event.preventDefault();
							fn();
						}
					});
				};

				for (var i = 0; i < indicatorCount; i++) {
					_loop(i);
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
				if (itemOffset < itemOffsetMin) itemOffset = itemOffsetMin - elastic(itemOffsetMin - itemOffset);
				if (itemOffset > itemOffsetMax) itemOffset = itemOffsetMax + elastic(itemOffset - itemOffsetMax);

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
				if (dragDirection > 0) newDot = Math.ceil(newDot);else newDot = Math.floor(newDot);
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
				var opacityTime = "0.4s";
				if (opt.animation === "fade") opacityTime = "0.8s";
				currentTransition = "left 0.4s ease-in-out, opacity " + opacityTime + " ease-in-out";
				items.css("transition", currentTransition);
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
					var pos = [];
					var allSame = true;
					switch (opt.animation) {
						case "fade":
							var z1 = void 0,
							    z2 = void 0,
							    z2Opacity = void 0;
							items.each$(function (index) {
								if (this.css("z-index") == 1) z1 = index;
								if (this.css("z-index") == 2) {
									z2 = index;
									z2Opacity = parseFloat(this.css("opacity"));
								}
							});
							//console.log("get layout: z1=" + z1 + " z2=" + z2 + " z2Opacity=" + z2Opacity + " active=" + opt.active);
							if (z2 !== undefined) {
								if (z1 > z2) // Moving forward (a higher item index is in layer 1, becoming visible)
									return z1 + (1 - z2Opacity) - opt.active - 1;else // Moving backward
									return z1 + z2Opacity - opt.active;
							}
							if (z1 !== undefined) return z1 - opt.active;
							return 0;
						case "slide-in":
							var anyZero = false;
							var firstGtZero = -1;
							items.each$(function (index) {
								var left = parseFloat(this.css("left"));
								pos.push(left);
								if (left !== pos[0]) allSame = false;
								if (left === 0) anyZero = true;
								if (left > 0 && firstGtZero === -1) firstGtZero = index;
							});
							if (allSame && pos[0] < 0) return items.length - 1 - pos[0] / itemWidth - opt.active;
							if (!anyZero) return -pos[0] / itemWidth - opt.active;
							if (firstGtZero > 0) return firstGtZero - pos[firstGtZero] / itemWidth - opt.active;
							return 0;
						case "slide-out":
							var anyPositive = false;
							var firstZero = -1;
							items.each$(function (index) {
								var left = parseFloat(this.css("left"));
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
							var activeItemLeft2 = parseFloat(items.eq(opt.active).css("left"));
							return -activeItemLeft2 / (itemWidth / 10);
						case "slide-all":
						default:
							var activeItemLeft = parseFloat(items.eq(opt.active).css("left"));
							return -activeItemLeft / itemWidth;
					}
				}

				// Setter
				switch (opt.animation) {
					case "fade":
						if (itemOffset !== 0) {
							var fullyVisible = opt.active + Math.trunc(itemOffset);
							var partiallyVisible = opt.active + Math.trunc(itemOffset) + Math.sign(itemOffset);
							//console.log(fullyVisible, partiallyVisible);
							items.each$(function (index) {
								if (index === fullyVisible) {
									this.css("z-index", 1).css("opacity", 1);
								} else if (index === partiallyVisible) {
									this.css("z-index", 2).css("opacity", Math.abs(itemOffset) - Math.trunc(Math.abs(itemOffset)));
								} else {
									this.css("z-index", 0).css("opacity", 0);
								}
							});
						} else {
							var _z = void 0,
							    _z2 = void 0,
							    _z2Opacity = void 0;
							items.each$(function (index) {
								if (this.css("z-index") == 1) _z = index;
								if (this.css("z-index") == 2) {
									_z2 = index;
									_z2Opacity = parseFloat(this.css("opacity"));
								}
							});
							//console.log("set layout: z1=" + z1 + " z2=" + z2 + " z2Opacity=" + z2Opacity + " active=" + opt.active);
							if (opt.active === _z) {
								items.eq(_z2).css("opacity", 0).css("pointer-events", "none");
							} else if (opt.active === _z2) {
								removeTransition();
								items.eq(_z).css("z-index", 2).css("opacity", 1 - _z2Opacity);
								items.eq(_z2).css("z-index", 1).css("opacity", 1).css("pointer-events", "");
								forceReflow();
								if (!opt._isDragging) addTransition();
								items.eq(_z).css("opacity", 0).css("pointer-events", "none");
							} else {
								var currentVisible = void 0;
								items.each$(function (index) {
									if (this.css("z-index") == 1) currentVisible = index;
								});
								removeTransition();
								items.eq(opt.active).css("z-index", 1).css("opacity", 1).css("pointer-events", "");
								forceReflow();
								if (!opt._isDragging) addTransition();
								items.each$(function (index) {
									if (index === opt.active) ;else if (index === currentVisible) {
										this.css("z-index", 2).css("opacity", 0).css("pointer-events", "none");
									} else {
										this.css("z-index", 0).css("opacity", 0).css("pointer-events", "");
									}
								});
							}
						}

						var status = "";
						items.each$(function (index) {
							status += index + ": z=" + this.css("z-index") + " op=" + this.css("opacity") + (index === opt.active ? " active" : "") + "\n";
						});
						//console.log(status);
						break;
					case "slide-in":
						items.each$(function (index) {
							var left = opt.active + itemOffset <= items.length - 1 ? minmax((index - opt.active - itemOffset) * 100, 0, 100) : (items.length - 1 - opt.active - itemOffset) * 100;
							this.css("left", left + "%");
							this.css("z-index", index);
						});
						break;
					case "slide-out":
						items.each$(function (index) {
							var left = opt.active + itemOffset >= 0 ? minmax((index - opt.active - itemOffset) * 100, -100, 0) : (-opt.active - itemOffset) * 100;
							this.css("left", left + "%");
							this.css("z-index", items.length - 1 - index);
						});
						break;
					case "slide-fade":
						items.each$(function (index) {
							var percent = (index - opt.active) * 100 / 10;
							var left = (index - opt.active) * opt._gutterOffset - itemOffset * stage.width() / 10;
							this.css("left", "calc(" + percent + "% + " + left + "px)");
							var opacity = 1 - minmax(Math.abs(index - (opt.active + itemOffset)), 0, 1);
							this.css("opacity", opacity);
						});
						break;
					case "slide-all":
					default:
						items.each$(function (index) {
							var percent = (index - opt.active) * opt._itemWidthPercent;
							var left = (index - opt.active) * opt._gutterOffset - itemOffset * stage.width() / opt.items;
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
			if (carousel.length === 0) return; // Nothing to do
			var opt = loadOptions("carousel", carousel);
			return opt.active;
		}

		// Setter
		return this.each(function () {
			var carousel = $(this);
			var opt = loadOptions("carousel", carousel);
			if (opt._isDragging) return; // Ignore request while dragging
			var items = carousel.find("." + carouselClass).children();
			if (indexOrItem === Infinity) indexOrItem = items.length; // Infinity can't be handled by Math.min
			var index;
			if ($.isNumeric(indexOrItem)) {
				index = +indexOrItem;
			} else {
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

	// This file uses its own scope to keep its helper functions private and make it reusable independently.
	// There are a few places where jQuery is used but they can easily be replaced with DOM calls if necessary.
	(function (undefined) {

		// Parses any color value understood by a browser into an object with r, g, b, a properties.
		function Color(value) {
			// Allow calling without "new" keyword
			if (!(this instanceof Color)) return new Color(value);

			if (typeof value === "string") {
				this.format = value.match(/^rgba?\(/) ? "CSS" : "HTML";

				// Add "#" prefix if missing and the data is otherwise looking good (3/6/8 hex digits)
				if (value.match(/^\s*[0-9A-Fa-f]{3}([0-9A-Fa-f]{3}([0-9A-Fa-f]{2})?)?\s*$/)) value = "#" + value.trim();

				// Let the browser do the work
				var color = $("<div/>").css("color", value).css("color");
				var match = color.match(/rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*([0-9.]+)\s*)?\)/);
				if (match) {
					this.r = keep255(Number(match[1]));
					this.g = keep255(Number(match[2]));
					this.b = keep255(Number(match[3]));
					this.a = match[4] !== undefined ? keep1(Number(match[4])) : 1;
					return;
				}

				// Browser wasn't in the mood (probably Chrome with a named color), try harder
				var context = $("<canvas width='1' height='1'/>")[0].getContext("2d");
				context.fillStyle = value;
				context.fillRect(0, 0, 1, 1);
				var data = context.getImageData(0, 0, 1, 1).data;
				this.r = data[0];
				this.g = data[1];
				this.b = data[2];
				this.a = data[3] / 255;
				// If this is wrong, the named color probably doesn't exist, but we can't detect it
			}

			if (typeof value === "number") {
				this.format = "IntARGB";
				this.r = value >> 16 & 0xff;
				this.g = value >> 8 & 0xff;
				this.b = value & 0xff;
				var a = value >> 24 & 0xff;
				this.a = a !== 0 ? round(a / 255, 3) : 1;
				return;
			}

			if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object") {
				this.format = value.format !== undefined ? value.format : "Object";
				this.r = keep255(value.r);
				this.g = keep255(value.g);
				this.b = keep255(value.b);
				this.a = value.a !== undefined ? keep1(value.a) : 1;
				return;
			}
			console.error("Invalid color:", value);
		}

		// Make it public
		window.Color = Color;

		// Now add object methods
		var Color_prototype = Color.prototype;

		// Formats the color in the format it was originally parsed from.
		Color_prototype.toString = function () {
			switch (this.format) {
				case "IntARGB":
					return this.toIntARGB();
				case "HTML":
					return this.toHTML();
				case "CSS":
				default:
					return this.toCSS();
			}
		};

		// Formats a color object into a CSS rgb() string.
		Color_prototype.toCSS = function () {
			if (this.a === undefined || this.a === 1) return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
			return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
		};

		// Formats a color object into an HTML hexadecimal string.
		Color_prototype.toHTML = function () {
			function conv(number) {
				return (number < 16 ? "0" : "") + round(keep255(number)).toString(16).toLowerCase();
			}

			var str = "#" + conv(this.r) + conv(this.g) + conv(this.b);
			if (this.a !== undefined && this.a !== 1) str += conv(this.a * 255);
			return str;
		};

		// Converts a color object into an integer number like 0xAARRGGBB.
		Color_prototype.toIntARGB = function () {
			return (this.a !== undefined ? round(keep1(this.a) * 255) : 255) << 24 | round(keep255(this.r)) << 16 | round(keep255(this.g)) << 8 | round(keep255(this.b));
		};

		// Calculates the HSL components from the RGB components in the color object.
		Color_prototype.updateHSL = function () {
			this.r = keep255(this.r);
			this.g = keep255(this.g);
			this.b = keep255(this.b);

			var r = this.r / 255;
			var g = this.g / 255;
			var b = this.b / 255;
			var min = Math.min(r, g, b);
			var max = Math.max(r, g, b);

			if (max === min) this.h = 0;else if (max === r) this.h = 60 * (g - b) / (max - min) % 360;else if (max === g) this.h = (60 * (b - r) / (max - min) + 120) % 360;else // if (max === b)
				this.h = (60 * (r - g) / (max - min) + 240) % 360;
			if (this.h < 0) this.h += 360;

			this.s = 0; // Just for the order of the properties
			this.l = (max + min) / 2;

			if (max === min) this.s = 0;else if (this.l <= 0.5) this.s = (max - min) / (2 * this.l);else this.s = (max - min) / (2 - 2 * this.l);
			return this;
		};

		// Calculates the RGB components from the HSL components in the color object.
		Color_prototype.updateRGB = function () {
			this.h = minmax(this.h, 0, 366);
			this.s = keep1(this.s);
			this.l = keep1(this.l);

			var q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
			var p = 2 * this.l - q;
			var h = this.h / 360; // Normalise hue to 0..1
			var t = { r: h + 1 / 3, g: h, b: h - 1 / 3 };

			var that = this;
			["r", "g", "b"].forEach(function (c) {
				if (t[c] < 0) t[c]++;
				if (t[c] > 1) t[c]--;
				if (t[c] < 1 / 6) that[c] = p + (q - p) * 6 * t[c];else if (t[c] < 1 / 2) that[c] = q;else if (t[c] < 2 / 3) that[c] = p + (q - p) * 6 * (2 / 3 - t[c]);else that[c] = p;
				that[c] = round(that[c] * 255);
			});
			if (this.a === undefined) this.a = 1;
			return this;
		};

		// Returns a blended color with the specified ratio from 0 (no change) to 1 (only other color).
		Color_prototype.blendWith = function (other, ratio, includeAlpha) {
			var isHSL = this.h !== undefined || other.h !== undefined;
			var color = Color(this);
			other = Color(other);
			ratio = keep1(ratio);
			["r", "g", "b"].forEach(function (c) {
				color[c] = keep255(round(extendFF(color[c]) + (extendFF(other[c]) - extendFF(color[c])) * ratio));
			});
			if (includeAlpha) color.a = round(color.a + (other.a - color.a) * ratio, 3);
			if (isHSL) color.updateHSL();
			return color;
		};

		// Returns the inverted color.
		Color_prototype.invert = function () {
			return processColor(this, false, function () {
				this.r = 255 - keep255(this.r);
				this.g = 255 - keep255(this.g);
				this.b = 255 - keep255(this.b);
			});
		};

		// Returns the complementary color.
		Color_prototype.complement = function () {
			return processColor(this, true, function () {
				this.h = (this.h + 180) % 360;
			});

			// TODO: Add an option to return multiple complementary colors, as array
		};

		// Returns a color that is lighter by the factor between 0 (unchanged) and 1 (white).
		Color_prototype.lighten = function (factor) {
			return processColor(this, true, function () {
				this.l = keep1(this.l + keep1(factor) * (1 - this.l));
			});
		};

		// Returns a color that is darker by the factor between 0 (unchanged) and 1 (black).
		Color_prototype.darken = function (factor) {
			return processColor(this, true, function () {
				this.l = keep1(this.l * (1 - keep1(factor)));
			});
		};

		// TODO: Add functions to (de)saturate the color (similar to lighten and darken?)

		// Returns the grayscale color by perceived brightness.
		Color_prototype.gray = function () {
			return processColor(this, false, function () {
				var value = round(keep255(this.r) * 0.3 + keep255(this.g) * 0.59 + keep255(this.b) * 0.11);
				this.r = value;
				this.g = value;
				this.b = value;
				this.a = 1;
			});
		};

		// Returns a value indicating whether the specified color is dark.
		Color_prototype.isDark = function () {
			return this.gray().r < 144;
		};

		// Returns white or black as suitable for the text color over the background color.
		Color_prototype.text = function () {
			return processColor(this, false, function () {
				var value = this.isDark() ? 255 : 0;
				this.r = value;
				this.g = value;
				this.b = value;
				this.a = 1;
			});
		};

		function processColor(color, hslMode, fn) {
			color = Color(color); // Make a copy
			if (hslMode) color.updateHSL();
			fn.call(color);
			if (hslMode) color.updateRGB();
			return color;
		}

		function extendFF(value) {
			return value === 0xff ? 256 : value;
		}

		function keep1(value) {
			return minmax(value, 0, 1);
		}

		function keep255(value) {
			return minmax(value, 0, 255);
		}
	})();

	// Gets the offset and dimensions of the first selected element.
	$.fn.rect = function () {
		var offset = this.offset();
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
	// value: Sets the visible state of the selected elements.
	$.fn.visible = function (value) {
		// Setter
		if (value !== undefined) {
			return this.each(function () {
				if (value) $(this).show();else $(this).hide();
			});
		}

		// Getter
		if (this.length === 0) return;
		return this.css("display") !== "none";
	};

	// Determines whether the selected element is disabled.
	// value: Sets the disabled state of the selected elements and the associated label(s).
	$.fn.disabled = function (value) {
		// Setter
		if (value !== undefined) {
			return this.each(function () {
				if (value) $(this).disable();else $(this).enable();
			});
		}

		// Getter
		if (this.length === 0) return;
		// Also explicitly check for the property to support the disabledchange hook
		return this[0].disabled || this.attr("disabled") !== undefined;
	};

	// Enables the selected elements and the associated label(s).
	$.fn.enable = function () {
		return this.each$(function () {
			var supportsDisabledProp = "disabled" in this[0];
			if (supportsDisabledProp) {
				// Set property so that the hook can trigger the change event.
				// This automatically removes the HTML attribute as well.
				this.prop("disabled", false);
			} else if (this.attr("disabled") !== undefined) {
				// Don't set the property or it will be added where not supported.
				// Only remove HTML attribute to allow CSS styling other elements than inputs
				this.removeAttr("disabled");
				// Trigger the event manually
				this.trigger("disabledchange");
			}

			this.parents("label").enable();
			var id = this.attr("id");
			if (id) $("label[for='" + id + "']").enable();
		});
	};

	// Disables the selected elements and the associated label(s).
	$.fn.disable = function () {
		return this.each$(function () {
			var supportsDisabledProp = "disabled" in this[0];
			if (supportsDisabledProp) {
				// Set property so that the hook can trigger the change event.
				// This automatically sets the HTML attribute as well.
				this.prop("disabled", true);
			} else if (this.attr("disabled") === undefined) {
				// Don't set the property or it will be added where not supported.
				// Only set HTML attribute to allow CSS styling other elements than inputs
				this.attr("disabled", "");
				// Trigger the event manually
				this.trigger("disabledchange");
			}

			this.parents("label").disable();
			var id = this.attr("id");
			if (id) $("label[for='" + id + "']").disable();
		});
	};

	// Toggles the disabled state of the selected elements and the associated label(s).
	$.fn.toggleDisabled = function () {
		return this.each$(function () {
			if (this.disabled()) this.enable();else this.disable();
		});
	};

	// Returns the first child of each selected element, in the fastest possible way.
	$.fn.firstChild = function () {
		var ret = $();
		this.each(function () {
			ret = ret.add(this.firstElementChild);
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
			var probe = "";
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
	// type: The event type ("down", "move", "up", "cancel"). Multiple types can be space-delimited.
	// handler: The event handler function.
	// capture: Specifies the capture option. If true, DOM addEventListener ist used instead of jQuery.
	// Returns a function that removes the event handler. Keep it and call it, there is no other way to remove it.
	$.fn.pointer = function (type, handler, capture) {
		var add,
		    remove,
		    pointer,
		    mouse,
		    touch,
		    touchType = type,
		    mouseHandler,
		    touchHandler;
		var types = type.trim().split(/\s+/);

		// Handle multiple types
		if (types.length > 1) {
			// Call self for each type and combine all event remover functions in a new function to return
			var eventRemovers = [];
			var that = this;
			types.forEach(function (type) {
				eventRemovers.push($(that).pointer(type, handler, capture));
			});
			return function () {
				eventRemovers.forEach(function (eventRemover) {
					eventRemover();
				});
			};
		}

		// Set up the functions to call and bind their context
		if (capture) {
			// Handle multiple selected elements
			if (this.length > 1) {
				// Call self for each element and combine all event remover functions in a new function to return
				var _eventRemovers = [];
				var _that = this;
				this.each(function () {
					_eventRemovers.push($(_that).pointer(type, handler, capture));
				});
				return function () {
					_eventRemovers.forEach(function (eventRemover) {
						eventRemover();
					});
				};
			}
			add = this[0].addEventListener.bind(this[0]);
			remove = this[0].removeEventListener.bind(this[0]);
		} else {
			add = this.on.bind(this);
			remove = this.off.bind(this);
			capture = undefined;
		}

		// Fix touch event type names that are a little different
		switch (type) {
			case "down":
				touchType = "start";break;
			case "up":
				touchType = "end";break;
		}

		// Determine the supported (and necessary) event types
		pointer = "onpointer" + type in window;
		if (!pointer) {
			mouse = "onmouse" + type in window;
			touch = "ontouch" + touchType in window;
		}

		// Prepare adapted handlers for fallback event types
		if (mouse) mouseHandler = function mouseHandler(event) {
			return handleMouseEvent(handler, event);
		};
		if (touch) touchHandler = function touchHandler(event) {
			return handleTouchEvent(handler, event);
		};

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

		// Constrains the drag movement inside the specified element or the "parent" of the dragged element. Default: None.
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
			if ($elem.hasClass(draggableClass)) return; // Already done
			$elem.addClass(draggableClass);
			var dragging, draggingCancelled, dragPoint, elemRect, minDragDistance, pointerId, htmlCursor;
			var opt = initOptions("draggable", draggableDefaults, $elem, {}, options);

			var handle = opt.handle ? $elem.find(opt.handle) : $elem;

			// Allow Pointer API to work properly in Edge
			if (opt.axis === "x") handle.css("touch-action", "pan-y pinch-zoom");else if (opt.axis === "y") handle.css("touch-action", "pan-x pinch-zoom");else handle.css("touch-action", "pinch-zoom");

			var eventRemovers = [];
			handle.pointer("down", function (event) {
				if (event.button === 0) {
					event.preventDefault();
					event.stopImmediatePropagation();
					if (dragging) return;
					draggingCancelled = false;
					dragPoint = { left: event.pageX, top: event.pageY };
					pointerId = event.pointerId;
					minDragDistance = event.pointerType === "touch" ? 8 : 4;
					eventRemovers.push($(window).pointer("move", onMove, true));
					eventRemovers.push($(window).pointer("up cancel", onEnd, true));
				}
			});

			if (opt.cancel) {
				$elem.find(opt.cancel).pointer("down", function (event) {
					event.preventDefault();
					event.stopImmediatePropagation();
				});
			}

			function onMove(event) {
				if (event.pointerId !== pointerId) return; // Not my pointer
				if (draggingCancelled) return; // Don't try again until the button was released

				// Consider starting a drag operation
				if (dragPoint && !dragging && !$elem.disabled()) {
					var distance = Math.sqrt(Math.pow(event.pageX - dragPoint.left, 2) + Math.pow(event.pageY - dragPoint.top, 2));
					if (distance >= minDragDistance) {
						elemRect = $elem.rect();
						var event2 = $.Event("draggablestart");
						event2.dragPoint = dragPoint;
						event2.newPoint = { left: event.pageX, top: event.pageY };
						$elem.trigger(event2);
						if (!event2.isDefaultPrevented()) {
							dragging = true;
							opt.dragClass && $elem.addClass(opt.dragClass);
							elem.setCapture && elem.setCapture(); // Firefox only (set cursor over entire desktop)
							$("html").addClass(resetAllCursorsClass); // All browsers (set cursor at least within page)
							if (opt.stack) {
								stackElements($(opt.stack), elem);
							}
							htmlCursor = document.documentElement.style.getPropertyValue("cursor");
							document.documentElement.style.setProperty("cursor", opt.dragCursor || $elem.actualCursor(), "important");
						} else {
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
						var gridBase = $elem.parent().offset();
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
						var cont = void 0;
						if (opt.containment === "parent") cont = $elem.parent();else cont = $(opt.containment);
						if (cont.length !== 0) {
							var contRect = cont.rect();
							var stepX = opt.grid ? opt.grid[0] : 1;
							var stepY = opt.grid ? opt.grid[1] : 1;
							while (newPoint.left < contRect.left) {
								newPoint.left += stepX;
							}while (newPoint.left + elemRect.width > contRect.right) {
								newPoint.left -= stepX;
							}while (newPoint.top < contRect.top) {
								newPoint.top += stepY;
							}while (newPoint.top + elemRect.height > contRect.bottom) {
								newPoint.top -= stepY;
							}
						}
					}

					// Move element
					var _event = $.Event("draggablemove");
					_event.elemRect = elemRect;
					_event.newPoint = newPoint;
					$elem.trigger(_event);
					if (!_event.isDefaultPrevented()) {
						$elem.offset(_event.newPoint);
					}

					// Handle auto-scrolling
					if (opt.scroll) {
						scrollIntoView($elem.rect());
					}
				}
			}

			function onEnd(event) {
				if (event.pointerId !== pointerId) return; // Not my pointer

				if (event.button === 0) {
					var wasDragging = dragging;
					dragPoint = undefined;
					dragging = false;
					pointerId = undefined;
					opt.dragClass && $elem.removeClass(opt.dragClass);

					eventRemovers.forEach(function (eventRemover) {
						eventRemover();
					});
					eventRemovers = [];

					if (wasDragging) {
						elem.releaseCapture && elem.releaseCapture();
						$("html").removeClass(resetAllCursorsClass);
						document.documentElement.style.setProperty("cursor", htmlCursor);

						var event2 = $.Event("draggableend");
						event2.revert = function () {
							$elem.offset(elemRect);
						};
						$elem.trigger(event2);
					}
				}
			}
		});
	}

	registerPlugin("draggable", draggable);
	$.fn.draggable.defaults = draggableDefaults;

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
		if (dropdown.length === 0) return this; // Nothing to do
		if (dropdown.parent().hasClass(dropdownContainerClass)) return; // Already open
		var opt = initOptions("dropdown", dropdownDefaults, dropdown, {}, options);

		var autoPlacement = false;
		if (!opt.placement) {
			opt.placement = "bottom-left";
			autoPlacement = true;
		} else if (opt.placement === "right") {
			opt.placement = "bottom-right";
			autoPlacement = true;
		}
		var optPlacement = opt.placement;

		var container = $("<div/>").addClass(dropdownContainerClass).appendTo("body");
		if (dropdown.hasClass("bordered")) {
			container.addClass("bordered");
		}
		if ($(document.body).hasClass("ff-dimmed")) {
			container.addClass("no-dim");
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
		} else if (optPlacement.startsWith("bottom")) {
			top = targetRect.bottom;
			direction = "bottom";
		} else if (optPlacement.startsWith("left")) {
			left = targetRect.left - dropdownWidth;
			direction = "left";
		} else if (optPlacement.startsWith("right")) {
			left = targetRect.right;
			direction = "right";
		}

		if (optPlacement.endsWith("left")) {
			left = targetRect.left;
		} else if (optPlacement.endsWith("right")) {
			left = targetRect.right - dropdownWidth;
		} else if (optPlacement.endsWith("top")) {
			top = targetRect.top;
		} else if (optPlacement.endsWith("bottom")) {
			top = targetRect.bottom - dropdownHeight;
		}

		if (optPlacement === "top-center" || optPlacement === "bottom-center") {
			left = (targetRect.left + targetRect.right) / 2 - dropdownWidth / 2;
		} else if (optPlacement === "left-center" || optPlacement === "right-center") {
			top = (targetRect.top + targetRect.bottom) / 2 - dropdownHeight / 2;
		}

		if (autoPlacement && left + dropdownWidth > viewportWidth) {
			left = viewportWidth - dropdownWidth;
		}
		if (autoPlacement && top + dropdownHeight > viewportHeight + $(window).scrollTop()) {
			top = targetRect.top - dropdownHeight;
			direction = "top";
		}

		container.offset({ top: top, left: left }).addClass("animate-" + direction);
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
				dropdown.dropdown.close(true);
			}
		}
	}

	// Closes the selected dropdown.
	//
	// closeEventTriggered: For internal use.
	function closeDropdown(closeEventTriggered) {
		var dropdown = this.first();
		if (dropdown.length === 0) return this; // Nothing to do
		var container = dropdown.parent();
		if (!container.hasClass(dropdownContainerClass)) return this; // Dropdown is not open
		//var opt = loadOptions("dropdown", dropdown);

		$(document).off("click.dropdown-close");
		container.removeClass("open").addClass("closed");
		container.on("transitionend", function () {
			dropdown.detach().appendTo("body");
			container.remove();
		});
		if (!closeEventTriggered) {
			var event = $.Event("dropdownclose");
			dropdown.trigger(event);
		}
		return this;
	}

	registerPlugin("dropdown", createDropdown, {
		close: closeDropdown
	});
	$.fn.dropdown.defaults = dropdownDefaults;

	var inputWrapperClass = "ff-input-wrapper";
	var repeatButtonClass = "ff-repeat-button";
	var styleCheckboxClass = "ff-checkbox";
	var treeStateClass = "ff-threestate";
	var textareaWrapperClass = "ff-textarea-wrapper";

	// Makes each selected button trigger repeated click events while being pressed.
	// The button will not trigger a click event anymore but instead repeatclick events.
	function repeatButton() {
		return this.each(function () {
			var button = $(this);
			if (button.hasClass(repeatButtonClass)) return; // Already done
			button.addClass(repeatButtonClass);
			var timeout, ms;
			button.on("mousedown touchstart", function (event) {
				event.preventDefault();
				ms = 500;
				click();
			});
			button.on("mouseup mouseleave touchend touchcancel", function (event) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = undefined;
				}
				ms = undefined;
			});
			button.click(function (event) {
				event.preventDefault();
			});

			// Triggers the button's click event and repeats the timeout
			function click() {
				button.trigger("repeatclick");
				timeout = setTimeout(click, ms);
				ms = 50 + Math.round((ms - 50) * 0.8);
			}
		});
	}

	registerPlugin("repeatButton", repeatButton);

	// Adds buttons to each selected input[type=number] element to decrement or increment the value.
	function spinner() {
		return this.each(function () {
			var input = $(this);
			if (input.parent().hasClass(inputWrapperClass)) return; // Already done

			// Put a wrapper between the input and its parent
			var wrapper = $("<div/>").addClass(inputWrapperClass).attr("style", input.attr("style"));
			input.replaceWith(wrapper).appendTo(wrapper); // TODO: replaceWith removes the input. Choose an option that uses detach() instead
			input.attr("autocomplete", "off");

			// Add control buttons
			var buttons = [];
			var decButton = $("<button type='button'/>").appendTo(wrapper).text('\u2212'); // &minus;
			buttons.push(decButton);
			decButton.on("repeatclick", function (event) {
				if (input.disabled()) return;
				var value = +input.val();
				var min = input.attr("min");
				var max = input.attr("max");
				var stepBase = min !== undefined ? parseFloat(min) : 0;
				var step = parseFloat(input.attr("step") || 1);
				value = (Math.ceil((value - stepBase) / step) - 1) * step + stepBase; // Set to next-smaller valid step
				if (min !== undefined && value < parseFloat(min)) value = min;
				while (max !== undefined && value > parseFloat(max)) {
					value -= step;
				}input.val(value);
				input.change();
			});
			decButton.repeatButton();
			var incButton = $("<button type='button'/>").appendTo(wrapper).text("+");
			buttons.push(incButton);
			incButton.on("repeatclick", function (event) {
				if (input.disabled()) return;
				var value = +input.val();
				var min = input.attr("min");
				var max = input.attr("max");
				var stepBase = min !== undefined ? parseFloat(min) : 0;
				var step = parseFloat(input.attr("step") || 1);
				value = (Math.floor((value - stepBase) / step) + 1) * step + stepBase; // Set to next-greater valid step
				if (min !== undefined && value < parseFloat(min)) value = min;
				while (max !== undefined && value > parseFloat(max)) {
					value -= step;
				}input.val(value);
				input.change();
			});
			incButton.repeatButton();
			bindInputButtonsDisabled(input, buttons);
		});
	}

	registerPlugin("spinner", spinner);

	// Converts each selected input[type=color] element into a text field with color picker button.
	function colorPicker() {
		return this.each(function () {
			var input = $(this);
			if (input.parent().hasClass(inputWrapperClass)) return; // Already done
			var lastColor;

			// Put a wrapper between the input and its parent
			var wrapper = $("<div/>").addClass(inputWrapperClass).attr("style", input.attr("style"));
			input.replaceWith(wrapper).appendTo(wrapper); // TODO: replaceWith removes the input. Choose an option that uses detach() instead
			input.attr("type", "text").attr("autocomplete", "off");

			// Create picker dropdown
			var dropdown = $("<div/>").addClass("dropdown bordered ff-colorpicker");
			dropdown.keydown(function (event) {
				if (event.keyCode >= 37 && event.keyCode <= 40) {
					// Arrow keys
					event.preventDefault();
					dropdown.find("button").first().focus();
					dropdown.removeAttr("tabindex");
				}
				if (event.keyCode === 27) {
					// Esc
					event.preventDefault();
					dropdown.dropdown.close();
					pickButton[0].focus();
				}
			});

			// Add control buttons
			var buttons = [];
			var pickButton = $("<button type='button'/>").addClass("ff-colorbutton").appendTo(wrapper);
			buttons.push(pickButton);
			var colorBox = $("<div/>").appendTo(pickButton).text('\u2026'); // &hellip;
			input.on("input change", function () {
				return setColor(lastColor = input.val());
			});
			setColor(lastColor = input.val());

			// Create dropdown contents
			// Add grey tones explicitly
			var colors = [0x000000, 0x404040, 0x707070, 0xa0a0a0, 0xd0d0d0, 0xf0f0f0, 0xffffff];
			// Add colors with shades
			[0xff0000, // red
			0xff8000, // orange
			0xffc000, // orangeyellow
			0xffe000, // gold
			0xffff00, // yellow
			0xc0ff00, // greenyellow
			0x00ff00, // green
			0x00ffc0, // greencyan
			0x00ffff, // cyan
			0x00c0ff, // bluecyan
			0x0080ff, // lightblue
			0x0000ff, // blue
			0x8000ff, // purple
			0xc000ff, // violet
			0xff00ff // magenta
			].forEach(function (baseColor_) {
				var baseColor = Color(baseColor_);
				[0.75, 0.5, 0.25].forEach(function (factor) {
					return colors.push(baseColor.blendWith(0x000000, factor));
				});
				colors.push(baseColor.toHTML());
				[0.5, 0.75, 0.875].forEach(function (factor) {
					return colors.push(baseColor.blendWith(0xffffff, factor));
				});
			});
			var buttonRow;
			colors.forEach(function (color, index) {
				color = Color(color);
				color.format = "HTML";
				if (index % 7 === 0) buttonRow = $("<div/>").appendTo(dropdown);
				var button = $("<button type='button'/>").css("background", color).data("color", String(color)).appendTo(buttonRow);
				if (color.isDark()) button.addClass("dark");
				button.click(function (event) {
					setColor(lastColor = color, true);
					dropdown.dropdown.close();
					pickButton[0].focus();
				});
				button.focus(function (event) {
					dropdown.find("button.active").removeClass("active");
					button.addClass("active");
					setColor(color, true);
				});
				button.keydown(function (event) {
					var activeButton = dropdown.find("button.active");
					var newButton;

					switch (event.keyCode) {
						case 37:
							// Left
							newButton = activeButton.prev();
							break;
						case 39:
							// Right
							newButton = activeButton.next();
							break;
						case 40:
							// Down
							newButton = activeButton.parent().next().children().eq(activeButton.index());
							break;
						case 38:
							// Up
							newButton = activeButton.parent().prev().children().eq(activeButton.index());
							break;
						case 27:
							// Esc
							setColor(lastColor, true);
							dropdown.dropdown.close();
							pickButton[0].focus();
							break;
						case 13:
							// Enter
							button.click();
							break;
						default:
							return; // Not handled
					}

					event.preventDefault();
					event.stopImmediatePropagation();
					newButton && newButton[0] && newButton[0].focus();
				});
			});

			pickButton.click(function (event) {
				var currentColor = input.val();
				var activeButton;
				dropdown.find("button").each$(function () {
					var active = this.data("color") === currentColor;
					this.toggleClass("active", active);
					if (active) activeButton = this[0];
				});

				dropdown.dropdown(pickButton, { placement: "right" });
				if (activeButton) {
					activeButton.focus();
				} else {
					dropdown.attr("tabindex", "-1");
					dropdown.focus();
				}
			});
			bindInputButtonsDisabled(input, buttons);

			function setColor(color, toInput) {
				if (toInput) input.val(color);
				colorBox.css("background", color);
				colorBox.css("color", Color(color).text());
			}
		});
	}

	registerPlugin("colorPicker", colorPicker);

	// Applies the enhanced style on the selected checkbox and radio input elements.
	function styleCheckbox() {
		return this.each(function () {
			var input = $(this);
			if (input.hasClass(styleCheckboxClass)) return; // Already done
			if (!input.is("input[type=checkbox], input[type=radio]")) return; // Wrong element

			if (input.parents("label").length === 0) {
				// Styled input needs a label around it to remain clickable
				input.wrap("<label class='empty'></label>");
			}
			input.addClass(styleCheckboxClass).after($("<span/>"));
		});
	}

	registerPlugin("styleCheckbox", styleCheckbox);

	// Makes each selected checkbox cycle through indeterminate (third) state on clicking.
	function threeState() {
		return this.each(function () {
			var input = $(this);
			if (input.hasClass(treeStateClass)) return; // Already done
			if (!input.is("input[type=checkbox]")) return; // Wrong element
			input.addClass(treeStateClass);

			var cb = input[0];
			// Based on: https://css-tricks.com/indeterminate-checkboxes/
			input.click(function (event) {
				// indeterminate is unset when the user clicks to change the checked state.
				// readonly (ineffective for checkboxes) is used to backup the previous indeterminate state.
				// In this event, checked is already updated to the new desired state.
				if (cb.checked && !cb.readOnly) {
					// Was unchecked and not readonly (indeterminate) -> uncheck and make indeterminate
					cb.checked = false;
					cb.readOnly = cb.indeterminate = true;
				} else if (cb.readOnly) {
					// Was readonly (indeterminate) -> check and forget indeterminate state (unset readonly)
					cb.checked = true; // Firefox and Chrome are already checked here, Edge is not
					cb.readOnly = false;
				}
			});
		});
	}

	registerPlugin("threeState", threeState);

	// Makes each selected textarea element automatically adjust its height to its content.
	function autoHeight(minRows, maxRows, extraRows) {
		minRows = minRows || 3;
		return this.each(function () {
			var textarea = $(this);
			if (textarea.parent().hasClass(textareaWrapperClass)) return; // Already done

			// Put a wrapper between the textarea and its parent, and host a new shadow element in
			// the wrapper as well. The textarea is set to fill the container, and the shadow
			// element provides the size for the wrapper.
			var wrapper = $("<div/>").addClass(textareaWrapperClass).attr("style", textarea.attr("style"));
			textarea.replaceWith(wrapper).appendTo(wrapper); // TODO: replaceWith removes the input. Choose an option that uses detach() instead
			var shadowContent = $("<div/>").appendTo(wrapper);

			var outerHeightOffset = textarea.outerHeight() - textarea.height();
			var lineHeight = parseFloat(textarea.css("line-height"));
			if (lineHeight) {
				shadowContent.css("min-height", minRows * lineHeight + outerHeightOffset);
				if (maxRows) {
					shadowContent.css("max-height", maxRows * lineHeight + outerHeightOffset);
				}
			}

			textarea.on("input.autoheight", updateShadow);
			updateShadow();

			function updateShadow() {
				// Copy textarea contents; browser will calculate correct height of shadow copy,
				// which will make overall wrapper taller, which will make textarea taller.
				// Also make sure the last line break is visible.
				// Add an extra line break to convince the browser that the textarea doesn't need a scrollbar.
				var text = textarea.val().replace(/\n$/, "\n.");
				if (extraRows) text += "\n.".repeat(extraRows);
				shadowContent.text(text);

				// Copy all layout-relevant styles from textarea to shadow element, in case they've changed
				["border-bottom-style", "border-bottom-width", "border-left-style", "border-left-width", "border-right-style", "border-right-width", "border-top-style", "border-top-width", "font-family", "font-feature-settings", "font-kerning", "font-size", "font-stretch", "font-style", "font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian", "font-variant-ligatures", "font-variant-numeric", "font-variant-position", "font-weight", "hyphens", "letter-spacing", "line-height", "padding-bottom", "padding-left", "padding-right", "padding-top", "text-transform", "word-break", "word-spacing"].forEach(copyStyle);
			}

			function copyStyle(name) {
				shadowContent.css(name, textarea.css(name));
			}
		});
	}

	registerPlugin("autoHeight", autoHeight);

	// Converts each selected list element into a menu. Submenus are opened for nested lists.
	function menu() {
		return this.each(function () {
			var menu = $(this);
			var isVertical = menu.hasClass("vertical");
			var itemsWithSubmenu = menu.children("li").has("ul");
			itemsWithSubmenu.each(function () {
				var item = $(this);
				item.addClass("ff-has-submenu");
				var submenu = item.children("ul").first();
				if (submenu.hasClass("ff-submenu")) return; // Already done
				submenu.addClass("ff-submenu dropdown");

				// Open submenu on click
				item.children("a").first().click(function (event) {
					event.preventDefault();
					if (item.disabled()) return;
					var ddOpt = {};
					if (isVertical) {
						ddOpt["placement"] = "right-top";
					}
					submenu.dropdown(item, ddOpt);
					item.addClass("open");
					submenu.one("dropdownclose", function () {
						item.removeClass("open");
					});
				});

				// Prepare separators
				submenu.children("li").each$(function () {
					if (this.text() === "-") {
						this.text("");
						this.addClass("separator");
					}
				});

				// Close submenu when clicking on one of its items
				submenu.find("li > a:not(.stay-open)").each$(function () {
					this.click(function () {
						submenu.dropdown.close();
					});
				});
			});

			// Replace # href with a true no-op
			menu.find("li > a[href='#']").attr("href", "javascript:");
		});
	}

	registerPlugin("menu", menu);

	var messageCloseButtonClass = "ff-message-close-button";

	// Makes each selected message div element closable by adding a close button to it.
	function closableMessage() {
		return this.each(function () {
			var message = $(this);
			if (message.find("." + messageCloseButtonClass).length !== 0) return; // Already added

			// Add close button
			var closeButton = $("<a/>").addClass(messageCloseButtonClass).attr("href", "#").appendTo(message);
			message.addClass("closable");
			closeButton.click(function (event) {
				event.preventDefault();
				if (event.button === 0) {
					message.closableMessage.close();
				}
			});
		});
	}

	// Closes each selected message div and removes it from the document.
	function closeMessage() {
		return this.each(function () {
			var message = $(this);
			message.addClass("ff-closed");
			message.on("transitionend", function () {
				message.remove();
			});
		});
	}

	registerPlugin("closableMessage", closableMessage, {
		close: closeMessage
	});

	var backgroundDimmerClass = "ff-background-dimmer";
	var dimmingClass = "ff-dimming";
	var dimmedClass = "ff-dimmed";

	// Dims the entire document by adding an overlay.
	function dimBackground(noinput) {
		if ($("body > div." + backgroundDimmerClass + ":not(.closing)").length !== 0) return; // Already there
		$("body").addClass(dimmingClass).addClass(dimmedClass);
		var backgroundLayer = $("<div/>").addClass(backgroundDimmerClass).appendTo("body");
		noinput && backgroundLayer.addClass("noinput");
		forceReflow();
		backgroundLayer.css("opacity", "1");
	}

	// Removes the overlay from the document. The overlay is already click-through during its
	// fade-out transition.
	function undimBackground() {
		var backgroundLayer = $("body > div." + backgroundDimmerClass);
		if (backgroundLayer.length === 0) return; // Not there
		var $body = $("body");
		$body.removeClass(dimmedClass);
		backgroundLayer.addClass("closing").css("opacity", "0");
		backgroundLayer.on("transitionend", function () {
			if (!$body.hasClass(dimmedClass)) {
				// No other layer appeared in the meantime
				$body.removeClass(dimmingClass);
			}
			backgroundLayer.remove();
		});
	}

	var modalEventNamespace = ".ff-modal";
	var modalClass = "ff-modal-container";
	var modalCloseButtonClass = "ff-modal-close-button";

	// Defines default options for the modal plugin.
	var modalDefaults = {
		// Indicates whether the modal is closed when clicking anywhere outside of it or pressing Esc.
		// This also shows a close button in the model overlay. Default: true.
		cancellable: true,

		// The tooltip text for the close button. Default: empty.
		closeTooltip: "",

		// Indicates whether the page background is dimmed while the modal is open. Default: true.
		dimBackground: true
	};

	// Opens a modal with the selected element.
	function modal(options) {
		var modal = this.first();
		if (modal.length === 0) return this; // Nothing to do
		if (modal.parent().hasClass(modalClass)) return this; // Already open
		var opt = initOptions("modal", modalDefaults, modal, {}, options);
		if (opt.dimBackground) dimBackground();

		var container = $("<div/>").addClass(modalClass).appendTo("body");
		modal.detach().appendTo(container);
		modal.find(":focusable").first().focus().blur();

		preventScrolling();

		// Prevent moving the focus out of the modal
		$(document).on("focusin" + modalEventNamespace, function (event) {
			if ($(event.target).parents().filter(modal).length === 0) {
				// The focused element's ancestors do not include the modal, so the focus went out
				// of the modal. Bring it back.
				modal.find(":focusable").first().focus();
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}
		});

		var closeButton;
		if (opt.cancellable) {
			// Close on pressing the Escape key or clicking outside the modal
			$(document).on("keydown" + modalEventNamespace, function (event) {
				if (event.keyCode === 27) {
					// Escape
					event.preventDefault();
					modal.modal.close();
				}
			});
			container.click(function (event) {
				if (event.button === 0 && event.target === this) {
					modal.modal.close();
				}
			});

			// Add default close button
			closeButton = $("<a/>").addClass(modalCloseButtonClass).attr("href", "#").appendTo(modal);
			if (opt.closeTooltip) closeButton[0].title = opt.closeTooltip;
			closeButton.click(function (event) {
				event.preventDefault();
				if (event.button === 0) {
					modal.modal.close();
				}
			});
		}
		return this;
	}

	// Closes the selected modal.
	function closeModal() {
		var modal = this.first();
		if (modal.length === 0) return this; // Nothing to do
		var container = modal.parent();
		if (!container.hasClass(modalClass)) return this; // Modal is not open
		var opt = loadOptions("modal", modal);
		var closeButton = modal.find("." + modalCloseButtonClass).first();

		preventScrolling(false);
		$(document).off("focusin" + modalEventNamespace);
		$(document).off("keydown" + modalEventNamespace);
		modal.detach().appendTo("body");
		container.remove();
		if (closeButton) closeButton.remove();
		if (opt.dimBackground) undimBackground();

		var event = $.Event("close");
		modal.trigger(event);
		return this;
	}

	registerPlugin("modal", modal, {
		close: closeModal
	});
	$.fn.modal.defaults = modalDefaults;

	var offCanvasEventNamespace = ".ff-off-canvas";
	var offCanvasClass = "ff-off-canvas";

	// Defines default options for the off-canvas plugin.
	var offCanvasDefaults = {
		// Indicates whether the user can close the off-canvas panel by clicking anywhere outside of it or pressing the Escape key. Default: true.
		cancellable: true,

		// The side from which the off-canvas opens (left, right). Default: left.
		edge: "left",

		// Push the page content to the side when showing the off-canvas panel. Default: 1.
		// 0 doesn't push, 1 pushes the full panel width.
		push: 1
	};

	// Opens an off-canvas with the selected element.
	function offCanvas(options) {
		var offCanvas = this.first();
		if (offCanvas.length === 0) return this; // Nothing to do
		if (offCanvas.hasClass(offCanvasClass)) return this; // Already open
		var opt = initOptions("offCanvas", offCanvasDefaults, offCanvas, {}, options);

		offCanvas.addClass(offCanvasClass);
		offCanvas.detach().appendTo("body");

		if (["left", "right"].indexOf(opt.edge) === -1) opt.edge = "left";
		if (opt.edge === "left") opt._opposite = "right";else if (opt.edge === "right") opt._opposite = "left";

		var html = $("html");
		var width = offCanvas.outerWidth();

		opt._htmlStyle = {
			transition: html.css("transition"),
			overflowX: html.css("overflow-x")
		};

		$(window).on("resize" + offCanvasEventNamespace, function () {
			offCanvas.offCanvas.close();
		});

		//$(window).on("resize" + offCanvasEventNamespace, function () {   // TODO Failing workaround for Chrome/Android, see https://bugs.chromium.org/p/chromium/issues/detail?id=801621
		//	offCanvas.css("height", $(window).height());
		//});
		//offCanvas.css("height", $(window).height());

		// Initialise position
		offCanvas.css(opt.edge, -width);
		offCanvas.css(opt._opposite, "");
		forceReflow();
		offCanvas.css("transition", opt.edge + " 0.4s");
		html.css("transition", "margin 0.4s");
		html.css("overflow-x", "hidden");

		// Now start the transition to the opened state
		offCanvas.css(opt.edge, 0);
		html.css("margin-" + opt.edge, width * opt.push);
		html.css("margin-" + opt._opposite, -width * opt.push);

		dimBackground(true);

		offCanvas.find(":focusable").first().focus().blur();

		preventScrolling();

		// Prevent moving the focus out of the offCanvas
		$(document).on("focusin" + offCanvasEventNamespace, function (event) {
			if ($(event.target).parents().filter(offCanvas).length === 0) {
				// The focused element's ancestors do not include the offCanvas, so the focus went out
				// of the offCanvas. Bring it back.
				offCanvas.find(":focusable").first().focus();
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}
		});

		// Close on pressing the Escape key or clicking outside the offCanvas
		if (opt.cancellable) {
			$(document).on("keydown" + offCanvasEventNamespace, function (event) {
				if (event.keyCode === 27) {
					// Escape
					event.preventDefault();
					offCanvas.offCanvas.close();
				}
			});

			setTimeout(function () {
				$(document).on("click" + offCanvasEventNamespace, function (event) {
					if (event.button === 0) {
						offCanvas.offCanvas.close();
					}
				});
			}, 20);
			offCanvas.on("click" + offCanvasEventNamespace, function (event) {
				// Don't close the off-canvas when clicking inside of it
				event.stopImmediatePropagation();
			});
		}

		offCanvas.trigger("offcanvasopen");
		return this;
	}

	// Closes the selected off-canvas.
	function closeOffCanvas() {
		var offCanvas = this.first();
		if (offCanvas.length === 0) return this; // Nothing to do
		if (!offCanvas.hasClass(offCanvasClass)) return this; // offCanvas is not open
		var opt = loadOptions("offCanvas", offCanvas);

		var html = $("html");
		var width = offCanvas.outerWidth();

		// Start the transition back to the closed state
		offCanvas.css(opt.edge, -width);
		html.css("margin-" + opt.edge, 0);
		html.css("margin-" + opt._opposite, 0);

		preventScrolling(false);
		$(document).off("focusin" + offCanvasEventNamespace);
		$(document).off("keydown" + offCanvasEventNamespace);
		$(document).off("click" + offCanvasEventNamespace);
		$(window).off("resize" + offCanvasEventNamespace);
		offCanvas.off("click" + offCanvasEventNamespace);
		undimBackground();
		offCanvas.one("transitionend", function () {
			offCanvas.removeClass(offCanvasClass);
			html.css(opt._htmlStyle);
		});
		offCanvas.trigger("offcanvasclose");
		return this;
	}

	registerPlugin("offCanvas", offCanvas, {
		close: closeOffCanvas
	});
	$.fn.offCanvas.defaults = offCanvasDefaults;

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
			if ($elem.hasClass(resizableClass)) return; // Already done
			$elem.addClass(resizableClass);
			var htmlCursor;
			var handleElements = $();
			var opt = initOptions("resizable", resizableDefaults, $elem, {}, options);

			var aspectRatio = opt.aspectRatio;
			if (aspectRatio === true || aspectRatio === "true") aspectRatio = $elem.outerWidth() / $elem.outerHeight();
			if ($.isNumeric(aspectRatio)) aspectRatio = parseFloat(aspectRatio);
			if (aspectRatio === 0 || !isFinite(aspectRatio) || !$.isNumber(aspectRatio)) aspectRatio = undefined;

			if ($elem.css("position") === "static") $elem.css("position", "relative");

			var optHandles = opt.handles;
			if (optHandles === undefined) optHandles = "all";
			if (optHandles === "all") optHandles = "n,ne,e,se,s,sw,w,nw";
			if ($.isString(optHandles)) optHandles = optHandles.replace(/\s/g, "").toLowerCase().split(",");
			opt.handles = optHandles;

			var vCursor = "ns-resize";
			var hCursor = "ew-resize";
			var nwCursor = "nwse-resize";
			var neCursor = "nesw-resize";

			if (opt.handleAddClass === "box") {
				if (optHandles.indexOf("n") !== -1) addHandle({ left: "calc(50% - 4px)", top: -9 }, vCursor, true, true); // Top edge
				if (optHandles.indexOf("e") !== -1) addHandle({ right: -9, top: "calc(50% - 4px)" }, hCursor, false, false); // Right edge
				if (optHandles.indexOf("s") !== -1) addHandle({ left: "calc(50% - 4px)", bottom: -9 }, vCursor, true, false); // Bottom edge
				if (optHandles.indexOf("w") !== -1) addHandle({ left: -9, top: "calc(50% - 4px)" }, hCursor, false, true); // Left edge

				if (optHandles.indexOf("ne") !== -1) addHandle({ top: -9, right: -9 }, neCursor, false, false, true, true); // Top right corner
				if (optHandles.indexOf("se") !== -1) addHandle({ bottom: -9, right: -9 }, nwCursor, false, false, true, false); // Bottom right corner
				if (optHandles.indexOf("sw") !== -1) addHandle({ bottom: -9, left: -9 }, neCursor, false, true, true, false); // Bottom left corner
				if (optHandles.indexOf("nw") !== -1) addHandle({ top: -9, left: -9 }, nwCursor, false, true, true, true); // Top left corner
			} else {
				if (optHandles.indexOf("n") !== -1) addHandle({ left: 5, right: 5, top: -5, height: 10 }, vCursor, true, true); // Top edge
				if (optHandles.indexOf("e") !== -1) addHandle({ top: 5, bottom: 5, right: -5, width: 10 }, hCursor, false, false); // Right edge
				if (optHandles.indexOf("s") !== -1) addHandle({ left: 5, right: 5, bottom: -5, height: 10 }, vCursor, true, false); // Bottom edge
				if (optHandles.indexOf("w") !== -1) addHandle({ top: 5, bottom: 5, left: -5, width: 10 }, hCursor, false, true); // Left edge

				if (optHandles.indexOf("ne") !== -1) addHandle({ right: -5, top: -5, width: 10, height: 10 }, neCursor, false, false, true, true); // Top right corner
				if (optHandles.indexOf("se") !== -1) addHandle({ right: -5, bottom: -5, width: 10, height: 10 }, nwCursor, false, false, true, false); // Bottom right corner
				if (optHandles.indexOf("sw") !== -1) addHandle({ left: -5, bottom: -5, width: 10, height: 10 }, neCursor, false, true, true, false); // Bottom left corner
				if (optHandles.indexOf("nw") !== -1) addHandle({ left: -5, top: -5, width: 10, height: 10 }, nwCursor, false, true, true, true); // Top left corner
			}

			installDisabledchangeHook();
			$elem.on("disabledchange", function () {
				handleElements.visible(!$elem.disabled());
			});

			function addHandle(style, cursor, vertical, negative, vertical2, negative2) {
				var handle = $("<div/>").addClass("ff-resizable-handle " + opt.handleAddClass).css(style).css("position", "absolute").css("cursor", cursor);
				$elem.append(handle);
				handleElements = handleElements.add(handle);
				handle.draggable();
				handle.on("draggablestart", function (event) {
					htmlCursor = document.documentElement.style.getPropertyValue("cursor");
					document.documentElement.style.setProperty("cursor", cursor, "important");
				});
				handle.on("draggablemove", function (event) {
					event.preventDefault(); // The handles already move with the element, don't touch their position
					resize(handle, event.newPoint, vertical, negative);
					if (vertical2 !== undefined) resize(handle, event.newPoint, vertical2, negative2);
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
					var gridBase = $elem.parent().offset();
					if (negative) {
						delta = newElemOffset[side] - (Math.round((newElemOffset[side] - delta - gridBase[side]) / step) * step + gridBase[side]);
					} else {
						var length = $elem["outer" + extent]();
						delta = Math.round((newElemOffset[side] + length + delta - gridBase[side]) / step) * step + gridBase[side] - (newElemOffset[side] + length);
					}
				}

				var newLength = $elem["outer" + extent]() + delta;

				var minLength = Math.max($elem["outer" + extent]() - $elem[extentLower](), opt["min" + extent] || 0);
				while (newLength < minLength) {
					delta += step;
					newLength += step;
				}
				var maxLength = opt["max" + extent];
				while (maxLength && newLength > maxLength) {
					delta -= step;
					newLength -= step;
				}

				if (negative) newElemOffset[side] -= delta;

				if (opt.containment) {
					var cont = void 0;
					if (opt.containment === "parent") cont = $elem.parent();else cont = $(opt.containment);
					if (cont.length !== 0) {
						var contRect = cont.rect();
						if (negative) {
							while (newElemOffset[side] < contRect[side]) {
								newElemOffset[side] += step;
								delta -= step;
								newLength -= step;
							}
						} else {
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

	var rangeClass = "ff-range";
	var ticksClass = "ff-ticks";
	var handleClass = "ff-handle";
	var resetAllCursorsClass$1 = "reset-all-cursors";

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
		logarithmic: false, // TODO

		// The mouse cursor to show during dragging the slider. Default: None.
		dragCursor: undefined
	};

	// Creates a slider widget.
	function slider(options) {
		return this.each(function () {
			var slider = $(this);
			if (slider.children("div." + handleClass).length !== 0) return; // Already done
			var opt = initOptions("slider", sliderDefaults, slider, {}, options);
			var htmlCursor, draggedHandleCursor;
			var dragHandleOffset = [],
			    dragHandlePointerId = [];
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
			for (var index = 0; index < Math.max(1, opt.ranges && opt.ranges.length); index++) {
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
			var handles = [],
			    $handles = $();
			for (var _index = 0; _index < opt.handleCount; _index++) {
				handles[_index] = $("<div/>").addClass(handleClass).appendTo(slider);
				$handles = $handles.add(handles[_index]);
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
			var handleLength; // Length of the handle in drag direction

			if (isVertical) {
				startAttr = "bottom";
				endAttr = "top";
				slider.addClass("vertical");
				sliderBorder = (slider.outerHeight() - slider.innerHeight()) / 2;
				handleLength = handles[0].outerHeight();
			} else {
				startAttr = "left";
				endAttr = "right";
				slider.removeClass("vertical");
				sliderBorder = (slider.outerWidth() - slider.innerWidth()) / 2;
				handleLength = handles[0].outerWidth();
			}
			for (var _index2 = 0; _index2 < opt.handleCount; _index2++) {
				resetDragHandleOffset(_index2);
				setValue(_index2, opt.values[_index2]);
			}

			// Draw ticks
			if (opt.smallTicks || opt.largeTicks) {
				var minTick = Math.ceil(opt.min / opt.smallStep) * opt.smallStep;
				for (var value = minTick; value <= opt.max; value += opt.smallStep) {
					value = round(value, decimals);
					var large = value / opt.largeStep === Math.trunc(value / opt.largeStep);
					if (!large && !opt.smallTicks) continue;

					var pos = Math.round((value - opt.min) / (opt.max - opt.min) * 10000) / 100;
					var tickArr = $();
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
					return; // Should not happen: handle not found
				}

				// Remember where the handle was dragged (probably not exactly the center)
				if (isVertical) dragHandleOffset[index] = handles[index].offset().top + handles[index].outerHeight() - event.pageY;else dragHandleOffset[index] = event.pageX - handles[index].offset().left;

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
					if (isFirstDrag) slider.trigger("firstdragstart");

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
							if (valueDistance < minValueDistance || pointerValue > value && valueDistance <= minValueDistance) {
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
						slider.setCapture && slider.setCapture(); // Firefox only (set cursor over entire desktop)
						$("html").addClass(resetAllCursorsClass$1); // All browsers (set cursor at least within page)
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
				} else {
					slider.attr("tabindex", initialTabindex);
				}
			});

			slider.keydown(onKeydown);

			// TODO: Trigger "remove" event for DOM elements being removed, like jQuery UI overrides $.cleanData (once!)
			// TODO: slider.on("remove", /* cancel current drag operation and remove all events */) - also in other widgets!

			function onMove(event) {
				// Select dragged handle from pointerId
				var index = dragHandlePointerId.indexOf(event.pointerId);
				if (index === -1) return; // Not my pointer

				var value = getValueFromEvent(event);

				if (opt.handleCount > 1) {
					switch (opt.handleInteractionMode) {
						case "locked":
							if (index > 0 && value < opt.values[index - 1]) value = opt.values[index - 1];
							if (index < opt.handleCount - 1 && value > opt.values[index + 1]) value = opt.values[index + 1];
							break;

						case "push":
							for (var otherIndex = index - 1; otherIndex >= 0; otherIndex--) {
								if (value < opt.values[otherIndex]) setValue(otherIndex, value);
							}
							for (var _otherIndex = index + 1; _otherIndex < opt.handleCount; _otherIndex++) {
								if (value > opt.values[_otherIndex]) setValue(_otherIndex, value);
							}
							break;
					}
				}

				setValue(index, value);
			}

			function onEnd(event) {
				// Select dragged handle from pointerId
				var index = dragHandlePointerId.indexOf(event.pointerId);
				if (index === -1) return; // Not my pointer

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
						$("html").removeClass(resetAllCursorsClass$1);
						document.documentElement.style.setProperty("cursor", htmlCursor);

						eventRemovers.forEach(function (eventRemover) {
							eventRemover();
						});
						eventRemovers = [];

						slider.trigger("lastdragend");
					}
				}
			}

			function onKeydown(event) {
				if (slider.disabled()) return;
				if (event.keyCode === 40 || event.keyCode === 37) {
					// Down, Left
					event.preventDefault();
					setValue(lastTouchedHandleIndex, opt.values[lastTouchedHandleIndex] - (event.shiftKey ? opt.largeStep : opt.smallStep));
				}
				if (event.keyCode === 38 || event.keyCode === 39) {
					// Up, Right
					event.preventDefault();
					setValue(lastTouchedHandleIndex, opt.values[lastTouchedHandleIndex] + (event.shiftKey ? opt.largeStep : opt.smallStep));
				}
				if (event.keyCode === 36) {
					// Home
					event.preventDefault();
					setValue(lastTouchedHandleIndex, opt.min);
				}
				if (event.keyCode === 35) {
					// End
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
				var pointerPosIntoSlider; // Distance from min end of the slider to the pointer
				var sliderLength; // Length of the slider in drag direction
				if (isVertical) {
					pointerPosIntoSlider = sliderRect.bottom - sliderBorder - event.pageY;
					sliderLength = slider.innerHeight();
				} else {
					pointerPosIntoSlider = event.pageX - sliderRect.left - sliderBorder;
					sliderLength = slider.innerWidth();
				}

				var handleCenterPos = pointerPosIntoSlider - myDragHandleOffset + handleLength / 2; // Position of the handle's center
				var value = handleCenterPos / sliderLength * (opt.max - opt.min) + opt.min; // Selected value
				return value;
			}

			// Sets a slider value and triggers the change event. Also moves the handle.
			function setValue(index, value) {
				value = minmax(value, opt.min, opt.max);
				value = Math.round(value / opt.smallStep) * opt.smallStep; // Snap to steps
				value = round(value, decimals);
				moveHandle(index, value);
				if (value !== opt.values[index]) {
					opt.values[index] = value;
					slider.trigger("valuechange"); // TODO: Indicate the changed value index
				}
			}

			// Moves a handle to the specified slider value and updates the ranges.
			function moveHandle(index, value) {
				var pos = getPosFromValue(value);
				handles[index].css(startAttr, "calc(" + pos + "% - " + handleLength / 2 + "px)");

				// Also update ranges
				if (opt.ranges) {
					opt.ranges.forEach(function (rangeItem, rangeIndex) {
						var start = rangeItem.start,
						    startHandleIndex;
						if (start === "min") {
							start = opt.min;
						} else if (start === "max") {
							start = opt.max;
						} else if (start[0] === "#") {
							startHandleIndex = Number(start.substr(1));
							start = startHandleIndex === index ? value : opt.values[startHandleIndex];
						}
						var end = rangeItem.end,
						    endHandleIndex;
						if (end === "min") {
							end = opt.min;
						} else if (end === "max") {
							end = opt.max;
						} else if (end[0] === "#") {
							endHandleIndex = Number(end.substr(1));
							end = endHandleIndex === index ? value : opt.values[endHandleIndex];
						}
						var startPos = getPosFromValue(start);
						var endPos = getPosFromValue(end);
						var overflowEqual = rangeItem.overflowEqual || startHandleIndex !== undefined && endHandleIndex !== undefined && endHandleIndex < startHandleIndex;
						setRange(rangeIndex, startPos, endPos, overflowEqual);
					});
				} else if (opt.handleCount === 1) {
					if (pos < rangeBasePos) setRange(0, pos, rangeBasePos);else setRange(0, rangeBasePos, pos);
				} else if (opt.handleCount === 2) {
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
					ranges[index * 2].css(endAttr, 100 - end + "%");
					ranges[index * 2 + 1].css(startAttr, "0%");
					ranges[index * 2 + 1].css(endAttr, "100%");
				} else {
					// Overflow range, split in two elements from either end of the slider
					ranges[index * 2].css(startAttr, "0%");
					ranges[index * 2].css(endAttr, 100 - end + "%");
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
	// value: Sets the slider value.
	function sliderValue(value) {
		return this.slider.multivalue(0, value);
	}

	// Gets the current value of the specified slider handle.
	// value: Sets the value of the specified slider handle.
	function sliderMultiValue(index, value) {
		// Getter
		if (value === undefined) {
			var slider = this.first();
			if (slider.length === 0) return; // Nothing to do
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

	var sortableClass = "ff-sortable";
	var sortablePlaceholderClass = "ff-sortable-placeholder";

	// Defines default options for the draggable plugin.
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
			if ($elem.hasClass(sortableClass)) return; // Already done
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
				var placeholder, initialChildAfterElement, placeholderAfterElement, betweenChildren;
				var stack = opt.stack;
				if (stack === true) stack = $elem.children();

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
					var event2 = $.Event("sortablestart");
					child.trigger(event2);
					if (event2.isDefaultPrevented()) {
						event.preventDefault();
						return;
					}

					// Remember where the element was before it was dragged, so it can be moved back there
					initialChildAfterElement = child.prev();
					if (initialChildAfterElement.length === 0) initialChildAfterElement = null;

					var rect = child.rect();

					// Create the placeholder element that will take the place of the dragged element
					placeholder = $("<" + this.nodeName + "/>").addClass(sortablePlaceholderClass) // TODO: Also add all classes of child
					.text("\xa0").css({ width: rect.width, height: rect.height });

					// Insert the placeholder where the dragged element is, and take that out of the layout flow
					child.after(placeholder);
					child.css({ position: "absolute", width: rect.width, height: rect.height });
					updateChildren();
				});
				child.on("draggablemove", function (event) {
					event.stopImmediatePropagation();
					var event2 = $.Event("sortablemove");
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
					if (newPlaceholderAfterElementStart !== placeholderAfterElement) newPlaceholderAfterElement = newPlaceholderAfterElementStart;
					if (newPlaceholderAfterElementEnd !== placeholderAfterElement) newPlaceholderAfterElement = newPlaceholderAfterElementEnd;

					// ...and move it there
					if (newPlaceholderAfterElement !== undefined) {
						var eventCancelled = false;
						if (placeholderAfterElement !== undefined) {
							var _event2 = $.Event("sortablechange");
							_event2.after = newPlaceholderAfterElement;
							child.trigger(_event2);
							eventCancelled = _event2.isDefaultPrevented();
						}
						if (!eventCancelled) {
							if (!newPlaceholderAfterElement) placeholder.detach().insertBefore($elem.firstChild());else placeholder.detach().insertAfter(newPlaceholderAfterElement);
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

					var event2 = $.Event("sortableend");
					event2.after = placeholderAfterElement;
					child.trigger(event2);
					if (event2.isDefaultPrevented()) {
						if (!initialChildAfterElement) child.detach().insertBefore($elem.firstChild());else child.detach().insertAfter(initialChildAfterElement);
					}
					initialChildAfterElement = undefined;
				});

				function updateChildren() {
					betweenChildren = [];
					var rowElements = [];
					var rowMin,
					    rowMax,
					    currentPos,
					    elem = null;
					$elem.children().each(function () {
						if (this !== child[0]) {
							var rect = $(this).rect();
							if (rect[flowStart] + 0.1 < currentPos) {
								// Need to compensate for rounding issues from the 4th decimal in Chrome/Edge/IE
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
			return Math.pow(v.left - w.left, 2) + Math.pow(v.top - w.top, 2);
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

	function addChild(child) {
		var sortable = $(this);
		var opt = loadOptions("sortable", sortable);
		opt._prepareChild.call(child);
	}

	registerPlugin("sortable", sortable, {
		addChild: addChild
	});
	$.fn.sortable.defaults = sortableDefaults;

	var tabHeadersClass = "ff-tab-headers";
	var tabPagesClass = "ff-tab-pages";

	// Converts all div elements in each selected element into tab pages.
	// The tab page headers are read from the div elements' title attribute.
	function tabs() {
		return this.each(function () {
			var container = $(this);
			if (container.children("div." + tabHeadersClass).length !== 0) return; // Already done

			var pageDivs = $(this).children("div");
			var activePage = pageDivs.filter(".active").first();
			var headers = $("<div/>").addClass(tabHeadersClass).appendTo(container);
			var pages = $("<div/>").addClass(tabPagesClass).appendTo(container);
			pageDivs.each(function () {
				var header = $("<a/>").attr("href", "#").attr("tabindex", "-1").text($(this).attr("title")).appendTo(headers);
				var page = $(this).removeAttr("title").detach().appendTo(pages);
				if (activePage.length === 0 || activePage[0] === page[0]) {
					header.addClass("active").removeAttr("tabindex");
					page.addClass("active");
					activePage = page;
				}
				header.click(function (event) {
					event.preventDefault();
					container.tabs.activeTab(page);
				});
				header.keydown(function (event) {
					if (event.which === 37) {
						// Left
						event.preventDefault();
						header.prev().focus().click();
					}
					if (event.which === 39) {
						// Right
						event.preventDefault();
						header.next().focus().click();
					}
					if (event.which === 36) {
						// Home
						event.preventDefault();
						header.parent().children().first().focus().click();
					}
					if (event.which === 35) {
						// End
						event.preventDefault();
						header.parent().children().last().focus().click();
					}
				});
			});
		});
	}

	// Gets the active page in a tab container.
	// indexOrPage: Sets the active page in each selected tab container, either by index or the page.
	function activeTab(indexOrPage) {
		// Getter
		if (indexOrPage === undefined) {
			return this.find("div." + tabPagesClass + " > .active").first();
		}

		// Setter
		return this.each(function () {
			var container = $(this);
			var headers = container.children("div." + tabHeadersClass).first();
			var pages = container.find("div." + tabPagesClass).first();
			var index, page;
			if ($.isNumeric(indexOrPage)) {
				index = +indexOrPage;
				page = pages.children().eq(index);
			} else {
				index = indexOrPage.index();
				page = indexOrPage;
			}

			if (page && !page.hasClass("active")) {
				headers.children().attr("tabindex", "-1");
				headers.children(".active").removeClass("active");
				headers.children().eq(index).addClass("active").removeAttr("tabindex");
				pages.children(".active").removeClass("active");
				page.addClass("active");
				container.trigger("activeTabChange");
			}
		});
	}

	registerPlugin("tabs", tabs, {
		activeTab: activeTab
	});

	// Automatically apply all controls now. Must be loaded at the end of the document.
	// Doing it now is faster than waiting for the DOM ready event, and when loaded at the end of the
	// document, all relevant DOM parts are already there.

	$.fn.frontfire = function (prefix) {
		if (prefix === undefined) prefix = "";

		this.find(prefix + ".accordion").accordion();
		this.find(prefix + ".carousel").carousel();
		// TODO: dropdown
		this.find(prefix + "input[type=number]").spinner();
		this.find(prefix + "input[type=color]").colorPicker();
		this.find(prefix + "input[type=checkbox], input[type=radio]").styleCheckbox();
		this.find(prefix + "input[type=checkbox].three-state").threeState();
		this.find(prefix + "textarea.auto-height").autoHeight();
		this.find(prefix + ".menu").menu();
		this.find(prefix + ".critical.closable, .error.closable, .warning.closable, .information.closable, .success.closable").closableMessage();
		// TODO: modal
		this.find(prefix + ".slider").slider();
		this.find(prefix + ".sortable").sortable();
		this.find(prefix + ".tabs").tabs();
		return this;
	};

	$(document).frontfire(":not(.no-autostart)");

	/*! frontfire.js v0.1 | @license MIT | unclassified.software/source/frontfire */
})(jQuery, window, document);
//# sourceMappingURL=frontfire.bundle.js.map

//# sourceMappingURL=frontfire.es5.js.map