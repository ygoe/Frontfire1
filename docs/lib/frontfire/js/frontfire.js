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

	// Escapes a string for use in a regular expression.
	function regExpEscape(text) {
		return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
	}

	// Forces a browser layout reflow. This can be used to start CSS transitions on new elements.
	function forceReflow() {
		// Try two different methods
		var body = $("body");
		body.css("display");
		body.offset();
	}

	// Installs a jQuery hook if it isn't installed yet. Existing hooks are chained to the new hook.
	//
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

	function installReadonlychangeHook() {
		installHook($.propHooks, "readonly", "readonlychange", undefined, function (elem, value, name) {
			if (elem.readonly !== value) {
				elem.readonly = value; // Set before triggering change event
				$(elem).trigger("readonlychange");
			}
		});
	}

	// Binds the disabled state of the input element to the associated buttons.
	function bindInputButtonsDisabled(input, buttons) {
		// When the input element was disabled or enabled, also update other elements
		installDisabledchangeHook();
		installReadonlychangeHook();
		var disabledHandler = function disabledHandler() {
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
		input.on("disabledchange", disabledHandler);

		var readonlyHandler = function readonlyHandler() {
			if (input.readonly()) {
				input.readonly(true);
				buttons.forEach(function (button) {
					if (button[0].localName === "button" || button[0].localName === "select" || !("readonly" in button)) {
						button.disable(false); // Don't touch the label
					} else {
						button.readonly(true);
					}
				});
			} else {
				input.readonly(false);
				buttons.forEach(function (button) {
					if (button[0].localName === "button" || button[0].localName === "select" || !("readonly" in button)) {
						button.enable(false); // Don't touch the label
					} else {
						button.readonly(false);
					}
				});
			}
		};
		input.on("readonlychange", readonlyHandler);

		// Setup disabled state initially.
		// Also enable elements. If they were disabled and the page is reloaded, their state
		// may be restored halfway. This setup brings everything in the same state.
		disabledHandler();
		readonlyHandler();
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
	//
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
			stackedElems.each(function (index, item) {
				$(item.elem).css("z-index", maxZIndex - (stackedElems.length - 1) + index);
			});
		}
	}

	$.bindInputButtonsDisabled = bindInputButtonsDisabled;
	$.forceReflow = forceReflow;

	// Define some more helper functions as jQuery plugins. Similar functions already exist in
	// jQuery and these complement the set.

	// A variant of $.each that uses $(this) as the called function's context instead of this and also
	// the second parameter.
	$.fn.each$ = function (fn) {
		return this.each(function (index, element) {
			element = $(element);
			return fn.call(element, index, element);
		});
	};

	// A variant of $.val that also triggers the change event if the value has actually changed.
	$.fn.valChange = function (value) {
		var oldValue = this.val();
		var isEqual = oldValue === value;
		if (!isEqual && Array.isArray(oldValue) && Array.isArray(value)) {
			isEqual = oldValue.length === value.length && oldValue.every(function (v, index) {
				return v === value[index];
			});
		}
		if (!isEqual) {
			this.val(value).change();
		}
	};

	// Variable tests

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

	// Operating system tests

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

	// Browser tests
	// Source (sometimes updated): https://stackoverflow.com/a/9851769

	// Determines whether the browser has a Blink engine.
	$.isBlink = function () {
		return ($.isChrome() || $.isOpera()) && !!window.CSS;
	};

	// Determines whether the browser is Chrome. (Not functional for v80/81)
	$.isChrome = function () {
		return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
	};

	// Determines whether the browser is original Edge.
	$.isEdge = function () {
		return !$.isInternetExplorer() && !!window.StyleMedia;
	};

	// Determines whether the browser is Chromium-based Edge.
	$.isEdgeChromium = function () {
		return $.isChrome() && navigator.userAgent.indexOf("Edg") != -1;
	};

	// Determines whether the browser is Firefox.
	$.isFirefox = function () {
		return typeof InstallTrigger !== 'undefined';
	};

	// Determines whether the browser is Internet Explorer.
	$.isInternetExplorer = function () {
		return (/*@cc_on!@*/!!document.documentMode
		);
	};

	// Determines whether the browser is Opera.
	$.isOpera = function () {
		return !!window.opr && !!opr.addons || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	};

	// Determines whether the browser is Brave.
	$.isBrave = function () {
		return navigator.brave && !!navigator.brave.isBrave;
	};

	// Determines whether the browser is Safari. (Not functional for iOS/iPadOS 13)
	$.isSafari = function () {
		return (/constructor/i.test(window.HTMLElement) || function (p) {
				return p.toString() === "[object SafariRemoteNotification]";
			}(!window['safari'] || typeof safari !== 'undefined' && safari.pushNotification)
		);
	};

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
	//
	// name: The name of the plugin.
	// create: The plugin create function.
	// obj: An object containing additional operation functions.
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

	// Determines the options to use for a plugin.
	//
	// name: The plugin name.
	// defaults: The plugin's default options. Only properties defined in here are considered for data attributes.
	// elem: The element to find data attributes in. Options are stored here, too.
	// converters: An object that specifies a conversion function for each special data attribute.
	// params: The options specified to the plugin function.
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

	// Loads plugin options for additional plugin functions.
	//
	// name: The plugin name.
	// elem: The element to find data attributes in. Options are stored here, too.
	function loadOptions(name, elem) {
		return $(elem).data("ff-" + name + "-options") || {};
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
		return this.each(function (_, obj) {
			var accordion = $(obj);
			if (accordion.hasClass(accordionClass)) return; // Already done
			var opt = initOptions("accordion", accordionDefaults, accordion, {}, options);

			accordion.addClass(accordionClass);
			var items = accordion.children("div");
			items.each$(function (_, item) {
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
		return this.each(function (_, obj) {
			var accordion = $(obj);
			loadOptions("accordion", accordion);

			var items = accordion.children("div");
			if (indexOrItem === undefined) {
				// Collapse all items
				items.each(function (_, obj) {
					accordion.accordion.collapse(obj);
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

				var _event = $.Event("itemCollapse");
				_event.item = item;
				accordion.trigger(_event);
			}

			var id = item.attr("id");
			if (id !== undefined && location.hash === "#" + id) {
				history.replaceState(null, document.title, location.pathname + location.search);
			}
		});
	}

	function expand(indexOrItem) {
		return this.each(function (_, obj) {
			var accordion = $(obj);
			var opt = loadOptions("accordion", accordion);

			var items = accordion.children("div");
			if (indexOrItem === undefined && !opt.exclusive) {
				// Expand all items
				items.each(function (_, obj) {
					accordion.accordion.expand(obj);
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
				items.each(function (_, obj) {
					if (obj !== item[0]) {
						if (!passedExpandedItem) previousItemCollapsedHeight += $(obj).children("div.ff-accordion-content").height();
						accordion.accordion.collapse(obj);
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
		return this.each(function (_, obj) {
			var carousel = $(obj);
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
			var clickLock = false;
			var clickUnlockTimeout;

			if (opt.dotsEach === -1) opt.dotsEach = opt.items;
			opt.dotsEach = minmax(opt.dotsEach, 0, opt.items);

			// Set up items positioning
			items.each$(function (_, obj) {
				obj.css("width", "calc(" + opt._itemWidthPercent + "% - " + opt._gutterWidth + "px)");
				maxItemHeight = Math.max(maxItemHeight, obj.outerHeight());
				obj.detach().appendTo(stage);

				if (obj.attr("href")) {
					obj.css("cursor", "pointer");
					obj.attr("tabindex", "-1");
					obj.click(function (event) {
						if (!clickLock) {
							location.href = obj.attr("href");
						}
					});
				}
			});
			stage.appendTo(carousel);
			stage.css("height", maxItemHeight);
			stage.attr("tabindex", "-1"); // Would be tab-focusable otherwise (not sure why)

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
				dragCursor: opt.dragCursor,
				cancel: stage.find("input, button, textarea, label")
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
				if (clickUnlockTimeout) clearTimeout(clickUnlockTimeout);
				clickLock = true;

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
				clickUnlockTimeout = setTimeout(function () {
					return clickLock = false;
				}, 100);

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
							items.each$(function (index, obj) {
								if (obj.css("z-index") == 1) z1 = index;
								if (obj.css("z-index") == 2) {
									z2 = index;
									z2Opacity = parseFloat(obj.css("opacity"));
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
							items.each$(function (index, obj) {
								var left = parseFloat(obj.css("left"));
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
							items.each$(function (index, obj) {
								var left = parseFloat(obj.css("left"));
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
							items.each$(function (index, obj) {
								if (index === fullyVisible) {
									obj.css("z-index", 1).css("opacity", 1);
								} else if (index === partiallyVisible) {
									obj.css("z-index", 2).css("opacity", Math.abs(itemOffset) - Math.trunc(Math.abs(itemOffset)));
								} else {
									obj.css("z-index", 0).css("opacity", 0);
								}
							});
						} else {
							var _z = void 0,
							    _z2 = void 0,
							    _z2Opacity = void 0;
							items.each$(function (index, obj) {
								if (obj.css("z-index") == 1) _z = index;
								if (obj.css("z-index") == 2) {
									_z2 = index;
									_z2Opacity = parseFloat(obj.css("opacity"));
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
								items.each$(function (index, obj) {
									if (obj.css("z-index") == 1) currentVisible = index;
								});
								removeTransition();
								items.eq(opt.active).css("z-index", 1).css("opacity", 1).css("pointer-events", "");
								forceReflow();
								if (!opt._isDragging) addTransition();
								items.each$(function (index, obj) {
									if (index === opt.active) ;else if (index === currentVisible) {
										obj.css("z-index", 2).css("opacity", 0).css("pointer-events", "none");
									} else {
										obj.css("z-index", 0).css("opacity", 0).css("pointer-events", "");
									}
								});
							}
						}

						var status = "";
						items.each$(function (index, obj) {
							status += index + ": z=" + obj.css("z-index") + " op=" + obj.css("opacity") + (index === opt.active ? " active" : "") + "\n";
						});
						//console.log(status);
						break;
					case "slide-in":
						items.each$(function (index, obj) {
							var left = opt.active + itemOffset <= items.length - 1 ? minmax((index - opt.active - itemOffset) * 100, 0, 100) : (items.length - 1 - opt.active - itemOffset) * 100;
							obj.css("left", left + "%");
							obj.css("z-index", index);
						});
						break;
					case "slide-out":
						items.each$(function (index, obj) {
							var left = opt.active + itemOffset >= 0 ? minmax((index - opt.active - itemOffset) * 100, -100, 0) : (-opt.active - itemOffset) * 100;
							obj.css("left", left + "%");
							obj.css("z-index", items.length - 1 - index);
						});
						break;
					case "slide-fade":
						items.each$(function (index, obj) {
							var percent = (index - opt.active) * 100 / 10;
							var left = (index - opt.active) * opt._gutterOffset - itemOffset * stage.width() / 10;
							obj.css("left", "calc(" + percent + "% + " + left + "px)");
							var opacity = 1 - minmax(Math.abs(index - (opt.active + itemOffset)), 0, 1);
							obj.css("opacity", opacity);
						});
						break;
					case "slide-all":
					default:
						items.each$(function (index, obj) {
							var percent = (index - opt.active) * opt._itemWidthPercent;
							var left = (index - opt.active) * opt._gutterOffset - itemOffset * stage.width() / opt.items;
							obj.css("left", "calc(" + percent + "% + " + left + "px)");
						});
						break;
				}
			}
		});
	}

	// Gets the active item in a carousel.
	//
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
		return this.each(function (_, obj) {
			var carousel = $(obj);
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

	var galleryClass = "ff-gallery";
	var galleryRowClass = "gallery-row";

	// Defines default options for the gallery plugin.
	var galleryDefaults = {
		// The desired image size (depending on sizeMode), in pixels. Default: 150.
		desiredSize: 150,

		// The allowed factor of exceeding the desired size in the last row before the row is left-aligned. Default: 1.2.
		allowedOversize: 1.2,

		// The layout size mode. Default: height.
		// Possible values: height, area
		// height: The desiredSize is the preferred row height.
		// area: The square value of desiredSize is the preferred image area.
		sizeMode: "height",

		// The spacing between the images, in pixels. Default: 10.
		gap: 10
	};

	// Shows a gallery layout for the element.
	function gallery(options) {
		return this.each$(function (_, gallery) {
			if (gallery.hasClass(galleryClass)) return; // Already done
			gallery.addClass(galleryClass);
			var opt = initOptions("gallery", galleryDefaults, gallery, {}, options);
			opt._relayout = relayout;

			// Validate options
			if (opt.desiredSize <= 0) opt.desiredSize = 150;
			if (["height", "area"].indexOf(opt.sizeMode) === -1) opt.sizeMode = "height";
			if (opt.gap < 0) opt.gap = 0;

			var images = [];
			var appendCount = 0;
			var rowImages = [];
			var rowWidthSum = 0;
			var currentGalleryWidth = gallery.width();
			var largeImages = [];

			// Create loading indicator
			var loadingRow = $("<div/>").addClass("loading-row").appendTo(gallery);
			$("<i/>").addClass("loading small").appendTo(loadingRow);

			// Finishes the layout of images in the current row. Scales images of a row exactly.
			var createRow = function createRow(isLast) {
				// Find the correct row height for the images in the row (and the gaps in between)
				var normalisedWidthSum = 0;
				for (var i = 0; i < rowImages.length; i++) {
					var img = rowImages[i];
					if (img.tagName.toLowerCase() !== "img") img = img.querySelector("img");
					normalisedWidthSum += img.naturalWidth / img.naturalHeight;
				}
				var galleryWidth = gallery.width();
				var galleryWidthWithoutGaps = galleryWidth - opt.gap * (rowImages.length - 1);
				var rowHeight = galleryWidthWithoutGaps / normalisedWidthSum;

				// Don't force-fill the row if the height would be too tall and it's the last row
				var fullWidth = true;
				if (isLast && opt.sizeMode === "height" && rowHeight > opt.desiredSize * opt.allowedOversize) {
					rowHeight = opt.desiredSize;
					fullWidth = false;
				} else if (isLast && opt.sizeMode === "area" && rowHeight * galleryWidthWithoutGaps / rowImages.length > opt.desiredSize * opt.desiredSize * opt.allowedOversize * opt.allowedOversize) {
					var avgAspectRatio = normalisedWidthSum / rowImages.length;
					rowHeight = Math.sqrt(opt.desiredSize * opt.desiredSize / avgAspectRatio);
					fullWidth = false;
				}

				// Create row
				var rows = gallery.children("." + galleryRowClass);
				var isFirstRow = rows.length === 0;
				var row = $("<div/>").addClass(galleryRowClass);
				if (!fullWidth) {
					row.addClass("incomplete");
				}

				// Insert new rows at the beginning of the gallery, in order.
				// This keeps new rows before all remaining images and thus all images of the gallery
				// keep their order at all times (except for separated larger images).
				if (isFirstRow) {
					row.prependTo(gallery);
				} else {
					row.css("margin-top", opt.gap);
					var lastRow = rows[rows.length - 1];
					row.insertAfter(lastRow);
				}

				// Update loading indicator at the end of the gallery
				if (!isLast) loadingRow.appendTo(gallery);else loadingRow.remove();

				// Add all images with relative width (space is evenly distributed by flex layout, except in last row)
				for (var _i = 0; _i < rowImages.length; _i++) {
					var elem = rowImages[_i];
					var _img = elem;
					if (_img.tagName.toLowerCase() !== "img") _img = _img.querySelector("img");
					// The scaled width of the image for the given row height
					var scaledWidth = _img.naturalWidth / _img.naturalHeight * rowHeight;
					// A single gap, corrected for one less = The average gap for each image in a row
					var gap2 = opt.gap / rowImages.length * (rowImages.length - 1);
					// The fractional width of the image including its average gap share
					var swPercent = (scaledWidth + gap2) / galleryWidth * 100;
					$(elem)
					// Let the browser calculate back to the width, but for the actual total width, minus the fixed average gap share
					.css("width", "calc(" + swPercent + "% - " + gap2 + "px)")
					// Only the last row (which is not filled) needs explicit gaps
					.css("margin-left", !fullWidth && _i > 0 ? opt.gap : 0).appendTo(row);
					if (_img !== elem) {
						$(_img).css("width", "100%");
					}
				}
			};

			// Appends an image to the layout. Assigns images to a row.
			// If the <img> element is a direct child of the gallery, elem and img are the same.
			// Otherwise, elem is the direct child and img is the <img> element therein.
			var appendImage = function appendImage(elem, img, isLast) {
				if (elem.dataset.gallerySize == "large") {
					if (isLast) {
						createRow(false);
						for (var i = 0; i < largeImages.length; i++) {
							rowImages = [largeImages[i]];
							createRow(false);
						}
						largeImages = [];
						rowImages = [elem];
						createRow(true);
						rowImages = [];
						rowWidthSum = 0;
					} else {
						largeImages.push(elem);
					}
					return;
				}

				var scaledWidth = void 0;
				if (opt.sizeMode === "height") {
					scaledWidth = img.naturalWidth / img.naturalHeight * opt.desiredSize;
				} else {
					scaledWidth = Math.sqrt(opt.desiredSize * opt.desiredSize * img.naturalWidth / img.naturalHeight);
				}

				var galleryWidth = gallery.width();
				var myGap = rowWidthSum > 0 ? opt.gap : 0;
				var oldDist = Math.abs(galleryWidth - rowWidthSum);
				var newDist = Math.abs(galleryWidth - (rowWidthSum + myGap + scaledWidth));
				if (newDist < oldDist) {
					// We're nearer to the total width with this image, so keep it in the row
					rowImages.push(elem);
					rowWidthSum += myGap + scaledWidth;
				} else {
					// We're futher away from the total width with this image, so put it on a new row
					createRow(false);
					// Insert rows of retained large images
					for (var _i2 = 0; _i2 < largeImages.length; _i2++) {
						rowImages = [largeImages[_i2]];
						createRow(false);
					}
					largeImages = [];
					// Continue next row with current image
					rowImages = [elem];
					rowWidthSum = scaledWidth;
				}

				if (isLast) {
					if (largeImages.length > 0) {
						createRow(false);
						for (var _i3 = 0; _i3 < largeImages.length; _i3++) {
							rowImages = [largeImages[_i3]];
							createRow(_i3 === largeImages.length - 1);
						}
						largeImages = [];
					} else {
						createRow(true);
					}
					rowImages = [];
					rowWidthSum = 0;
				}
			};

			// Appends the next image if it's loaded, repeats for all subsequent loaded images.
			var apendNextImages = function apendNextImages() {
				while (true) {
					if (appendCount >= images.length) {
						// All images appended
						return false;
					}
					var img = images[appendCount];
					if (img.tagName.toLowerCase() !== "img") img = img.querySelector("img");
					if (!img.complete || img.naturalWidth === 0) {
						// Image is not loaded
						return true;
					}
					var isLast = appendCount === images.length - 1;
					appendImage(images[appendCount], img, isLast);
					appendCount++;
				}
			};

			// Removes an image from the list that won't load.
			var removeImage = function removeImage(img) {
				// Should only affect images after appendCount, so that need not be corrected
				console.error("Removed image from gallery due to load error:", img.src);
				images = images.filter(function (i) {
					return i !== img;
				});
			};

			// Scan all child elements and collect images, set up load event handlers
			gallery.children("img, a").each$(function (_, child) {
				images.push(child[0]);
				var img = child;
				if (!img.is("img")) img = img.find("img");
				img.on("load", function () {
					return apendNextImages();
				});
				img.on("error", function () {
					removeImage(child[0]);apendNextImages();
				});
			});
			apendNextImages();

			// Relayout on window resize
			$(window).on("resize", function () {
				var newGalleryWidth = gallery.width();
				if (newGalleryWidth !== currentGalleryWidth) {
					currentGalleryWidth = newGalleryWidth;
					relayout();
				}
			});

			function relayout() {
				gallery.children("." + galleryRowClass).remove();
				appendCount = 0;
				rowImages = [];
				rowWidthSum = 0;
				apendNextImages();
			}
		});
	}

	// Updates the layout of the gallery after a size change.
	function relayout() {
		return this.each$(function (_, gallery) {
			var opt = loadOptions("gallery", gallery);
			opt._relayout();
		});
	}

	registerPlugin("gallery", gallery, {
		relayout: relayout
	});
	$.fn.gallery.defaults = galleryDefaults;

	// This file uses its own scope to keep its helper functions private and make it reusable independently.
	(function (undefined$1) {

		var canvasContext;

		// Parses any color value understood by a browser into an object with r, g, b, a properties.
		function Color(value) {
			// Allow calling without "new" keyword
			if (!(this instanceof Color)) return new Color(value);

			if (typeof value === "string") {
				if (value === "") {
					this.format = "CSS";
					this.r = this.g = this.b = this.a = 0;
					return;
				}

				this.format = value.match(/^rgba?\(/) ? "CSS" : "HTML";

				// Add "#" prefix if missing and the data is otherwise looking good (3/6/8 hex digits)
				if (value.match(/^\s*[0-9A-Fa-f]{3}([0-9A-Fa-f]{3}([0-9A-Fa-f]{2})?)?\s*$/)) value = "#" + value.trim();

				// Let the browser do the work
				var div = document.createElement("div");
				div.style.display = "none";
				document.body.appendChild(div); // required for getComputedStyle
				div.style.color = value;
				var color = getComputedStyle(div).color;
				var match = color.match(/rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*([0-9.]+)\s*)?\)/);
				if (match) {
					this.r = keep255(Number(match[1]));
					this.g = keep255(Number(match[2]));
					this.b = keep255(Number(match[3]));
					this.a = match[4] !== undefined$1 ? keep1(Number(match[4])) : 1;
					return;
				}

				// Browser wasn't in the mood (probably Chrome with a named color), try harder
				if (!canvasContext) {
					var canvas = document.createElement("canvas");
					canvas.setAttribute("width", "1");
					canvas.setAttribute("height", "1");
					canvasContext = canvas.getContext("2d");
					canvasContext.globalCompositeOperation = "copy"; // required for alpha channel
				}
				canvasContext.fillStyle = value;
				canvasContext.fillRect(0, 0, 1, 1);
				var data = canvasContext.getImageData(0, 0, 1, 1).data;
				this.r = data[0];
				this.g = data[1];
				this.b = data[2];
				this.a = data[3] / 255;
				// If this is wrong, the named color probably doesn't exist, but we can't detect it
				return;
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
				if (Array.isArray(value)) {
					this.format = "Array";
					this.r = keep255(value[0]);
					this.g = keep255(value[1]);
					this.b = keep255(value[2]);
					this.a = value.length > 3 ? keep1(value[3]) : 1;
				} else {
					this.format = value.format !== undefined$1 ? value.format : "Object";
					this.r = keep255(value.r);
					this.g = keep255(value.g);
					this.b = keep255(value.b);
					this.a = value.a !== undefined$1 ? keep1(value.a) : 1;
					if (value.h !== undefined$1 && value.s !== undefined$1 && value.l !== undefined$1) {
						this.h = keep360(value.h);
						this.s = keep1(value.s);
						this.l = keep1(value.l);
					}
				}
				return;
			}
			console.error("Invalid color:", value);
		}

		// Make it public
		window.Color = Color;

		// Now add object methods
		var Color_prototype = Color.prototype;

		// Formats the color in the format it was originally parsed from. If the format is HTML and a
		// non-opaque alpha value is set, the result is in CSS rgba() format instead.
		Color_prototype.toString = function () {
			switch (this.format) {
				case "IntARGB":
					return this.toIntARGB();
				case "HTML":
					if (this.a === undefined$1 || this.a === 1) return this.toHTML();
					return this.toCSS(); // Need CSS format for alpha value
				case "CSS":
				default:
					return this.toCSS();
			}
		};

		// Formats a color object into a CSS rgb() or rgba() string.
		Color_prototype.toCSS = function () {
			if (this.a === undefined$1 || this.a === 1) return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
			return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
		};

		// Formats a color object into an HTML hexadecimal string. If requested, a non-opaque alpha
		// value is printed as a fourth hex digit pair, which is not valid HTML.
		Color_prototype.toHTML = function (withAlpha) {
			function conv(number) {
				return (number < 16 ? "0" : "") + round(keep255(number)).toString(16).toLowerCase();
			}

			var str = "#" + conv(this.r) + conv(this.g) + conv(this.b);
			if (withAlpha && this.a !== undefined$1 && this.a !== 1) str += conv(this.a * 255);
			return str;
		};

		// Converts a color object into an integer number like 0xAARRGGBB.
		Color_prototype.toIntARGB = function () {
			return (this.a !== undefined$1 ? round(keep1(this.a) * 255) : 255) << 24 | round(keep255(this.r)) << 16 | round(keep255(this.g)) << 8 | round(keep255(this.b));
		};

		// Converts a color object into an array with [r, g, b, a].
		Color_prototype.toArray = function () {
			var arr = [this.r, this.g, this.b];
			if (this.a !== undefined$1 && this.a !== 1) arr.push[this.a * 255];
			return arr;
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
			this.h = keep360(this.h);
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
			if (this.a === undefined$1) this.a = 1;
			return this;
		};

		// Returns a blended color with the specified ratio from 0 (no change) to 1 (only other color).
		// All R/G/B/A channels are blended separately.
		Color_prototype.blendWith = function (other, ratio, includeAlpha) {
			var isHSL = this.h !== undefined$1 || other.h !== undefined$1;
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

		// Returns a blended color with the specified ratio from 0 (no change) to 1 (only other color).
		// The H channel is blended on the short path around the circle, S/L/A channels are blended normally.
		Color_prototype.blendByHueWith = function (other, ratio, includeAlpha, largeArc) {
			var color = Color(this);
			if (!(other instanceof Color)) other = Color(other);
			if (color.h === undefined$1) color.updateHSL();
			if (other.h === undefined$1) other.updateHSL();
			ratio = keep1(ratio);

			// If either color has no saturation, set its hue to the other's
			if (color.s === 0 && other.s !== 0) color.h = other.h;
			if (other.s === 0 && color.s !== 0) other.h = color.h;

			// Blend hue on the short path around the circle
			if (color.h < other.h) {
				if (!largeArc && other.h - color.h < 180 || largeArc && other.h - color.h >= 180) {
					// Clockwise
					color.h = round(color.h + (other.h - color.h) * ratio, 3);
				} else {
					// Counter-clockwise with overflow
					var h = other.h - 360;
					color.h = round(color.h + (h - color.h) * ratio, 3);
					if (color.h < 0) color.h += 360;
				}
			} else {
				if (!largeArc && color.h - other.h < 180 || largeArc && color.h - other.h >= 180) {
					// Counter-clockwise
					color.h = round(color.h + (other.h - color.h) * ratio, 3);
				} else {
					// Clockwise with overflow
					var _h = color.h - 360;
					color.h = round(_h + (other.h - _h) * ratio, 3);
					if (color.h < 0) color.h += 360;
				}
			}

			["s", "l"].forEach(function (c) {
				color[c] = keep1(round(color[c] + (other[c] - color[c]) * ratio, 3));
			});
			if (includeAlpha) color.a = round(color.a + (other.a - color.a) * ratio, 3);
			color.updateRGB();
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

		// Returns a color with a changed alpha value between 0 (transparent) and 1 (opaque).
		Color_prototype.alpha = function (alpha) {
			return processColor(this, true, function () {
				this.a = keep1(alpha);
			});
		};

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

		var colorNames = {
			de: {
				transparent: "transparent",
				black: "schwarz",
				gray: "grau",
				white: "weiß",
				red: "rot",
				orange: "orange",
				yellow: "gelb",
				green: "grün",
				cyan: "türkis",
				blue: "blau",
				purple: "lila",
				pink: "pink",
				brown: "braun",
				dark: "dunkel",
				light: "hell",
				pale: "blass"
			},
			en: {
				transparent: "transparent",
				black: "black",
				gray: "gray",
				white: "white",
				red: "red",
				orange: "orange",
				yellow: "yellow",
				green: "green",
				cyan: "cyan",
				blue: "blue",
				purple: "purple",
				pink: "pink",
				brown: "brown",
				dark: "dark ",
				light: "light ",
				pale: "pale "
			}
		};

		// Returns a simple description of the color.
		Color_prototype.description = function (language) {
			var color = Color(this);
			if (color.h === undefined$1) color.updateHSL();
			if (color.h === undefined$1 || isNaN(color.h)) return null;
			if (!(language in colorNames)) language = "en";
			var names = colorNames[language];
			if (color.a < 0.02) return names.transparent;
			// Normalise values for development with a color tool
			var h = color.h / 360 * 255;
			var s = color.s * 255;
			var l = color.l * 255;
			if (l < 30) return names.black;
			if (l > 240) return names.white;

			var colorName = h < 15 ? names.red : h < 33 ? names.orange : h < 49 ? names.yellow : h < 111 ? names.green : h < 138 ? names.cyan : h < 180 ? names.blue : h < 207 ? names.purple : h < 238 ? names.pink : names.red;
			// Determines the saturation up to which the colour is grey (depending on the lightness)
			var graySaturation = function graySaturation(l) {
				if (l < 128) return 90 + (30 - 90) * (l - 30) / (128 - 30);else return 30 + (90 - 30) * (l - 128) / (240 - 128);
			};
			if (l < 100) {
				if (s < graySaturation(l)) return names.dark + names.gray;else if (colorName === names.orange) return names.brown;else return names.dark + colorName;
			}
			if (l > 190) {
				if (s < graySaturation(l)) return names.light + names.gray;else return names.light + colorName;
			}
			if (s > 170) return colorName;
			if (s < graySaturation(l)) return names.gray;else return names.pale + colorName;
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

		function keep360(value) {
			return minmax(value, 0, 360);
		}

		// Returns the value in the range between min and max.
		function minmax(value, min, max) {
			return Math.max(min, Math.min(value, max));
		}

		// Returns the value rounded to the specified number of decimals.
		function round(value, decimals) {
			if (decimals === undefined$1) decimals = 0;
			var precision = Math.pow(10, decimals);
			return Math.round(value * precision) / precision;
		}
	})();

	var replacementKey$1 = "ff-replacement";

	// Add support for jQuery DOM functions with replaced elements by Frontfire (like selectable)
	var origToggle = $.fn.toggle;
	$.fn.toggle = function () {
		var args = arguments;
		return this.each$(function (_, obj) {
			origToggle.apply(obj.data(replacementKey$1) || obj, args);
		});
	};

	var origShow = $.fn.show;
	$.fn.show = function () {
		var args = arguments;
		return this.each$(function (_, obj) {
			origShow.apply(obj.data(replacementKey$1) || obj, args);
		});
	};

	var origHide = $.fn.hide;
	$.fn.hide = function () {
		var args = arguments;
		return this.each$(function (_, obj) {
			origHide.apply(obj.data(replacementKey$1) || obj, args);
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
				if (value) $(obj).show();else $(obj).hide();
			});
		}

		// Getter
		if (this.length === 0) return;
		var el = this.data(replacementKey$1) || this;
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
				if (value) $(obj).disable(includeLabel);else $(obj).enable(includeLabel);
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
				if (obj.data(replacementKey$1)) obj.data(replacementKey$1).enable(false);
			} else if (obj.attr("disabled") !== undefined) {
				// Don't set the property or it will be added where not supported.
				// Only remove HTML attribute to allow CSS styling other elements than inputs
				obj.removeAttr("disabled");
				// Trigger the event manually
				obj.trigger("disabledchange");
			}

			obj.parents("label").enable();
			var id = obj.attr("id");
			if (id) $("label[for='" + id + "']").enable();

			if (includeLabel !== false) {
				// Find previous .label sibling up on the .form-row level
				var refNode = obj;
				while (refNode.parent().length > 0 && !refNode.parent().hasClass("form-row")) {
					refNode = refNode.parent();
				}var label = refNode.prev();
				if (label.hasClass("label")) label.enable();
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
				if (obj.data(replacementKey$1)) obj.data(replacementKey$1).disable(false);
			} else if (obj.attr("disabled") === undefined) {
				// Don't set the property or it will be added where not supported.
				// Only set HTML attribute to allow CSS styling other elements than inputs
				obj.attr("disabled", "");
				// Trigger the event manually
				obj.trigger("disabledchange");
			}

			obj.parents("label").disable();
			var id = obj.attr("id");
			if (id) $("label[for='" + id + "']").disable();

			if (includeLabel !== false) {
				// Find previous .label sibling up on the .form-row level
				var refNode = obj;
				while (refNode.parent().length > 0 && !refNode.parent().hasClass("form-row")) {
					refNode = refNode.parent();
				}var label = refNode.prev();
				if (label.hasClass("label")) label.disable();
			}
		});
	};

	// Toggles the disabled state of the selected elements and the associated label(s).
	//
	// includeLabel: Also updates the parent form row label, if there is one. Default: true.
	$.fn.toggleDisabled = function (includeLabel) {
		return this.each$(function (_, obj) {
			if (obj.disabled()) obj.enable(includeLabel);else obj.disable(includeLabel);
		});
	};

	// Determines whether the selected element is readonly.
	//
	// value: Sets the readonly state of the selected elements. Unsupported elements are disabled instead.
	$.fn.readonly = function (value) {
		// Setter
		if (value !== undefined) {
			return this.each(function (_, obj) {
				var supportsReadonlyProp = "readonly" in obj;
				var supportsDisabledProp = "disable" in obj;
				obj = $(obj);
				if (value) {
					if (supportsReadonlyProp) {
						obj.prop("readonly", true);
						if (obj.data(replacementKey$1)) obj.data(replacementKey$1).readonly(true);
					} else if (supportsDisabledProp) {
						obj.prop("disabled", true);
						if (obj.data(replacementKey$1)) obj.data(replacementKey$1).readonly(true);
					} else if (obj.attr("readonly") === undefined) {
						obj.attr("readonly", "");
						obj.trigger("readonlychange");
					}
				} else {
					if (supportsReadonlyProp) {
						obj.prop("readonly", false);
						if (obj.data(replacementKey$1)) obj.data(replacementKey$1).readonly(false);
					} else if (supportsDisabledProp) {
						obj.prop("disabled", false);
						if (obj.data(replacementKey$1)) obj.data(replacementKey$1).readonly(false);
					} else if (obj.attr("readonly") !== undefined) {
						obj.removeAttr("readonly");
						obj.trigger("readonlychange");
					}
				}
			});
		}

		// Getter
		if (this.length === 0) return;
		return this[0].readonly || this.attr("readonly") !== undefined;
	};

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
			var lastColumn = void 0,
			    lastVisibleColumn = void 0;
			// TODO: Ignore nested tables
			// TODO: This looks strange, is it per-row?
			table.find("th, td").each$(function (_, td) {
				td.removeClass("last-column");
				lastColumn = td;
				if (td.visible()) lastVisibleColumn = td;
			});
			if (lastColumn && lastVisibleColumn && lastColumn !== lastVisibleColumn) lastVisibleColumn.addClass("last-column");
		});
	};

	// Sets the first-row and last-row class to the first/last visible row in a table, if
	// preceding/following rows are hidden. This ensures (together with CSS rules) that the border and
	// padding of the first and last visible row is correct.
	$.fn.updateFirstLastRow = function () {
		return this.each$(function (_, table) {
			var lastRow = void 0,
			    lastVisibleRow = void 0,
			    seenFirstRow = void 0;
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
				} else {
					tr.addClass("hidden-row");
				}
			});
			if (lastRow && lastVisibleRow && lastRow !== lastVisibleRow) lastVisibleRow.addClass("last-row");
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
			var parent = obj;
			do {
				if (predicate(parent, obj)) {
					ret = ret.add(parent);
					break;
				}
				parent = parent.parentElement;
			} while (parent);
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
			var animate = function animate() {
				if (++animationPosition <= animationCount) {
					var r = Math.sin(animationPosition / animationCount * Math.PI / 2);
					var pos = scrollStart + (scrollEnd - scrollStart) * r;
					$(window).scrollTop(pos);
					scrollAnimationTimeout = setTimeout(animate, animationDelay);
				}
			};

			if (scrollAnimationTimeout) clearTimeout(scrollAnimationTimeout);

			var scrollStart = window.scrollY;
			var scrollEnd = this.offset().top - (offset || 0);

			var animationDelay = 10;
			var animationCount = 40;
			var animationPosition = 0;
			animate();
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
	//
	// type: The event type ("down", "move", "up", "cancel"). Multiple types can be space-delimited.
	// handler: The event handler function.
	// capture: Specifies the capture option. If true, DOM addEventListener is used instead of jQuery.
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
				this.each$(function (_, obj) {
					_eventRemovers.push(obj.pointer(type, handler, capture));
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
	var resetAllCursorsClass$1 = "reset-all-cursors";

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
		scroll: false,

		// An element that catches all pointer input and moves the draggable to that point. Default: None.
		catchElement: undefined
	};

	// Makes each selected element draggable.
	function draggable(options) {
		return this.each(function (_, elem) {
			var $elem = $(elem);
			if ($elem.hasClass(draggableClass)) return; // Already done
			$elem.addClass(draggableClass);
			var dragging, draggingCancelled, dragPoint, elemRect, minDragDistance, pointerId, htmlCursor;
			var opt = initOptions("draggable", draggableDefaults, $elem, {}, options);
			var $window = $(window);

			var handle = opt.handle ? $elem.find(opt.handle) : $elem;
			opt.handleElem = handle;

			// Allow Pointer API to work properly in Edge
			opt.originalTouchAction = handle.css("touch-action");
			if (opt.axis === "x") handle.css("touch-action", "pan-y pinch-zoom");else if (opt.axis === "y") handle.css("touch-action", "pan-x pinch-zoom");else handle.css("touch-action", "pinch-zoom");

			opt.eventRemovers = [];
			var eventRemovers = [];
			opt.eventRemovers.push(handle.pointer("down", function (event) {
				if (event.button === 0) {
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
					event.stopImmediatePropagation();
				}));
			}

			if (opt.catchElement) {
				opt.eventRemovers.push($(opt.catchElement).pointer("down", function (event) {
					if (event.button === 0) {
						event.stopImmediatePropagation();
						if (dragging) return;
						draggingCancelled = false;
						dragPoint = { left: event.pageX, top: event.pageY };
						pointerId = event.pointerId;
						eventRemovers.push($window.pointer("move", onMove, true));
						eventRemovers.push($window.pointer("up cancel", onEnd, true));
						// Start dragging mode immediately when catching.
						tryStartDragging();
						if (dragging) {
							// Move the draggable element directly under the pointer initially
							elemRect.top = dragPoint.top - elemRect.height / 2;
							elemRect.left = dragPoint.left - elemRect.width / 2;
							handleMove(event);
						}
					}
				}));
			}

			function tryStartDragging() {
				elemRect = $elem.rect();
				var event2 = $.Event("draggablestart");
				event2.dragPoint = dragPoint;
				event2.newPoint = { left: event.pageX, top: event.pageY };
				$elem.trigger(event2);
				if (!event2.isDefaultPrevented()) {
					dragging = true;
					opt.dragClass && $elem.addClass(opt.dragClass);
					elem.setCapture && elem.setCapture(); // Firefox only (set cursor over entire desktop)
					$("html").addClass(resetAllCursorsClass$1); // All browsers (set cursor at least within page)
					if (opt.stack) {
						stackElements($(opt.stack), elem);
					}
					htmlCursor = elem.ownerDocument.documentElement.style.getPropertyValue("cursor");
					elem.ownerDocument.documentElement.style.setProperty("cursor", opt.dragCursor || $elem.actualCursor(), "important");
				} else {
					draggingCancelled = true;
				}
			}

			function handleMove(event) {
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
					var cont = void 0,
					    contRect = void 0;
					if (opt.containment === "parent") {
						cont = $elem.parent();
					} else if (opt.containment === "viewport") {
						var scrollTop = $window.scrollTop();
						var scrollLeft = $window.scrollLeft();
						contRect = {
							top: 0 + scrollTop,
							left: 0 + scrollLeft,
							bottom: $window.height() + scrollTop,
							right: $window.width() + scrollLeft
						};
					} else {
						cont = $(opt.containment);
					}
					if (cont && cont.length > 0) {
						contRect = cont.rect();
					}
					if (contRect) {
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
				var event2 = $.Event("draggablemove");
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

			function onMove(event) {
				if (event.pointerId !== pointerId) return; // Not my pointer
				if (draggingCancelled) return; // Don't try again until the button was released

				// Consider starting a drag operation
				if (dragPoint && !dragging && !$elem.disabled()) {
					var distance = Math.sqrt(Math.pow(event.pageX - dragPoint.left, 2) + Math.pow(event.pageY - dragPoint.top, 2));
					if (distance >= minDragDistance) {
						tryStartDragging();
					}
				}

				// Handle an ongoing drag operation
				if (dragging) {
					handleMove(event);
				}
			}

			function onEnd(event) {
				if (event.pointerId !== pointerId) return; // Not my pointer

				if (event.button === 0) {
					// Attention:
					// If event.type is "pointerup", a click event may follow somewhere!
					// It cannot be stopped, deal with it otherwise.

					var wasDragging = dragging;
					dragPoint = undefined;
					dragging = false;
					pointerId = undefined;
					opt.dragClass && $elem.removeClass(opt.dragClass);

					eventRemovers.forEach(function (eventRemover) {
						return eventRemover();
					});
					eventRemovers = [];

					if (wasDragging) {
						elem.releaseCapture && elem.releaseCapture();
						$("html").removeClass(resetAllCursorsClass$1);
						elem.ownerDocument.documentElement.style.setProperty("cursor", htmlCursor);

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

	// Removes the draggable features from the elements.
	function remove$1() {
		return this.each(function (_, elem) {
			var $elem = $(elem);
			if (!$elem.hasClass(draggableClass)) return;
			$elem.removeClass(draggableClass);
			var opt = loadOptions("draggable", $elem);
			opt.handleElem.css("touch-action", opt.originalTouchAction);
			opt.eventRemovers.forEach(function (eventRemover) {
				return eventRemover();
			});
		});
	}

	registerPlugin("draggable", draggable, {
		remove: remove$1
	});
	$.fn.draggable.defaults = draggableDefaults;

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
		if (dropdown.length === 0) return this; // Nothing to do
		if (dropdown.parent().hasClass(dropdownContainerClass)) {
			var oldContainer = dropdown.parent();
			if (oldContainer.hasClass("closed")) {
				// Already closed but the transition hasn't completed yet. Bring it to an end right now.
				dropdown.appendTo("body");
				oldContainer.remove();
			} else {
				return; // Already open
			}
		}
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
		} else if (optPlacement.startsWith("bottom")) {
			top = targetRect.bottom;
			direction = "bottom";
		} else if (optPlacement.startsWith("left")) {
			left = targetRect.left - dropdownWidth;
			direction = "left";
			isRightAligned = true;
		} else if (optPlacement.startsWith("right")) {
			left = targetRect.right;
			direction = "right";
		}

		if (optPlacement.endsWith("left")) {
			left = targetRect.left;
		} else if (optPlacement.endsWith("right")) {
			left = targetRect.right - dropdownWidth;
			isRightAligned = true;
		} else if (optPlacement.endsWith("top")) {
			top = targetRect.top;
		} else if (optPlacement.endsWith("bottom")) {
			top = targetRect.bottom - dropdownHeight;
		}

		if (optPlacement === "top-center" || optPlacement === "bottom-center") {
			left = (targetRect.left + targetRect.right) / 2 - dropdownWidth / 2;
			isHorizontallyCentered = true;
		} else if (optPlacement === "left-center" || optPlacement === "right-center") {
			top = (targetRect.top + targetRect.bottom) / 2 - dropdownHeight / 2;
		}

		if (autoPlacement && left + dropdownWidth > viewportWidth) {
			left = viewportWidth - dropdownWidth;
		}
		if (autoPlacement && top + dropdownHeight > viewportHeight + scrollTop) {
			var topSpace = targetRect.top - scrollTop;
			var bottomSpace = viewportHeight + scrollTop - targetRect.bottom;
			if (topSpace > bottomSpace) {
				top = targetRect.top - dropdownHeight;
				direction = "top";
			}
		}

		var availableHeight = void 0;
		if (direction === "top") {
			availableHeight = targetRect.top - scrollTop;
		} else if (direction === "bottom") {
			availableHeight = viewportHeight + scrollTop - targetRect.bottom;
		} else {
			availableHeight = viewportHeight;
		}
		if (dropdownHeight > availableHeight) {
			dropdownHeight = availableHeight;
			container.outerHeight(dropdownHeight);
			isReducedHeight = true;
			if (direction === "top") top = targetRect.top - dropdownHeight;
		}

		if (direction === "left" || direction === "right") {
			if (top + dropdownHeight > viewportHeight + scrollTop) {
				top = viewportHeight + scrollTop - dropdownHeight;
			} else if (top < scrollTop) {
				top = scrollTop;
			}
		} else if (direction === "top" || direction === "bottom") {
			if (left + dropdownWidth > viewportWidth + scrollLeft) {
				left = viewportWidth + scrollLeft - dropdownWidth;
			} else if (left < scrollLeft) {
				left = scrollLeft;
			}
		}

		if (isReducedHeight) {
			var scrollbarWidth = container[0].offsetWidth - container[0].clientWidth;
			if (scrollbarWidth > 0) {
				dropdownWidth += scrollbarWidth;
				if (dropdownWidth > viewportWidth) {
					dropdownWidth = viewportWidth;
				}
				container.outerWidth(dropdownWidth);
				if (isRightAligned) {
					left -= scrollbarWidth;
				} else if (isHorizontallyCentered) {
					left -= scrollbarWidth / 2;
				}

				if (left + dropdownWidth > viewportWidth + scrollLeft) {
					left = viewportWidth + scrollLeft - dropdownWidth;
				} else if (left < scrollLeft) {
					left = scrollLeft;
				}
			}
		}

		// Scroll to the first selected item in the dropdown (used for selectable)
		var selectedChild = dropdown.children(".selected").first();
		if (selectedChild.length > 0) {
			var selectedTop = selectedChild.position().top;
			container.scrollTop(selectedTop + selectedChild.height() / 2 - dropdownHeight / 2);
		}

		container.offset({ top: top, left: left }).addClass("animate-" + direction);
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
				if (document.hidden) tryClose();
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
		if (dropdown.length === 0) return this; // Nothing to do
		var container = dropdown.parent();
		return container.hasClass(dropdownContainerClass);
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

	var replacementKey = "ff-replacement";

	var inputWrapperClass$1 = "ff-input-wrapper";
	var repeatButtonClass = "ff-repeat-button";
	var styleCheckboxClass = "ff-checkbox";
	var treeStateClass = "ff-threestate";
	var textareaWrapperClass = "ff-textarea-wrapper";

	// Makes each selected button trigger repeated click events while being pressed.
	// The button will not trigger a click event anymore but instead repeatclick events.
	function repeatButton() {
		return this.each$(function (_, button) {
			if (button.hasClass(repeatButtonClass)) return; // Already done
			button.addClass(repeatButtonClass);
			var timeout, ms;
			button.on("mousedown touchstart", function (event) {
				event.preventDefault();
				button.addClass("ff-active"); // CSS :active doesn't trigger, do it manually with an alternate class
				ms = 500;
				click();
			});
			button.on("mouseup mouseleave touchend touchcancel", function (event) {
				button.removeClass("ff-active");
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
		return this.each$(function (_, input) {
			if (input.parent().hasClass(inputWrapperClass$1)) return; // Already done

			// Put a wrapper between the input and its parent
			var wrapper = $("<div/>").addClass(inputWrapperClass$1).attr("style", input.attr("style"));
			input.before(wrapper).appendTo(wrapper);
			input.attr("autocomplete", "off");

			// Add control buttons
			var buttons = [];
			var decButton = $("<button type='button'/>").addClass("button").appendTo(wrapper).attr("tabindex", "-1").text('\u2212'); // &minus;
			buttons.push(decButton);
			decButton.on("repeatclick", function () {
				if (input.disabled()) return;
				var value = +input.val();
				var min = input.attr("min");
				var max = input.attr("max");
				var stepBase = min !== undefined ? +min : 0;
				var stepAttr = "";
				if (input.data("step")) stepAttr = input.data("step") + "";else if (input.attr("step")) stepAttr = input.attr("step");
				var match = stepAttr.match(/^\s*\*(.*)/);
				if (match) {
					var factor = +match[1] || 10;
					if ((min === undefined || value / factor >= min) && (max === undefined || value / factor <= max)) value /= factor;
				} else {
					if (max !== undefined && value > +max) value = +max + 1;
					var step = +stepAttr || 1;
					var corr = step / 1000; // Correct JavaScript's imprecise numbers
					value = (Math.ceil((value - stepBase - corr) / step) - 1) * step + stepBase; // Set to next-smaller valid step
					if (min !== undefined && value < +min) value = +min;
					while (max !== undefined && value > +max) {
						value -= step;
					}
				}
				var valueStr = value.toFixed(10).replace(/0+$/, "").replace(/[.,]$/, ""); // Correct JavaScript's imprecise numbers again
				input.val(valueStr);
				input.trigger("input").change();
			});
			decButton.repeatButton();
			var incButton = $("<button type='button'/>").addClass("button").appendTo(wrapper).attr("tabindex", "-1").text("+");
			buttons.push(incButton);
			incButton.on("repeatclick", function () {
				if (input.disabled()) return;
				var value = +input.val();
				var min = input.attr("min");
				var max = input.attr("max");
				var stepBase = min !== undefined ? +min : 0;
				var stepAttr = "";
				if (input.data("step")) stepAttr = input.data("step") + "";else if (input.attr("step")) stepAttr = input.attr("step");
				var match = stepAttr.match(/^\s*\*(.*)/);
				if (match) {
					var factor = +match[1] || 10;
					if ((min === undefined || value * factor >= min) && (max === undefined || value * factor <= max)) value *= factor;
				} else {
					if (max !== undefined && value > +max) value = +max + 1;
					var step = +stepAttr || 1;
					var corr = step / 1000; // Correct JavaScript's imprecise numbers
					// TODO: With max=100 and step=0.1, incrementing from 100 results in 99.9 again. JavaScript double precision is still broken here!
					value = (Math.floor((value - stepBase + corr) / step) + 1) * step + stepBase; // Set to next-greater valid step
					if (min !== undefined && value < +min) value = +min;
					while (max !== undefined && value > +max) {
						value -= step;
					}
				}
				var valueStr = +value.toFixed(10).replace(/0+$/, "").replace(/[.,]$/, ""); // Correct JavaScript's imprecise numbers again
				input.val(valueStr);
				input.trigger("input").change();
			});
			incButton.repeatButton();
			bindInputButtonsDisabled(input, buttons);
		});
	}

	registerPlugin("spinner", spinner);

	// Converts each selected checkbox input into a toggle button.
	function toggleButton() {
		return this.each$(function (_, input) {
			if (!input.is("input[type=checkbox]")) return; // Wrong element
			var content = void 0;
			var isActive = input.prop("checked");
			//let activeValue = input.attr("value");
			var button = void 0;
			if (input.parent().is("label")) {
				var label = input.parent();
				input.insertBefore(label);
				content = label.html();
				label.remove();
			} else if (input.attr("id")) {
				var _label = $("label[for='" + input.attr("id") + "']");
				if (_label.length > 0) {
					content = _label.html();
					_label.remove();
				}
			}

			button = $("<button/>").attr("type", "button").attr("title", input.attr("title")).attr("style", input.attr("style")).addClass("button toggle-button").html(content).insertAfter(input);
			//input.attr("type", "hidden");
			input.hide();
			input.data(replacementKey, button);
			// Copy some CSS classes to the button
			["narrow", "transparent", "input-validation-error"].forEach(function (clsName) {
				if (input.hasClass(clsName)) button.addClass(clsName);
			});

			if (isActive) button.addClass("active");
			//else
			//	input.val("");

			button.click(function () {
				button.toggleClass("active");
				//input.val(button.hasClass("active") ? activeValue : "");
				input.prop("checked", button.hasClass("active")).change();
			});

			input.on("change", function () {
				button.toggleClass("active", input.prop("checked"));
			});
		});
	}

	registerPlugin("toggleButton", toggleButton);

	// Converts each selected input[type=color] element into a text field with color picker button.
	function colorPicker() {
		return this.each$(function (_, input) {
			if (input.parent().hasClass(inputWrapperClass$1)) return; // Already done
			var lastColor;

			input.attr("type", "text").attr("autocapitalize", "off").attr("autocomplete", "off").attr("autocorrect", "off").attr("spellcheck", "false");

			// Put a wrapper between the input and its parent
			var wrapper = $("<div/>").addClass(inputWrapperClass$1).attr("style", input.attr("style"));
			input.before(wrapper).appendTo(wrapper);

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
			var pickButton = $("<button type='button'/>").addClass("button ff-colorbutton").appendTo(wrapper);
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
				var button = $("<button type='button'/>").addClass("button").css("background", color).data("color", String(color)).appendTo(buttonRow);
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
				dropdown.find("button").each$(function (_, obj) {
					var active = obj.data("color") === currentColor;
					obj.toggleClass("active", active);
					if (active) activeButton = obj[0];
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
				if (toInput && input.val() != color) {
					input.val(color).trigger("input").change();
				}
				colorBox.css("background", color);
				colorBox.css("color", Color(color).text());
			}
		});
	}

	registerPlugin("colorPicker", colorPicker);

	// Applies the enhanced style on the selected checkbox and radio input elements.
	function styleCheckbox() {
		return this.each$(function (_, input) {
			if (input.hasClass(styleCheckboxClass)) return; // Already done
			if (!input.is("input[type=checkbox], input[type=radio]")) return; // Wrong element
			if (input.hasClass("toggle-button")) return; // Hidden and replaced by a button

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
		return this.each$(function (_, input) {
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
		return this.each$(function (_, textarea) {
			if (textarea.parent().hasClass(textareaWrapperClass)) return; // Already done

			// Put a wrapper between the textarea and its parent, and host a new shadow element in
			// the wrapper as well. The textarea is set to fill the container, and the shadow
			// element provides the size for the wrapper.
			var wrapper = $("<div/>").addClass(textareaWrapperClass).attr("style", textarea.attr("style"));
			textarea.before(wrapper).appendTo(wrapper);
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

			// The autofocus option often gets lost after this, so redo it explicitly
			if (textarea.prop("autofocus")) textarea.focus();

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

	// Defines default options for the submitLock plugin.
	var submitLockDefaults = {
		// The lock timeout in seconds. Default: 30.
		timeout: 30
	};

	// Locks form submit buttons for a moment to avoid accidental double-submit.
	function submitLock(options) {
		return this.each$(function (_, button) {
			if (button.data("hasSubmitLock")) return; // Already done
			button.data("hasSubmitLock", true);

			var opt = initOptions("submitLock", submitLockDefaults, button, {}, options);
			opt._lock = lockButton;
			opt._unlock = unlockButton;

			button.on("click", function () {
				button.data("submitLockClicked", true);
				setTimeout(function () {
					button.data("submitLockClicked", null);
				}, 500);
			});

			var icon = button.find("i:empty");
			var loading = void 0;

			// Connect with form submit event if there is a form; otherwise, only explicit locking
			// available for this button
			var form = button[0].form;
			if (form) {
				$(form).on("submit", function (event) {
					//event.preventDefault();   // DEBUG
					if (button.disabled()) return; // Nothing to do for this button
					lockButton(opt.timeout);
				});
			}

			function lockButton(timeout) {
				// Lock the button and replace the icon with a loading indicator
				button.disable();
				if (icon.length > 0) {
					if (button.data("submitLockClicked")) {
						var iconWidth = icon.width();
						var iconMarginLeft = parseFloat(icon.css("margin-left"));
						var iconMarginRight = parseFloat(icon.css("margin-right"));
						icon.hide();
						loading = $("<i/>").addClass("loading thick").css("font-size", "1em").css("vertical-align", "-2px").insertAfter(icon);
						var loadingWidth = loading.width();
						var dx = loadingWidth - iconWidth;
						loading.css("margin-left", -dx / 2 + iconMarginLeft).css("margin-right", -dx / 2 + iconMarginRight);
					}
				}

				// Unlock the button and restore the icon after a timeout if the page is still alive
				setTimeout(unlockButton, timeout * 1000);
			}

			function unlockButton() {
				button.enable();
				if (loading) {
					loading.remove();
					icon.show();
				}
			}
		});
	}

	// Locks the button immediately.
	function submitLockLock(timeout) {
		return this.each$(function (_, button) {
			var opt = loadOptions("submitLock", button);
			opt._lock(timeout || opt.timeout);
		});
	}

	// Unlocks the button immediately.
	function submitLockUnlock() {
		return this.each$(function (_, button) {
			var opt = loadOptions("submitLock", button);
			opt._unlock();
		});
	}

	registerPlugin("submitLock", submitLock, {
		lock: submitLockLock,
		unlock: submitLockUnlock
	});
	$.fn.submitLock.defaults = submitLockDefaults;

	// Converts each selected list element into a menu. Submenus are opened for nested lists.
	function menu() {
		return this.each$(function (_, menu) {
			var isVertical = menu.hasClass("vertical");
			var itemsWithSubmenu = menu.children("li").has("ul");
			itemsWithSubmenu.each$(function (_, item) {
				item.addClass("ff-has-submenu");
				var submenu = item.children("ul").first();
				if (submenu.hasClass("ff-submenu")) return; // Already done
				submenu.addClass("ff-submenu dropdown");
				if (item.closest("nav").length > 0) submenu.addClass("nav");

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
				submenu.children("li").each$(function (_, obj) {
					if (obj.text() === "-") {
						obj.text("");
						obj.addClass("separator");
					}
				});

				// Close submenu when clicking on one of its items
				submenu.find("li > a:not(.stay-open)").each$(function (_, obj) {
					obj.click(function () {
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
		return this.each$(function (_, message) {
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
		return this.each$(function (_, message) {
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

	var dimCount = 0;

	// Dims the entire document by adding an overlay.
	function dimBackground(noinput) {
		dimCount++;
		if ($("body > div." + backgroundDimmerClass + ":not(.closing)").length !== 0) return; // Already there
		var existingBackgroundLayer = $("body > div." + backgroundDimmerClass);
		if (existingBackgroundLayer.length === 0) $("body").trigger("dim");
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
		dimCount--;
		if (dimCount > 0) return false; // Not the last one, keep it dimmed
		var $body = $("body");
		$body.removeClass(dimmedClass);
		backgroundLayer.addClass("closing").css("opacity", "0");
		backgroundLayer.on("transitionend", function () {
			if (!$body.hasClass(dimmedClass)) {
				// No other layer appeared in the meantime
				$body.removeClass(dimmingClass);
				$("body").trigger("undim");
			}
			backgroundLayer.remove();
		});
		return true;
	}

	var modalEventNamespace = ".ff-modal";
	var modalClass = "ff-modal-container";
	var modalCloseButtonClass = "ff-modal-close-button";

	var modalLevel = 0;

	// Defines default options for the modal plugin.
	var modalDefaults = {
		// Indicates whether the modal is closed when clicking anywhere outside of it or pressing Esc.
		// This also shows a close button in the model overlay. Default: true.
		cancellable: true,

		// The tooltip text for the close button. Default: empty.
		closeTooltip: "",

		// Indicates whether the page background is dimmed while the modal is open. Default: true.
		dimBackground: true,

		// The action to execute when the Enter key was pressed. Default: none.
		defaultAction: undefined
	};

	// Opens a modal with the selected element.
	function modal(options) {
		var modal = this.first();
		if (modal.length === 0) return this; // Nothing to do
		if (modal.parent().hasClass(modalClass)) return this; // Already open
		modalLevel++;
		var opt = initOptions("modal", modalDefaults, modal, {}, options);
		opt.level = modalLevel;
		if (opt.dimBackground && modalLevel === 1) dimBackground();

		var container = $("<div/>").addClass(modalClass).appendTo("body");
		modal.appendTo(container);
		modal.find(":focusable").first().focus().blur();

		if (modalLevel === 1) preventScrolling();

		// Prevent moving the focus out of the modal
		$(document).on("focusin" + modalEventNamespace + "-" + opt.level, function (event) {
			if (opt.level === modalLevel) {
				// This is the top-most modal now, handle the focus event
				if ($(event.target).parents().filter(modal).length === 0) {
					// The focused element's ancestors do not include the modal, so the focus went out
					// of the modal. Bring it back.
					modal.find(":focusable").first().focus();
					event.preventDefault();
					event.stopImmediatePropagation();
					return false;
				}
			}
		});

		var closeButton;
		if (opt.cancellable) {
			// Close on pressing the Escape key or clicking outside the modal
			$(document).on("keydown" + modalEventNamespace + "-" + opt.level, function (event) {
				if (event.keyCode === 27) {
					// Escape
					if (modalLevel === opt.level) {
						// There might be another modal on top
						event.preventDefault();
						modal.modal.close();
					}
				}
				if (event.keyCode === 13 && opt.defaultAction) {
					// Enter
					if (modalLevel === opt.level) {
						// There might be another modal on top
						event.preventDefault();
						opt.defaultAction();
					}
				}
			});
			// Close on mousedown instead of click because it's more targeted. A click event is also
			// triggered when the mouse button was pressed inside the modal and released outside of it.
			// This is considered "expected behaviour" of the click event.
			container.on("mousedown", function (event) {
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
		modalLevel--;
		var opt = loadOptions("modal", modal);
		var closeButton = modal.find("." + modalCloseButtonClass).first();

		if (!modalLevel) preventScrolling(false);
		$(document).off("focusin" + modalEventNamespace + "-" + opt.level);
		$(document).off("keydown" + modalEventNamespace + "-" + opt.level);
		modal.appendTo("body");
		container.remove();
		if (closeButton) closeButton.remove();
		if (opt.dimBackground && !modalLevel) undimBackground();

		var event = $.Event("close");
		modal.trigger(event);
		return this;
	}

	registerPlugin("modal", modal, {
		close: closeModal
	});
	$.fn.modal.defaults = modalDefaults;

	// Shows a standard message box modal with content and buttons.
	//
	// options.content: (jQuery) The message content to display.
	// options.html: (String) The message HTML content to display.
	// options.text: (String) The message text to display.
	// options.buttons: (Array) The buttons to display in the modal.
	// options.buttons[].text: (String) The button text.
	// options.buttons[].icon: (String) The CSS class of an <i> element displayed before the text.
	// options.buttons[].className: (String) Additional CSS classes for the button.
	// options.buttons[].result: The result value of the button.
	// options.resultHandler: (Function) The modal response handler. It is passed the button handler's return value, or false if cancelled.
	// options.className: (String) Additional CSS class names for the modal element.
	//
	// If a string is passed as first argument, it is displayed as text with an OK button.
	// Only then, closeHandler is also regarded as options.resultHandler.
	$.modal = function (options, closeHandler) {
		if (typeof options === "string") {
			options = {
				text: options,
				buttons: "OK",
				resultHandler: closeHandler
			};
		}

		var modal = $("<div/>").addClass("modal");
		if (options.className) modal.addClass(options.className);
		var content = $("<div/>").css("overflow", "auto").css("max-height", "calc(100vh - 80px - 5em)") // padding of modal, height of buttons
		.appendTo(modal);
		if (options.content) content.append(options.content);else if (options.html) content.html(options.html);else if (options.text) content.text(options.text).css("white-space", "pre-wrap");

		var buttons = options.buttons;
		if (typeof buttons === "string") {
			switch (buttons) {
				case "OK":
					buttons = [{ text: "OK", className: "default", result: true }];
					break;
				case "OK cancel":
					buttons = [{ text: "OK", className: "default", result: true }, { text: "Cancel", className: "transparent", result: false }];
					break;
				case "YES no":
					buttons = [{ text: "Yes", className: "default", result: true }, { text: "No", result: false }];
					break;
				case "yes NO":
					buttons = [{ text: "Yes", result: true }, { text: "No", className: "default", result: false }];
					break;
				default:
					buttons = [];
					break;
			}
		}

		var buttonsElement = void 0;
		var buttonPressed = false;
		if (buttons && buttons.length > 0) {
			buttonsElement = $("<div/>").addClass("buttons").appendTo(modal);
			buttons.forEach(function (button) {
				var buttonElement = $("<button/>").addClass("button").addClass(button.className).appendTo(buttonsElement);
				if (button.icon) buttonElement.append($("<i/>").addClass(button.icon));
				if (button.icon && button.text) buttonElement.append(" ");
				if (button.text) buttonElement.append(button.text);
				buttonElement.click(function (event) {
					buttonPressed = true;
					modal.modal.close();
					if (options.resultHandler) options.resultHandler(button.result);
				});
			});
		}
		modal.modal(options);
		if (buttonsElement) buttonsElement.find("button").first().focus();
		if (options.resultHandler) {
			modal.on("close", function () {
				if (!buttonPressed) options.resultHandler();
			});
		}
	};

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
		push: 1,

		// Close the panel when the window size has changed. Default: false.
		closeOnResize: false
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

		if (opt.closeOnResize) {
			$(window).on("resize" + offCanvasEventNamespace, function () {
				offCanvas.offCanvas.close();
			});
		}

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

		offCanvas.addClass("open");
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
		offCanvas.removeClass("open");
		offCanvas.trigger("offcanvasclose");
		return this;
	}

	registerPlugin("offCanvas", offCanvas, {
		close: closeOffCanvas
	});
	$.fn.offCanvas.defaults = offCanvasDefaults;

	var progressbarClass = "ff-progressbar";

	// Defines default options for the progressbar plugin.
	var progressbarDefaults = {
		// The minimum value of the progress bar. Default: 0.
		min: 0,

		// The maximum value of the progress bar. Default: 100.
		max: 100,

		// The current progress value. Default: 0.
		value: 0,

		// The string to display before the value in the progress bar. Default: "".
		valuePrefix: "",

		// The string to display after the value in the progress bar. Default: "".
		valueSuffix: ""
	};

	// Shows a progressbar on the element.
	function progressbar(options) {
		return this.each$(function (_, elem) {
			if (elem.hasClass(progressbarClass)) return; // Already done
			elem.addClass(progressbarClass);
			var opt = initOptions("progressbar", progressbarDefaults, elem, {}, options);
			opt._setValue = setValue;

			var bar = $("<div/>").addClass("ff-bar").appendTo(elem);
			var number = $("<span/>").appendTo(bar);
			setValue(opt.value);

			// Sets a progress bar value and triggers the change event.
			function setValue(value) {
				value = minmax(value, opt.min, opt.max);
				var relWidth = (value - opt.min) / (opt.max - opt.min);
				bar.css("width", relWidth * 100 + "%");
				number.text(opt.valuePrefix + value + opt.valueSuffix);
				number.toggleClass("outside", number.width() + 8 > relWidth * elem.width());

				if (value !== opt.value) {
					opt.value = value;
					elem.trigger("valuechange");
				}
			}
		});
	}

	// Gets the current progress bar value.
	//
	// value: Sets the progress value.
	function progressbarValue(value) {
		// Getter
		if (value === undefined) {
			var progressbar = this.first();
			if (progressbar.length === 0) return; // Nothing to do
			var opt = loadOptions("progressbar", progressbar);
			return opt.value;
		}

		// Setter
		return this.each$(function (_, progressbar) {
			var opt = loadOptions("progressbar", progressbar);
			opt._setValue(value);
		});
	}

	// Gets the value prefix.
	//
	// prefix: Sets the value prefix.
	function valuePrefix(prefix) {
		// Getter
		if (prefix === undefined) {
			var progressbar = this.first();
			if (progressbar.length === 0) return; // Nothing to do
			var opt = loadOptions("progressbar", progressbar);
			return opt.valuePrefix;
		}

		// Setter
		return this.each$(function (_, progressbar) {
			var opt = loadOptions("progressbar", progressbar);
			opt.valuePrefix = prefix;
			opt._setValue(opt.value);
		});
	}

	// Gets the value suffix.
	//
	// suffix: Sets the value suffix.
	function valueSuffix(suffix) {
		// Getter
		if (suffix === undefined) {
			var progressbar = this.first();
			if (progressbar.length === 0) return; // Nothing to do
			var opt = loadOptions("progressbar", progressbar);
			return opt.valueSuffix;
		}

		// Setter
		return this.each$(function (_, progressbar) {
			var opt = loadOptions("progressbar", progressbar);
			opt.valueSuffix = suffix;
			opt._setValue(opt.value);
		});
	}

	registerPlugin("progressbar", progressbar, {
		value: progressbarValue,
		valuePrefix: valuePrefix,
		valueSuffix: valueSuffix
	});
	$.fn.progressbar.defaults = progressbarDefaults;

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
			if (elem.hasClass(resizableClass)) return; // Already done
			elem.addClass(resizableClass);
			var handleElements = $();
			var opt = initOptions("resizable", resizableDefaults, elem, {}, options);
			var $window = $(window);

			var aspectRatio = opt.aspectRatio;
			if (aspectRatio === true || aspectRatio === "true") aspectRatio = elem.outerWidth() / elem.outerHeight();
			if ($.isNumeric(aspectRatio)) aspectRatio = parseFloat(aspectRatio);
			if (aspectRatio === 0 || !isFinite(aspectRatio) || !$.isNumber(aspectRatio)) aspectRatio = undefined;

			if (elem.css("position") === "static") {
				opt.wasPositionStatic = true;
				elem.css("position", "relative");
			}

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
				var w = opt.handleWidth;
				if (optHandles.indexOf("n") !== -1) addHandle({ left: w / 2, right: w / 2, top: -w / 2, height: w }, vCursor, true, true); // Top edge
				if (optHandles.indexOf("e") !== -1) addHandle({ top: w / 2, bottom: w / 2, right: -w / 2, width: w }, hCursor, false, false); // Right edge
				if (optHandles.indexOf("s") !== -1) addHandle({ left: w / 2, right: w / 2, bottom: -w / 2, height: w }, vCursor, true, false); // Bottom edge
				if (optHandles.indexOf("w") !== -1) addHandle({ top: w / 2, bottom: w / 2, left: -w / 2, width: w }, hCursor, false, true); // Left edge

				if (optHandles.indexOf("ne") !== -1) addHandle({ right: -w / 2, top: -w / 2, width: w, height: w }, neCursor, false, false, true, true); // Top right corner
				if (optHandles.indexOf("se") !== -1) addHandle({ right: -w / 2, bottom: -w / 2, width: w, height: w }, nwCursor, false, false, true, false); // Bottom right corner
				if (optHandles.indexOf("sw") !== -1) addHandle({ left: -w / 2, bottom: -w / 2, width: w, height: w }, neCursor, false, true, true, false); // Bottom left corner
				if (optHandles.indexOf("nw") !== -1) addHandle({ left: -w / 2, top: -w / 2, width: w, height: w }, nwCursor, false, true, true, true); // Top left corner
			}

			installDisabledchangeHook();
			elem.on("disabledchange.resizable", function () {
				handleElements.visible(!elem.disabled());
			});

			function addHandle(style, cursor, vertical, negative, vertical2, negative2) {
				var handle = $("<div/>").addClass("ff-resizable-handle " + opt.handleAddClass).css(style).css("position", "absolute").css("cursor", cursor);
				elem.append(handle);
				handleElements = handleElements.add(handle);
				handle.draggable({ scroll: opt.scroll, dragCursor: cursor });
				handle.on("draggablestart", function (event) {
					event.stopPropagation(); // Don't trigger for the resized (parent) element
					var event2 = $.Event("resizablestart");
					event2.vertical = vertical;
					event2.negative = negative;
					event2.edge = vertical ? negative ? "top" : "bottom" : negative ? "left" : "right";
					elem.trigger(event2);
					if (event2.isDefaultPrevented()) {
						event.preventDefault();
					}
				});
				handle.on("draggablemove", function (event) {
					event.stopPropagation(); // Don't trigger for the resized (parent) element
					event.preventDefault(); // The handles already move with the element, don't touch their position
					resize(handle, event.newPoint, vertical, negative);
					if (vertical2 !== undefined) resize(handle, event.newPoint, vertical2, negative2);
				});
				handle.on("draggableend", function (event) {
					event.stopPropagation(); // Don't trigger for the resized (parent) element
					var event2 = $.Event("resizableend");
					event2.vertical = vertical;
					event2.negative = negative;
					event2.edge = vertical ? negative ? "top" : "bottom" : negative ? "left" : "right";
					elem.trigger(event2);
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
					var gridBase = elem.parent().offset();
					if (negative) {
						delta = newElemOffset[side] - (Math.round((newElemOffset[side] - delta - gridBase[side]) / step) * step + gridBase[side]);
					} else {
						var length = elem["outer" + extent]();
						delta = Math.round((newElemOffset[side] + length + delta - gridBase[side]) / step) * step + gridBase[side] - (newElemOffset[side] + length);
					}
				}

				var newLength = elem["outer" + extent]() + delta;

				var minLength = Math.max(elem["outer" + extent]() - elem[extentLower](), opt["min" + extent] || 0);
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
					var cont = void 0,
					    contRect = void 0;
					if (opt.containment === "parent") {
						cont = elem.parent();
					} else if (opt.containment === "viewport") {
						var scrollTop = $window.scrollTop();
						var scrollLeft = $window.scrollLeft();
						contRect = {
							top: 0 + scrollTop,
							left: 0 + scrollLeft,
							height: $window.height(),
							width: $window.width()
						};
					} else {
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
						} else {
							while (newElemOffset[side] + newLength > contRect[side] + contRect[extentLower]) {
								delta -= step;
								newLength -= step;
							}
						}
					}
				}

				var event2 = $.Event("resizing");
				event2.vertical = vertical;
				event2.negative = negative;
				event2.edge = vertical ? negative ? "top" : "bottom" : negative ? "left" : "right";
				event2.newLength = newLength;
				event2.newPosition = newElemOffset[side];
				elem.trigger(event2);
				if (!event2.isDefaultPrevented()) {
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
			if (opt.wasPositionStatic) elem.css("position", "static");
			elem.find(".ff-resizable-handle").remove();
			elem.off("disabledchange.resizable");
		});
	}

	registerPlugin("resizable", resizable, {
		remove: remove
	});
	$.fn.resizable.defaults = resizableDefaults;

	var selectableClass = "ff-selectable";

	// Defines default options for the selectable plugin.
	var selectableDefaults = {
		// Indicates whether multiple items can be selected. Default: false.
		multiple: false,

		// Indicates whether a single click toggles the selection of an item. Default: false.
		toggle: false,

		// Indicates whether the selection can be empty (only if multiple or toggle is true). Default: true.
		allowEmpty: true,

		// The separator for multi-select dropdown lists. Default: ", "
		separator: ", "
	};

	// Makes the child elements in each selected element selectable.
	function selectable(options) {
		return this.each$(function (_, elem) {
			if (elem.hasClass(selectableClass)) return; // Already done
			elem.addClass(selectableClass);
			var opt = initOptions("selectable", selectableDefaults, elem, {}, options);
			opt._prepareChild = prepareChild;
			opt._selectAll = selectAll;
			opt._selectNone = selectNone;
			opt._selectItem = selectItem;

			var replaceHtmlSelect = elem[0].nodeName === "SELECT";
			var useDropdown = replaceHtmlSelect && !elem.attr("size");
			var htmlSelect = void 0,
			    button = void 0;
			var htmlSelectChanging = void 0;
			var blurCloseTimeout = void 0;

			if (replaceHtmlSelect) {
				htmlSelect = elem;
				var origStyle = elem.attr("style");
				htmlSelect.hide();
				opt.multiple |= htmlSelect.attr("multiple") !== undefined;
				var newSelect = $("<div/>").addClass(selectableClass).insertAfter(htmlSelect);
				elem = newSelect;
				htmlSelect.data("ff-replacement", newSelect);
				updateFromHtmlSelect();
				if (useDropdown) {
					button = $("<div/>").addClass("ff-selectable-button").attr("tabindex", 0).insertAfter(htmlSelect);
					button.attr("style", origStyle);
					newSelect.addClass("no-border dropdown bordered");
					htmlSelect.data("ff-replacement", button);
					updateButton();
					button.click(function () {
						if (button.disabled()) return;
						button.addClass("open");
						var fixed = button.parentWhere(function (p) {
							return $(p).css("position") === "fixed";
						}).length > 0;
						var cssClass = "";
						if (button.closest(".dark").length > 0) cssClass = "dark"; // Set dropdown container to dark
						newSelect.dropdown(button, { fixed: fixed, cssClass: cssClass });
						newSelect.parent(".ff-dropdown-container").css("min-width", button.outerWidth());
					});
					newSelect.on("dropdownclose", function () {
						button.removeClass("open");
					});
					button.on("keydown", function (event) {
						//console.log(event);
						if (button.disabled()) return;
						switch (event.originalEvent.keyCode) {
							case 13: // Enter
							case 32:
								// Space
								event.preventDefault();
								button.click();
								break;
							case 35:
								// End
								event.preventDefault();
								changeSelectedIndex(elem.children().length, !!event.originalEvent.shiftKey && opt.multiple);
								break;
							case 36:
								// Home
								event.preventDefault();
								changeSelectedIndex(-elem.children().length, !!event.originalEvent.shiftKey && opt.multiple);
								break;
							case 38:
								// ArrowUp
								event.preventDefault();
								changeSelectedIndex(-1, !!event.originalEvent.shiftKey && opt.multiple);
								break;
							case 40:
								// ArrowDown
								event.preventDefault();
								changeSelectedIndex(1, !!event.originalEvent.shiftKey && opt.multiple);
								break;
							case 65:
								// KeyA
								if (!!event.originalEvent.ctrlKey && !event.originalEvent.shiftKey) {
									event.preventDefault();
									selectAll();
								}
								break;
							case 68:
								// KeyD
								if (!!event.originalEvent.ctrlKey && !event.originalEvent.shiftKey) {
									event.preventDefault();
									selectNone();
								}
								break;
						}
					});

					// Make the button unfocusable while it is disabled
					var onDisabledchange = function onDisabledchange() {
						if (button.disabled()) button.attr("tabindex", null);else button.attr("tabindex", 0);
					};
					button.on("disabledchange", onDisabledchange);
					onDisabledchange();

					// Close the dropdown when leaving the field with the Tab key
					// (but not when clicking into the dropdown)
					button.on("blur", function () {
						if (button.hasClass("open") && !blurCloseTimeout) {
							blurCloseTimeout = setTimeout(function () {
								newSelect.dropdown.close();
								blurCloseTimeout = undefined;
							}, 50);
						}
					});
					button.on("focus", function () {
						if (blurCloseTimeout) {
							// Clicked on an item, focused back; don't close the dropdown
							clearTimeout(blurCloseTimeout);
							blurCloseTimeout = undefined;
						}
					});
				}

				// Apply disabled property where appropriate
				if (htmlSelect.disabled()) {
					if (useDropdown) button.disable();else newSelect.disable();
				}

				// Copy some CSS classes to the replacement element (new list or button)
				["wrap", "input-validation-error"].forEach(function (clsName) {
					if (htmlSelect.hasClass(clsName)) htmlSelect.data("ff-replacement").addClass(clsName);
				});

				htmlSelect.change(function () {
					if (!htmlSelectChanging) {
						updateFromHtmlSelect();
						elem.children().each(prepareChild);
						lastClickedItem = elem.children(".selected").first();
						if (lastClickedItem.length === 0) lastClickedItem = elem.children(":not(.disabled)").first();
					}
					if (useDropdown) {
						updateButton();
					}
				});
			}

			elem.attr("tabindex", 0);
			elem.children().each(prepareChild);
			var lastClickedItem = elem.children(".selected").first();
			if (lastClickedItem.length === 0) lastClickedItem = elem.children(":not(.disabled)").first();
			var lastSelectedItem;

			elem.on("keydown", function (event) {
				//console.log(event);
				if (elem.disabled()) return;
				switch (event.originalEvent.keyCode) {
					case 35:
						// End
						event.preventDefault();
						changeSelectedIndex(elem.children().length, !!event.originalEvent.shiftKey && opt.multiple);
						break;
					case 36:
						// Home
						event.preventDefault();
						changeSelectedIndex(-elem.children().length, !!event.originalEvent.shiftKey && opt.multiple);
						break;
					case 38:
						// ArrowUp
						event.preventDefault();
						changeSelectedIndex(-1, !!event.originalEvent.shiftKey && opt.multiple);
						break;
					case 40:
						// ArrowDown
						event.preventDefault();
						changeSelectedIndex(1, !!event.originalEvent.shiftKey && opt.multiple);
						break;
					case 65:
						// KeyA
						if (!!event.originalEvent.ctrlKey && !event.originalEvent.shiftKey) {
							event.preventDefault();
							selectAll();
						}
						break;
					case 68:
						// KeyD
						if (!!event.originalEvent.ctrlKey && !event.originalEvent.shiftKey) {
							event.preventDefault();
							selectNone();
						}
						break;
				}
			});

			// Also don't close the dropdown if clicked on a disabled item or empty space (if there are no items)
			if (useDropdown) {
				var isMouseDown = false;
				elem.on("mousedown", function (event) {
					if (event.originalEvent.button === 0) {
						isMouseDown = true;
						setTimeout(function () {
							button.focus();
						}, 0);
					} else {
						isMouseDown = false;
					}
				});
				elem.on("mouseup", function (event) {
					if (!isMouseDown) return;
					isMouseDown = false;
					button.focus();
				});
			}

			// Sets up event handlers on a selection child (passed as this).
			function prepareChild() {
				var child = $(this);
				if (child.hasClass("disabled")) return;
				var isMouseDown = false;
				child.on("mousedown", function (event) {
					if (event.originalEvent.button === 0) {
						event.stopPropagation(); // No need to handle events on elem itself
						isMouseDown = true;
						setTimeout(function () {
							if (useDropdown) button.focus();else elem.focus();
						}, 0);
					} else {
						isMouseDown = false;
					}
				});
				child.on("mouseup", function (event) {
					if (!isMouseDown) return;
					event.stopPropagation(); // No need to handle events on elem itself
					isMouseDown = false;
					if (useDropdown) button.focus();else elem.focus();
					var ctrlKey = !!event.originalEvent.ctrlKey;
					var shiftKey = !!event.originalEvent.shiftKey;
					if (!opt.multiple) ctrlKey = shiftKey = false;
					if (opt.toggle) ctrlKey = true;
					var changed = false;
					if (ctrlKey) {
						child.toggleClass("selected");
						if (!opt.allowEmpty && elem.children(".selected").length === 0) {
							// Empty selection not allowed
							child.addClass("selected");
						} else {
							changed = true;
						}
						lastClickedItem = child;
					} else if (shiftKey) {
						var lastIndex = lastClickedItem.index();
						var currentIndex = child.index();
						// Bring indices in a defined order
						var i1 = Math.min(lastIndex, currentIndex);
						var i2 = Math.max(lastIndex, currentIndex);
						// Replace selection with all items between these indices (inclusive)
						elem.children().removeClass("selected");
						for (var i = i1; i <= i2; i++) {
							var c = elem.children().eq(i);
							if (!c.hasClass("disabled")) c.addClass("selected");
						}
						changed = true;
					} else {
						if (!child.hasClass("selected")) {
							elem.children().removeClass("selected");
							child.addClass("selected");
							changed = true;
						}
						lastClickedItem = child;
					}
					lastSelectedItem = child;
					if (changed) {
						elem.trigger("selectionchange");
					}

					if (replaceHtmlSelect) {
						updateHtmlSelect();
						if (useDropdown) {
							updateButton();
							if (!(opt.multiple || opt.toggle)) {
								elem.dropdown.close();
							}
						}
					}
				});
				if (useDropdown && opt.multiple && !opt.toggle) {
					child.on("dblclick", function (event) {
						var ctrlKey = !!event.originalEvent.ctrlKey;
						var shiftKey = !!event.originalEvent.shiftKey;
						if (!ctrlKey && !shiftKey) {
							elem.dropdown.close();
						}
					});
				}
			}

			// Updates the HTML select element's selection from the UI elements (selected CSS class).
			function updateHtmlSelect() {
				var selectedValues = [];
				elem.children().each$(function (_, child) {
					if (child.hasClass("selected")) selectedValues.push(child.data("value"));
				});

				htmlSelectChanging = true;
				htmlSelect.children("option").each$(function (_, option) {
					var selected = selectedValues.indexOf(option.prop("value")) !== -1;
					option.prop("selected", selected);
				});
				htmlSelect.change();
				htmlSelectChanging = false;
			}

			// Recreates the UI list elements from the HTML select options, including their selected
			// state.
			function updateFromHtmlSelect() {
				elem.children().remove();
				var haveOptions = false;
				htmlSelect.children("option").each$(function (_, option) {
					haveOptions = true;
					var newOption = $("<div/>").text(option.text()).data("value", option.prop("value")).appendTo(elem);
					if (option.data("html")) newOption.html(option.data("html"));
					if (option.data("summary")) newOption.data("summary", option.data("summary"));
					if (option.data("summary-html")) newOption.data("summary-html", option.data("summary-html"));
					if (option.prop("selected")) newOption.addClass("selected");
					if (option.prop("disabled")) newOption.addClass("disabled");
				});
				if (!haveOptions) elem.css("height", "4em");else elem.css("height", "");
			}

			// Updates the dropdown list button's text from the current selection.
			function updateButton() {
				var html = "";
				elem.children(".selected").each$(function (_, child) {
					if (html) html += opt.separator;
					var summaryText = child.data("summary");
					var summaryHtml = child.data("summary-html");
					if (summaryHtml) html += summaryHtml;else if (summaryText) html += summaryText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");else html += child.html();
				});
				if (html) {
					button.html("<span>" + html + "</span>");
				} else {
					button.html("&nbsp;");
				}
			}

			// Moves (and optionally extends) the selected index up or down.
			function changeSelectedIndex(offset, extend) {
				var children = elem.children();
				var count = children.length;
				if (count > 0 && offset !== 0) {
					var index = lastSelectedItem ? lastSelectedItem.index() : lastClickedItem.index();
					if (offset === -1 || offset === 1) {
						if (!lastClickedItem.hasClass("selected")) ;else {
							// Move selection until an enabled item was found
							do {
								index += offset;
								if (index < 0 || index >= count) return; // Nothing found
							} while (children.eq(index).hasClass("disabled"));
						}
					} else if (offset < 0) {
						// Move selection to the first enabled item
						index = elem.children(":not(.disabled)").first().index();
					} else if (offset > 0) {
						// Move selection to the last enabled item
						index = elem.children(":not(.disabled)").last().index();
					}
					if (index === -1) return; // Nothing found

					children.removeClass("selected");
					if (extend) {
						var lastIndex = lastClickedItem.index();
						// Bring indices in a defined order
						var i1 = Math.min(lastIndex, index);
						var i2 = Math.max(lastIndex, index);
						// Replace selection with all items between these indices (inclusive)
						for (var i = i1; i <= i2; i++) {
							var c = children.eq(i);
							if (!c.hasClass("disabled")) c.addClass("selected");
						}
						lastSelectedItem = children.eq(index);
					} else {
						lastClickedItem = children.eq(index);
						lastClickedItem.addClass("selected");
						lastSelectedItem = lastClickedItem;
					}
					if (replaceHtmlSelect) updateHtmlSelect();
				}
			}

			// Selects all items, if allowed.
			function selectAll() {
				if (opt.multiple || opt.toggle) {
					elem.children(":not(.disabled)").addClass("selected");
					if (replaceHtmlSelect) updateHtmlSelect();
				}
			}

			// Deselects all items, if allowed.
			function selectNone() {
				if (opt.allowEmpty) {
					elem.children().removeClass("selected");
					if (replaceHtmlSelect) updateHtmlSelect();
				}
			}

			// Selects a single item.
			function selectItem(item) {
				elem.children().removeClass("selected");
				item.addClass("selected");
				elem.trigger("selectionchange");
				if (replaceHtmlSelect) updateHtmlSelect();
			}
		});
	}

	// Notifies the selectable plugin about a new child that needs to be initialized.
	function addChild$1(child) {
		var selectable = $(this);
		var opt = loadOptions("selectable", selectable);
		opt._prepareChild.call(child);
		// TODO: Need to update HTML select, too?
	}

	// Notifies the selectable plugin about a removed child that may affect the selection.
	function removeChild(child) {
		var selectable = $(this);
		if (child.hasClass("selected")) {
			selectable.trigger("selectionchange");
		}
		// TODO: Need to update HTML select, too?
	}

	// Returns the currently selected elements.
	function getSelection() {
		var selectable = $(this);
		return selectable.children(".selected");
	}

	// Selects all items, if allowed.
	function selectAll() {
		var selectable = $(this);
		var opt = loadOptions("selectable", selectable);
		opt._selectAll();
	}

	// Deselects all items, if allowed.
	function selectNone() {
		var selectable = $(this);
		var opt = loadOptions("selectable", selectable);
		opt._selectNone();
	}

	// Selects a single item.
	function selectItem(item) {
		var selectable = $(this);
		var opt = loadOptions("selectable", selectable);
		opt._selectItem(item);
	}

	registerPlugin("selectable", selectable, {
		addChild: addChild$1,
		removeChild: removeChild,
		getSelection: getSelection,
		selectAll: selectAll,
		selectNone: selectNone,
		selectItem: selectItem
	});
	$.fn.selectable.defaults = selectableDefaults;

	var sliderClass = "ff-slider";
	var backgroundClass = "ff-background";
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

		// Hide ranges when the end is less than the start. Default: false.
		hideWrapping: false,

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
		return this.each$(function (_, slider) {
			if (slider.hasClass(sliderClass)) return; // Already done
			slider.addClass(sliderClass);
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

			$("<div/>").addClass(backgroundClass).appendTo(slider);

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
					console.warn("Clicked slider handle not found");
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
						$("html").addClass(resetAllCursorsClass); // All browsers (set cursor at least within page)
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
						$("html").removeClass(resetAllCursorsClass);
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
						if (start < opt.min) start = opt.min;
						if (start > opt.max) start = opt.max;

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
						if (end < opt.min) end = opt.min;
						if (end > opt.max) end = opt.max;

						var startPos = getPosFromValue(start);
						var endPos = getPosFromValue(end);
						var overflowEqual = rangeItem.overflowEqual || startHandleIndex !== undefined && endHandleIndex !== undefined && endHandleIndex < startHandleIndex;
						setRange(rangeIndex, startPos, endPos, overflowEqual, opt.hideWrapping);
					});
				} else if (opt.handleCount === 1) {
					if (pos < rangeBasePos) setRange(0, pos, rangeBasePos, false, opt.hideWrapping);else setRange(0, rangeBasePos, pos, false, opt.hideWrapping);
				} else if (opt.handleCount === 2) {
					var pos0 = index === 0 ? pos : getPosFromValue(opt.values[0]);
					var pos1 = index === 1 ? pos : getPosFromValue(opt.values[1]);
					setRange(0, pos0, pos1, opt.rangeOverflowEqual, opt.hideWrapping);
				}
			}

			// Sets the size of a range element for a start and end value, supporting overflow.
			function setRange(index, start, end, overflowEqual, hideWrapping) {
				if (start < end || start === end && !overflowEqual) {
					// Only one contiguous range, hide the second element
					ranges[index * 2].css(startAttr, start + "%");
					ranges[index * 2].css(endAttr, 100 - end + "%");
					ranges[index * 2 + 1].css(startAttr, "0%");
					ranges[index * 2 + 1].css(endAttr, "100%");
				} else if (!hideWrapping) {
					// Overflow range, split in two elements from either end of the slider
					ranges[index * 2].css(startAttr, "0%");
					ranges[index * 2].css(endAttr, 100 - end + "%");
					ranges[index * 2 + 1].css(startAttr, start + "%");
					ranges[index * 2 + 1].css(endAttr, "0%");
				} else {
					// Overflow range, hidden
					ranges[index * 2].css(startAttr, start + "%");
					ranges[index * 2].css(endAttr, 100 - start + "%");
					ranges[index * 2 + 1].css(startAttr, "0%");
					ranges[index * 2 + 1].css(endAttr, "100%");
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
			if (slider.length === 0) return; // Nothing to do
			var opt = loadOptions("slider", slider);
			return opt.values[index];
		}

		// Setter
		return this.each$(function (_, slider) {
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
		return this.each$(function (_, elem) {
			if (elem.hasClass(sortableClass)) return; // Already done
			elem.addClass(sortableClass);
			var opt = initOptions("sortable", sortableDefaults, elem, {}, options);
			opt._prepareChild = prepareChild;

			// Remove text nodes between children which cause layout issues when dragging
			elem.contents().filter(function () {
				return this.nodeType === 3;
			}).remove();

			var isVertical = isBlockDisplay(elem.firstChild().css("display"));
			var flowStart = isVertical ? "top" : "left";
			var flowEnd = isVertical ? "bottom" : "right";
			var crossStart = isVertical ? "left" : "top";
			var crossEnd = isVertical ? "right" : "bottom";

			elem.children().each(prepareChild);

			function prepareChild() {
				var child = $(this);
				var placeholder, initialChildAfterElement, placeholderAfterElement, betweenChildren, initialChildIndex;
				var stack = opt.stack;
				if (stack === true) stack = elem.children();

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
					initialChildIndex = child.index();

					var rect = child.rect();

					// Fix the size of table row cells while dragging
					if (child[0].nodeName === "TR") {
						child.closest("table").find("tr").first().children("td, th").each$(function (_, obj) {
							obj.data("width-before-drag", obj[0].style.width || "");
							obj.css("width", obj.outerWidth());
						});
						child.children("td, th").each$(function (_, obj) {
							obj.css("width", obj.outerWidth());
						});
						child.css("min-width", child.outerWidth() + 1);
					}

					// Create the placeholder element that will take the place of the dragged element
					placeholder = $("<" + child[0].nodeName + "/>").addClass(child[0].className).addClass(sortablePlaceholderClass).text("\xa0").css({ width: rect.width, height: rect.height });
					if (child[0].nodeName === "TR") {
						var colCount = child.children("td, th").map(function (td) {
							return $(td).attr("colspan") || 1;
						}).get() // Convert jQuery array to Array
						.reduce(function (a, b) {
							return a + b;
						});
						placeholder.append($("<td/>").attr("colspan", colCount));
					}

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
							if (!newPlaceholderAfterElement) placeholder.detach().insertBefore(elem.firstChild());else placeholder.detach().insertAfter(newPlaceholderAfterElement);
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
						child.closest("table").find("tr").first().children("td, th").each$(function (_, obj) {
							obj.css("width", obj.data("width-before-drag"));
							obj.data("width-before-drag", null);
						});
						child.children("td, th").each$(function (_, obj) {
							obj.css("width", "");
						});
						child.css("width", "");
					}

					var event2 = $.Event("sortableend");
					event2.initialIndex = initialChildIndex;
					event2.newIndex = child.index();
					event2.after = placeholderAfterElement;
					child.trigger(event2);
					if (event2.isDefaultPrevented()) {
						if (!initialChildAfterElement) child.detach().insertBefore(elem.firstChild());else child.detach().insertAfter(initialChildAfterElement);
					}
					initialChildAfterElement = undefined;
				});

				function updateChildren() {
					betweenChildren = [];
					var rowElements = [];
					var rowMin,
					    rowMax,
					    currentPos,
					    childElem = null;
					elem.children().each(function (_, obj) {
						if (obj !== child[0]) {
							var rect = $(obj).rect();
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

							if (obj !== placeholder[0]) childElem = obj;
							rowElements.push({ elem: childElem, rect: rect });
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

	var tabHeadersClass = "ff-tab-headers";
	var tabPagesClass = "ff-tab-pages";

	// Defines default options for the tabs plugin.
	var tabsDefaults = {};

	// Converts all div elements in each selected element into tab pages.
	// The tab page headers are read from the div elements' title attribute.
	function tabs(options) {
		return this.each$(function (_, container) {
			if (container.children("div." + tabHeadersClass).length !== 0) return; // Already done
			var opt = initOptions("tabs", tabsDefaults, container, {}, options);
			opt._addTab = addTab;

			var pageDivs = container.children("div");
			var activePage = pageDivs.filter(".active").first();
			var headers = $("<div/>").addClass(tabHeadersClass).appendTo(container);
			var pages = $("<div/>").addClass(tabPagesClass).appendTo(container);
			pageDivs.each(addTab);

			function addTab() {
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
			}
		});
	}

	// Adds a new tab page and header from a page div element.
	//
	// page: The new tab page to add. It does not have to be added to the DOM yet.
	function addTab(page) {
		var tabs = $(this);
		var opt = loadOptions("tabs", tabs);
		opt._addTab.call(page);
	}

	// Removes a tab page and header.
	//
	// indexOrPage: The tab page to remove, either by index or the page.
	function removeTab(indexOrPage) {
		var container = $(this);
		var headers = container.children("div." + tabHeadersClass).first();
		var pages = container.find("div." + tabPagesClass).first();
		var index = indexOrPage;
		if (!$.isNumeric(indexOrPage)) {
			index = indexOrPage.index();
		}
		var count = pages.children().length;
		var header = headers.children().eq(index);
		var page = pages.children().eq(index);
		header.remove();
		page.remove();
		if (page.hasClass("active")) {
			// Activate another tab
			var newIndex = Math.min(index, count - 2);
			if (newIndex >= 0) container.tabs.activeTab(newIndex);
		}
	}

	// Gets the title of a tab page in a tab container.
	//
	// indexOrPage: The tab page, either by index or the page.
	// title: Sets the title.
	function title(indexOrPage, title) {
		var container = $(this);
		var headers = container.children("div." + tabHeadersClass).first();
		var index = indexOrPage;
		if (!$.isNumeric(indexOrPage)) {
			index = indexOrPage.index();
		}
		var header = headers.children().eq(index);

		// Getter
		if (title === undefined) {
			return header.text();
		}

		// Setter
		header.text(title);
	}

	// Gets the active page in a tab container.
	//
	// indexOrPage: Sets the active page in each selected tab container, either by index or the page.
	function activeTab(indexOrPage) {
		// Getter
		if (indexOrPage === undefined) {
			return this.find("div." + tabPagesClass + " > .active").first();
		}

		// Setter
		return this.each$(function (_, container) {
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

	// Gets all page div elements.
	function pages() {
		var container = $(this);
		var pages = container.find("div." + tabPagesClass).first();
		return pages.children();
	}

	// Moves a tab to another position.
	function moveTab(indexOrPage, newIndex) {
		var container = $(this);
		var headers = container.children("div." + tabHeadersClass).first();
		var pages = container.find("div." + tabPagesClass).first();
		var index = indexOrPage;
		if (!$.isNumeric(indexOrPage)) {
			index = indexOrPage.index();
		}
		var headersChildren = headers.children();
		var pagesChildren = pages.children();
		pagesChildren.length;
		var header = headersChildren.eq(index);
		var page = pagesChildren.eq(index);
		var destHeader = headersChildren.eq(newIndex);
		var destPage = pagesChildren.eq(newIndex);
		if (destHeader.length === 0) {
			if (newIndex > 0) {
				// Move to end
				header.insertAfter(headersChildren.last());
				page.insertAfter(pagesChildren.last());
			} else {
				// Move to beginning
				header.insertBefore(headersChildren.first());
				page.insertBefore(pagesChildren.first());
			}
		} else if (newIndex > index) {
			// Move after newIndex
			header.insertAfter(destHeader);
			page.insertAfter(destPage);
		} else if (newIndex < index) {
			// Move before newIndex
			header.insertBefore(destHeader);
			page.insertBefore(destPage);
		}
	}

	registerPlugin("tabs", tabs, {
		addTab: addTab,
		removeTab: removeTab,
		title: title,
		activeTab: activeTab,
		pages: pages,
		moveTab: moveTab
	});
	$.fn.tabs.defaults = tabsDefaults;

	// Encoding: UTF-8 without BOM (auto-detect: °°°°°) for built-in message texts

	var inputWrapperClass = "ff-input-wrapper";

	// Defines default options for the timePicker plugin.
	var timePickerDefaults = {
		// The locale used for formats and text translations. Default: Auto.
		localeCode: undefined,

		// A function that changes the format of a month item. Default: None.
		monthFormatter: undefined,

		// A function that changes the format of a day item. Default: None.
		dayFormatter: undefined,

		// Indicates whether the ISO date and time format is used instead of the local format. Default: false.
		isoFormat: false,

		// The separator between date and time for ISO format. Default: Comma and space. Can be set to "T".
		isoFormatSeparator: ", "
	};

	// Converts each selected date/time input element into a masked text field with time picker button.
	function timePicker(options) {
		return this.each$(function (_, input) {
			if (input.parent().hasClass(inputWrapperClass)) return; // Already done
			var opt = initOptions("timePicker", timePickerDefaults, input, {}, options);
			var originalType = input.attr("type").trim().toLowerCase();
			var dateSelection = originalType === "date" || originalType === "datetime-local" || originalType === "month" || originalType === "week";
			var weekSelection = originalType === "week";
			var daySelection = originalType === "date" || originalType === "datetime-local";
			var timeSelection = originalType === "datetime-local" || originalType === "time";
			var step = +input.attr("step") || (timeSelection ? 60 : 1);
			var minuteSelection = timeSelection && step < 3600;
			var secondSelection = timeSelection && step < 60;
			var required = input.prop("required");
			input.prop("required", false); // We have no way to show a browser-generated message on the original hidden and new readonly field

			// Put a wrapper between the input and its parent
			var wrapper = $("<div/>").addClass(inputWrapperClass).attr("style", input.attr("style"));
			input.before(wrapper).appendTo(wrapper);

			// Hide original input and add a new one, synchronise (and convert) values
			input.hide();
			input.attr("autocomplete", "off");
			var inputChanging = false;
			var isKeyboardMode = false;
			var newInput = $("<input/>").attr("type", "text").prop("readonly", true).attr("inputmode", "none").attr("enterkeyhint", "done") // Enter key is handled separately to close dropdown/keyboard but prevent submit
			.attr("autocapitalize", "off").attr("autocomplete", "off").attr("autocorrect", "off").attr("spellcheck", "false").insertAfter(input);
			input.data("ff-replacement", newInput);
			// Copy some CSS classes to the replacement element
			["input-validation-error"].forEach(function (clsName) {
				if (input.hasClass(clsName)) newInput.addClass(clsName);
			});

			newInput.change(function () {
				inputChanging = true;
				input.valChange(getValue());
				inputChanging = false;
				validate();
				updateViews();
			});
			input.change(function () {
				if (!inputChanging) {
					setValue(input.val());
					newInput.trigger("input").change();
				}
			});

			newInput.on("copy", function (event) {
				if (event.originalEvent.clipboardData) {
					event.originalEvent.clipboardData.setData("text/plain", newInput.val());
					event.preventDefault();
				}
			});
			newInput.on("paste", function (event) {
				event.preventDefault();
				if (event.originalEvent.clipboardData) {
					var text = event.originalEvent.clipboardData.getData("text");
					var pattern = "";
					var matchParts = [];
					for (var i = 0; i < parts.length; i++) {
						if (parts[i].name) {
							if (parts[i].options) {
								pattern += "(" + parts[i].options.map(function (o) {
									return regExpEscape(o);
								}).join("|") + ")";
							} else {
								pattern += "([0-9]{1," + parts[i].length + "})";
							}
							matchParts.push(parts[i]);
						} else {
							pattern += regExpEscape(parts[i].text);
						}
					}
					var re = new RegExp("^" + pattern + "$");
					var match = re.exec(text);
					var newPartData = {};
					if (match) {
						for (var _i4 = 0; _i4 < matchParts.length; _i4++) {
							var value = +match[_i4 + 1];
							if (isNaN(value)) {
								value = matchParts[_i4].options.indexOf(match[_i4 + 1]) + matchParts[_i4].min;
							}
							if (value < matchParts[_i4].min || value > matchParts[_i4].max) return; // Invalid value
							newPartData[matchParts[_i4].name] = value;
						}
						partData = newPartData;
						input.val(getValue()); // Update native field for validation/fixing
						fixValue(true);
						updateText();
						newInput.trigger("input").change();
					}
				}
			});

			// Chromium sources: https://github.com/chromium/chromium/tree/master/third_party/blink/public/strings/translations
			// "en" is the fallback and must be complete.
			var dictionary = {
				cs: { y: "rrrr", month: "Měsíc", week1: null, week2: ". týden, ", w: "tt", today: "Dnes", now: "Teď", back: "Zpátky", keyboard: "Klávesnice", clear: "Smazat" },
				da: { y: "åååå", month: "Måned", week1: "Uge ", w: "uu", today: "I dag", now: "Nu", back: "Tilbage", keyboard: "Tastatur", clear: "Slette" },
				de: { y: "jjjj", month: "Monat", week1: "Woche ", w: "ww", d: "tt", today: "Heute", now: "Jetzt", back: "Zurück", keyboard: "Tastatur", clear: "Löschen" },
				en: { y: "yyyy", month: "Month", mo: "mm", week1: "Week ", week2: ", ", w: "ww", d: "dd", today: "Today", now: "Now", back: "Back", keyboard: "Keyboard", clear: "Clear" },
				es: { y: "aaaa", month: "Mes", week1: "Semana ", w: "ss", today: "Hoy", now: "Ahora", back: "Atrás", keyboard: "Teclado", clear: "Borrar" },
				fi: { y: "vvvv", month: "Kuukausi", mo: "kk", week1: "Viikko ", w: "vv", d: "pp", today: "Tänään", now: "Nyt", back: "Takaisin", keyboard: "Näppäimistö", clear: "Poistaa" },
				fr: { y: "aaaa", month: "Mois", week1: "Semaine ", w: "ss", d: "jj", today: "Aujourd’hui", now: "Maintenant", back: "Retour", keyboard: "Clavier", clear: "Supprimer" },
				hu: { y: "éééé", month: "Hónap", mo: "hh", week1: null, week2: ". hét, ", w: "hh", d: "nn", today: "Ma", now: "Most", back: "Vissza", keyboard: "Billentyűzet", clear: "Töröl" },
				is: { y: "áááá", month: "Mánuður", week1: "Vika ", w: "vv", today: "Í dag", now: "Núna", back: "Aftur", keyboard: "Lyklaborð", clear: "Eyðing" },
				it: { y: "aaaa", month: "Mese", week1: "Settimana ", w: "ss", d: "gg", today: "Oggi", now: "Ora", back: "Indietro", keyboard: "Tastiera", clear: "Cancellare" },
				nl: { y: "jjjj", month: "Maand", week1: "Week ", w: "ww", today: "Vandaag", now: "Nu", back: "Terug", keyboard: "Toetsenbord", clear: "Wissen" },
				no: { y: "åååå", month: "Måned", week1: "Uke ", w: "uu", today: "I dag", now: "Nå", back: "Tilbake", keyboard: "Tastatur", clear: "Slette" },
				pt: { y: "aaaa", month: "Mês", week1: "Semana ", week2: ", de ", w: "ss", today: "Hoje", now: "Agora", back: "De volta", keyboard: "Teclado", clear: "Cancelar" },
				ro: { y: "aaaa", month: "Lună", mo: "ll", week1: "Săptămâna ", w: "ss", d: "zz", today: "Astăzi", now: "Acum", back: "Înapoi", keyboard: "Tastatură", clear: "Șterge" },
				sk: { y: "rrrr", month: "Mesiac", week1: null, week2: ". týždeň, ", w: "tt", today: "Dnes", now: "Teraz", back: "Späť", keyboard: "Klávesnica", clear: "Vymazať" },
				sl: { y: "llll", month: "Mesec", week1: null, week2: ". teden, ", w: "tt", today: "Danes", now: "Zdaj", back: "Nazaj", keyboard: "Tipkovnica", clear: "Izbrisati" },
				sv: { y: "åååå", month: "Månad", week1: "Vecka ", week2: " ", w: "vv", today: "Idag", now: "Nu", back: "Tillbaka", keyboard: "Tangentbord", clear: "Radera" }
			};

			function translate(key) {
				if (key in dictionary[language]) return dictionary[language][key];
				return dictionary.en[key];
			}

			function fixValue(noChangeEvent) {
				var isComplete = true;
				for (var i = 0; i < parts.length; i++) {
					if (parts[i].name && !$.isSet(partData[parts[i].name])) {
						isComplete = false;
						break;
					}
				}
				if (isComplete && !input.val()) {
					// All values set but no valid value available
					if (weekSelection) {
						var part = findPart("w");
						if (part) partData.w = getPartMax(part);
					} else {
						var _part = findPart("d");
						if (_part) partData.d = getPartMax(_part);
					}
					if (!noChangeEvent) {
						updateText();
						newInput.trigger("input").change();
					}
				}
			}

			function validate() {
				if (required) {
					if (input.val()) newInput.attr("pattern", null);else newInput.attr("pattern", "^invalid$");
				}
			}

			validate();

			// Create picker dropdown
			var dropdown = $("<div/>").addClass("dropdown bordered");

			// Set up masked edit
			var formatOptions = {
				calendar: "gregory",
				numberingSystem: "latn"
			};
			if (dateSelection && !weekSelection) {
				if (daySelection) {
					formatOptions.day = "numeric";
					formatOptions.month = "numeric";
				} else {
					formatOptions.month = "long";
				}
				formatOptions.year = "numeric";
			}
			if (timeSelection) {
				formatOptions.hour = "numeric";
				formatOptions.hour12 = false; // TODO: Add 12h clock support; detect from format part "dayPeriod"
				if (minuteSelection) {
					formatOptions.minute = "numeric";
					if (secondSelection) {
						formatOptions.second = "numeric";
					}
				}
			}
			var format = new Intl.DateTimeFormat(opt.localeCode, formatOptions);
			var formatResolvedOptions = format.resolvedOptions();
			//console.log(formatResolvedOptions);
			var language = formatResolvedOptions.locale.split("-")[0];
			// All data and text parts of the masked input
			var parts = [];
			if (!weekSelection) {
				if (opt.isoFormat) {
					if (dateSelection) {
						parts.push({ name: "y", min: 1, max: 9999, length: 4, placeholder: translate("y") });
						parts.push({ text: "-" });
						parts.push({ name: "mo", min: 1, max: 12, length: 2, placeholder: translate("mo") });
						if (daySelection) {
							parts.push({ text: "-" });
							parts.push({ name: "d", min: 1, max: 31, length: 2, placeholder: translate("d") });
						}
					}
					if (timeSelection) {
						if (dateSelection) parts.push({ text: opt.isoFormatSeparator });
						parts.push({ name: "h", min: 0, max: 23, length: 2 });
						if (minuteSelection) {
							parts.push({ text: ":" });
							parts.push({ name: "min", min: 0, max: 59, length: 2 });
							if (secondSelection) {
								parts.push({ text: ":" });
								parts.push({ name: "s", min: 0, max: 59, length: 2 });
							}
						}
					}
				} else {
					var formatParts = format.formatToParts(new Date());
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = formatParts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var f = _step.value;

							switch (f.type) {
								case "literal":
									parts.push({ text: f.value });break;
								case "year":
									parts.push({ name: "y", min: 1, max: 9999, length: 4, placeholder: translate("y") });break;
								case "month":
									if (formatOptions.month === "numeric") {
										parts.push({ name: "mo", min: 1, max: 12, length: 2, placeholder: translate("mo") });
									} else {
										// Collect all localised month names
										var monthFormat = new Intl.DateTimeFormat(opt.localeCode, { month: "long" });
										var monthNames = [];
										for (var m = 0; m < 12; m++) {
											monthNames.push(monthFormat.format(new Date(2000, m, 1)));
										}parts.push({ name: "mo", min: 1, max: 12, length: 4, options: monthNames, placeholder: translate("month") });
									}
									break;
								case "day":
									parts.push({ name: "d", min: 1, max: 31, length: 2, placeholder: translate("d") });break;
								case "hour":
									parts.push({ name: "h", min: 0, max: 23, length: 2 });break;
								case "minute":
									parts.push({ name: "min", min: 0, max: 59, length: 2 });break;
								case "second":
									parts.push({ name: "s", min: 0, max: 59, length: 2 });break;
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				}
			} else {
				if (translate("week1")) parts.push({ text: translate("week1") });
				parts.push({ name: "w", min: 1, max: 53, length: 2, placeholder: translate("w") });
				if (translate("week2")) parts.push({ text: translate("week2") });
				parts.push({ name: "y", min: 1, max: 9999, length: 4, placeholder: translate("y") });
			}
			/*
   if (dateSelection && !weekSelection) {
   	if (daySelection) {
   		parts.push({ name: "d", min: 1, max: 31, length: 2, placeholder: "tt" });
   		parts.push({ text: "." });
   		parts.push({ name: "mo", min: 1, max: 12, length: 2, placeholder: "mm" });
   		parts.push({ text: "." });
   	}
   	else {
   		parts.push({ name: "mo", min: 1, max: 12, options: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"], length: 4, placeholder: "mmmm" });
   		parts.push({ text: " " });
   	}
   	parts.push({ name: "y", min: 1, max: 9999, length: 4, placeholder: "jjjj" });
   	if (timeSelection) {
   		parts.push({ text: ", " });
   	}
   }
   if (weekSelection) {
   	parts.push({ text: "Woche " });
   	parts.push({ name: "w", min: 1, max: 53, length: 2, placeholder: "ww" });
   	parts.push({ text: ", " });
   	parts.push({ name: "y", min: 1, max: 9999, length: 4, placeholder: "jjjj" });
   }
   if (timeSelection) {
   	parts.push({ name: "h", min: 0, max: 23, length: 2 });
   	if (minuteSelection) {
   		parts.push({ text: ":" });
   		parts.push({ name: "min", min: 0, max: 59, length: 2 });
   		if (secondSelection) {
   			parts.push({ text: ":" });
   			parts.push({ name: "s", min: 0, max: 59, length: 2 });
   		}
   	}
   }
   */
			// The index of the selected data part (text part indices are invalid)
			var selectedPart = -1;
			for (var i = 0; i < parts.length; i++) {
				if (parts[i].name) {
					selectedPart = i;
					break;
				}
			}
			// Indicates whether further input is appended to the current part
			// (Set to false when the part is entered, to overwrite the current value with new input;
			// set to true on the first input event in a part)
			var appendInput = false;
			// The number of typed digits in the selected data part
			var inputLength = 0;
			// The values for each data part
			var partData = {};
			// Collecting characters for an options lookup input in the current field
			var optionSearch;
			// An active timeout to restart the options search
			var optionSearchTimeout;

			function findPart(name) {
				for (var _i5 = 0; _i5 < parts.length; _i5++) {
					if (parts[_i5].name === name) return parts[_i5];
				}
				return null;
			}

			function findGreaterPartName(name) {
				switch (name) {
					case "mo":
						return "y";
					case "w":
						return "y";
					case "d":
						return "mo";
					case "h":
						return "d";
					case "min":
						return "h";
					case "s":
						return "min";
					default:
						return null;
				}
			}

			function selectPart(name) {
				for (var _i6 = 0; _i6 < parts.length; _i6++) {
					if (parts[_i6].name === name) {
						selectedPart = _i6;
						appendInput = false;
						inputLength = 0;
						break;
					}
				}
			}

			function updateText() {
				var text = "";
				for (var _i7 = 0; _i7 < parts.length; _i7++) {
					var part = parts[_i7];
					if ($.isSet(part.text)) {
						text += part.text;
					} else if (part.name) {
						part.start = text.length;
						var value = partData[part.name];
						if ($.isSet(value)) {
							// Display value
							if (part.options) {
								text += part.options[value - part.min];
							} else {
								text += (value + "").padStart(part.length, "0");
							}
						} else {
							// Display placeholder or empty space
							if (part.placeholder) text += part.placeholder;else text += "-".repeat(part.length);
							//text += "\u2007".repeat(part.length);   // FIGURE SPACE
						}
						part.end = text.length;
					}
				}
				newInput.val(text);
				if (parts[selectedPart] && parts[selectedPart].end) {
					newInput[0].setSelectionRange(parts[selectedPart].start, parts[selectedPart][isFocused ? "end" : "start"]);
					// Setting a non-empty selection always shows the selection background, even if not
					// focused. To avoid this, when unfocused, only the selection start is set to
					// maintain the selected part.
				}
			}

			updateText();

			function getValue() {
				var value = "";
				if (dateSelection) {
					if (!$.isSet(partData.y)) return "";
					value += (partData.y + "").padStart(4, "0") + "-";
					if (weekSelection) {
						if (!$.isSet(partData.w)) return "";
						value += "W" + (partData.w + "").padStart(2, "0");
					} else {
						if (!$.isSet(partData.mo)) return "";
						value += (partData.mo + "").padStart(2, "0");
						if (daySelection) {
							if (!$.isSet(partData.d)) return "";
							value += "-" + (partData.d + "").padStart(2, "0");
						}
					}
				}
				if (timeSelection) {
					if (dateSelection) value += "T";
					if (!$.isSet(partData.h)) return "";
					if (!$.isSet(partData.min)) return "";
					value += (partData.h + "").padStart(2, "0") + ":" + (partData.min + "").padStart(2, "0");
					if (secondSelection) {
						if (!$.isSet(partData.s)) return "";
						value += ":" + (partData.s + "").padStart(2, "0");
					}
				}
				return value;
			}

			function setValue(value) {
				var match = void 0;
				partData = {};
				if (match = value.match(/^([0-9]+)-([0-9]+)(?:-([0-9]+)(?:T([0-9]+):([0-9]+)(?::([0-9]+)(?:.[0-9]+)?)?)?)?$/)) {
					partData.y = +match[1];
					partData.mo = +match[2];
					if (match[3]) partData.d = +match[3];
					if (match[4]) partData.h = +match[4];
					if (match[5]) partData.min = +match[5];
					if (match[6]) partData.s = +match[6];
					// Ignore (but accept) optional milliseconds
				} else if (match = value.match(/^([0-9]+):([0-9]+)(?::([0-9]+))?$/)) {
					partData.h = +match[1];
					partData.min = +match[2];
					if (match[3]) partData.s = +match[3];
				} else if (match = value.match(/^([0-9]+)-W([0-9]+)$/)) {
					partData.y = +match[1];
					partData.w = +match[2];
				}
				updateText();
				validate();
				cancelSearchTimeout();
			}

			// Add control buttons
			//var buttons = [];
			//var decButton = $("<button type='button'/>").addClass("button").appendTo(wrapper).attr("tabindex", "-1").text("\u2212");   // &minus;
			//buttons.push(decButton);
			//decButton.on("repeatclick", function () {
			//	changeValue(-1, 1);
			//});
			//decButton.repeatButton();
			//var incButton = $("<button type='button'/>").addClass("button").appendTo(wrapper).attr("tabindex", "-1").text("+");
			//buttons.push(incButton);
			//incButton.on("repeatclick", function () {
			//	changeValue(1, 1);
			//});
			//incButton.repeatButton();
			//bindInputButtonsDisabled(newInput, buttons);

			function changeValue(direction, count, partName) {
				var part = partName ? findPart(partName) : parts[selectedPart];
				if (part) {
					var value = partData[part.name];
					// TODO: Consider valid values as defined by step and min
					if ($.isSet(value)) {
						var backupPartData = $.extend({}, partData);
						while (count-- > 0) {
							var isOverflow = void 0;
							var myPart = part;
							do {
								partData[myPart.name] += direction;
								isOverflow = false;
								if (direction > 0 && partData[myPart.name] > getPartMax(myPart)) {
									isOverflow = true;
									partData[myPart.name] = getPartMin(myPart); // min of next overflow state
								} else if (direction < 0 && partData[myPart.name] < getPartMin(myPart)) {
									isOverflow = true;
									partData[myPart.name] = getPartMax(myPart, direction); // max of next overflow state
								}
								if (isOverflow) {
									myPart = findPart(findGreaterPartName(myPart.name));
									if (myPart && !$.isSet(partData[myPart.name])) isOverflow = false; // Incomplete data, don't overflow to next field
								}
							} while (myPart && isOverflow);
							if (isOverflow && dateSelection) {
								// No more space for the overflow, cancel entire change
								partData = backupPartData;
							}
						}
					} else {
						partData[part.name] = part[direction > 0 ? "min" : "max"];
					}
					updateText();
					cancelSearchTimeout();
					newInput.trigger("input").change();
					newInput[0].focus();
					appendInput = false;
					inputLength = 0;
				}
			}

			// Gets the minimum value of a part.
			// If nextLevelOffset is 1, the next-higher part is incremented by 1 to consider the
			// correct min value of the requested part.
			// nextLevelOffset can only be 0 or 1. Undefined is interpreted as 0.
			function getPartMin(part, nextLevelOffset) {
				// TODO: Consider valid values as defined by min and max
				return part.min;
			}

			// Gets the maximum value of a part.
			// If nextLevelOffset is -1, the next-higher part is decremented by 1 to consider the
			// correct max value of the requested part.
			// nextLevelOffset can only be -1 or 0. Undefined is interpreted as 0.
			function getPartMax(part, nextLevelOffset) {
				// TODO: Consider valid values as defined by min and max
				if (part.name === "w") {
					var year = partData.y;
					if (year) {
						year += nextLevelOffset || 0;
						// A year has 53 weeks if it begins or ends on a Thursday
						// Source: https://de.wikipedia.org/wiki/Woche#Z%C3%A4hlweise_nach_ISO_8601
						// Algorithm to determine the weekday of the 1st January in a year (0 = Sun ... 6 = Sat)
						// Source: https://de.wikipedia.org/wiki/Gau%C3%9Fsche_Wochentagsformel
						// Simplification:
						// * A year that begins on a Thursday (= 4) has 53 weeks
						// * A year that ends on a Thursday (the next year begins on a Friday = 5) has 53 weeks
						// * Other years have 52 weeks
						var firstWeekday = function firstWeekday(year) {
							return (1 + 5 * ((year - 1) % 4) + 4 * ((year - 1) % 100) + 6 * ((year - 1) % 400)) % 7;
						};
						if (firstWeekday(year) !== 4 && firstWeekday(year + 1) !== 5) return 52;
					}
					return part.max;
				}
				if (part.name === "d") {
					var month = partData.mo;
					if (month) {
						month += nextLevelOffset || 0;
						if (month === 0) month = 12;
						var _year = partData.y;
						return getDaysInMonth(month, _year);
					}
					return part.max;
				}
				return part.max;
			}

			// Focus and selection events
			var isFocused = false;
			var blurCloseTimeout;
			newInput.focus(function () {
				//console.log("newInput.focus:", newInput[0]);
				isFocused = true;
				setTimeout(fixSelection, 0);
				if (blurCloseTimeout) {
					// Clicked on an item, focused back; don't close the dropdown
					clearTimeout(blurCloseTimeout);
					blurCloseTimeout = undefined;
				}
			});
			newInput.blur(function () {
				//console.log("newInput.blur:", newInput[0]);
				isFocused = false;
				cancelSearchTimeout();
				newInput.prop("readonly", true).attr("inputmode", "none");
				isKeyboardMode = false;
				if (!newInput.hasClass("open")) fixValue();
				// Close the dropdown when leaving the field with the Tab key
				// (but not when clicking an item in the dropdown)
				// DEBUG: disable following code to allow inspecting the dropdown contents
				if (newInput.hasClass("open") && !blurCloseTimeout) {
					blurCloseTimeout = setTimeout(function () {
						dropdown.dropdown.close();
						blurCloseTimeout = undefined;
					}, 50);
				}
			});
			newInput.on("mousedown mouseup", function (event) {
				//console.log("newInput." + event.type);
				cancelSearchTimeout();
				setTimeout(fixSelection, 0);
			});
			newInput.click(function () {
				//console.log("newInput.click");
				if (newInput.disabled()) return;
				if (!isKeyboardMode && !newInput.hasClass("open")) {
					// Select useful part if no data is set
					if (daySelection && !partData.d) {
						selectPart("d");
						updateText();
					} else if (weekSelection && !partData.w) {
						selectPart("w");
						updateText();
					} else if (timeSelection && !$.isSet(partData.h)) {
						selectPart("h");
						updateText();
					}
					openDropdown();
				}
			});
			var separatorChars = [".", ":", "-", "/", ","];
			newInput.keydown(function (event) {
				//console.log("keydown: keyCode:", event.keyCode, event);
				//alert("keyCode: " + event.keyCode + ", key: " + event.originalEvent.key);
				var keyCode = event.keyCode;
				if (event.keyCode === 13) {
					// Enter
					event.preventDefault();
					dropdown.dropdown.close();
					newInput.prop("readonly", true).attr("inputmode", "none");
					isKeyboardMode = false;
				}
				if (event.keyCode === 27) {
					// Esc
					event.preventDefault();
					dropdown.dropdown.close();
				}
				if (event.keyCode === 32) {
					// Space
					event.preventDefault();
					if (!newInput.hasClass("open")) openDropdown();else dropdown.dropdown.close();
				} else if (keyCode === 37) {
					// Left
					event.preventDefault();
					prevPart();
					updateText();
					cancelSearchTimeout();
				} else if (keyCode === 39) {
					// Right
					event.preventDefault();
					nextPart();
					updateText();
					cancelSearchTimeout();
				} else if (keyCode === 38) {
					// Up
					event.preventDefault();
					changeValue(1, 1);
				} else if (keyCode === 40) {
					// Down
					event.preventDefault();
					changeValue(-1, 1);
				} else if (keyCode === 33) {
					// PageUp
					event.preventDefault();
					changeValue(1, getPartLargeStep());
				} else if (keyCode === 34) {
					// PageDown
					event.preventDefault();
					changeValue(-1, getPartLargeStep());
				} else if (keyCode === 8 || keyCode === 46) {
					// Backspace, Del
					event.preventDefault();
					if (!required) {
						delete partData[parts[selectedPart].name];
						updateText();
						newInput.trigger("input").change();
					}
					cancelSearchTimeout();
				} else if (keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105) {
					// 0-9, Num0-Num9
					event.preventDefault();
					var digit = event.keyCode;
					if (digit >= 96) digit -= 96 - 48;
					digit -= 48;
					var part = parts[selectedPart];
					var value = partData[part.name];
					if ($.isSet(value) && appendInput) {
						value = value * 10 + digit;
						if (value > getPartMax(part)) value = digit;
					} else {
						value = digit;
					}
					appendInput = true;
					inputLength++;
					partData[part.name] = value;
					// Skip to next part if the value is complete
					if (inputLength >= part.length && value >= part.min || value * 10 > getPartMax(part)) {
						nextPart();
					}
					updateText();
					cancelSearchTimeout();
					newInput.trigger("input").change();
				} else if (separatorChars.indexOf(event.originalEvent.key) !== -1) {
					// Separator
					event.preventDefault();
					if (appendInput) {
						nextPart();
						updateText();
					}
					cancelSearchTimeout();
				} else if (event.originalEvent.key.length === 1 && !event.originalEvent.altKey && !event.originalEvent.ctrlKey) {
					// Other char
					event.preventDefault();
					if (!appendInput) optionSearch = "";
					optionSearch += event.originalEvent.key.toLowerCase();
					appendInput = true;
					inputLength++;
					//console.log("optionSearch:", optionSearch);
					var _part2 = parts[selectedPart];
					if (_part2.options) {
						for (var _i8 = 0; _i8 < _part2.options.length; _i8++) {
							if (_part2.options[_i8].toLowerCase().startsWith(optionSearch)) {
								partData[_part2.name] = _i8 + _part2.min;
								updateText();
								break;
							}
						}
					}
					startSearchTimeout();
				} else {
					// Whatever it was, reset the text
					updateText();
					newInput.trigger("input").change();
				}
			});
			newInput.on("input", function (event) {
				if (event.originalEvent) {
					// Something was typed in, reset the text
					// (Generated input events have no originalEvent)
					if (separatorChars.indexOf(event.originalEvent.data) !== -1) {
						// Separator (for Chrome/Android: https://crbug.com/118639)
						if (appendInput) {
							nextPart();
						}
						cancelSearchTimeout();
					}
					updateText();
					newInput.trigger("input").change();
				}
			});

			function startSearchTimeout() {
				if (!optionSearchTimeout) {
					optionSearchTimeout = setTimeout(function () {
						appendInput = false;
						inputLength = 0;
						optionSearchTimeout = null;
						optionSearch = "";
					}, 2000);
				}
			}

			function cancelSearchTimeout() {
				if (optionSearchTimeout) {
					clearTimeout(optionSearchTimeout);
					optionSearchTimeout = null;
					optionSearch = "";
				}
			}

			function getPartLargeStep() {
				switch (parts[selectedPart].name) {
					case "y":
						return 10;
					case "mo":
						return 3;
					case "d":
						return 7;
					case "h":
						return 12;
					case "min":
						return 15;
					case "s":
						return 15;
					default:
						return 1;
				}
			}

			function prevPart() {
				//console.log("selectedPart:", selectedPart);
				for (var _i9 = selectedPart - 1; _i9 >= 0; _i9--) {
					if (parts[_i9].name) {
						selectedPart = _i9;
						//console.log("new selectedPart:", selectedPart);
						appendInput = false;
						inputLength = 0;
						updateViewVisibilities();
						break;
					}
				}
			}

			function nextPart() {
				//console.log("selectedPart:", selectedPart);
				for (var _i10 = selectedPart + 1; _i10 < parts.length; _i10++) {
					if (parts[_i10].name) {
						selectedPart = _i10;
						//console.log("new selectedPart:", selectedPart);
						appendInput = false;
						inputLength = 0;
						updateViewVisibilities();
						break;
					}
				}
			}

			function fixSelection() {
				var selStart = newInput[0].selectionStart;
				//console.log("selectionStart:", selStart);
				for (var _i11 = 0; _i11 < parts.length; _i11++) {
					var part = parts[_i11];
					if (part.name && selStart <= part.end) {
						selectedPart = _i11;
						//console.log("New selected part:", i);
						appendInput = false;
						inputLength = 0;
						updateViewVisibilities();
						if (isFocused) newInput[0].setSelectionRange(part.start, part.end);
						break;
					}
				}
			}

			// Load initial value
			setValue(input.val());

			// Create dropdown contents
			var dropdownInner = $("<div/>").addClass("ff-timepicker").appendTo(dropdown);
			var dropdownButtons = $("<div/>").addClass("ff-timepicker-buttons").appendTo(dropdownInner);

			var boxSize = { width: 280, height: 240 };
			if (!dateSelection) boxSize.width = boxSize.height; // No need for space for longer month names
			var dropdownContent = $("<div/>").addClass("ff-timepicker-content").css("width", boxSize.width).css("height", boxSize.height).appendTo(dropdownInner);
			var darkMode = dropdown.parent().hasClass("dark");

			var updateHandler = function updateHandler() {
				updateText();
				newInput.trigger("input").change();
			};

			var yearView = void 0;
			var monthView = void 0;
			var clockHourView = void 0;
			var clockMinuteView = void 0;
			var clockSecondView = void 0;
			if (dateSelection) {
				yearView = new YearView(dropdownContent, boxSize, darkMode, opt, translate, weekSelection, function () {
					return partData;
				}, changeValue, updateHandler, function () {
					if (daySelection) {
						selectPart("d");
						updateText();
						yearView.hide();
						monthView.show();
					} else if (weekSelection) {
						// Convert month selection to week selection
						// (Keep selected week if the month matches)
						if (partData.w < getWeekData(new Date(partData.y, partData.mo - 1, 1)).w || partData.w > getWeekData(new Date(partData.y, partData.mo, 0)).w) {
							var weekData = getWeekData(new Date(partData.y, partData.mo - 1, 4)); // Thursday
							delete partData.mo;
							partData.y = weekData.y;
							partData.w = weekData.w;
						}
						selectPart("w");
						updateText();
						monthView.update();
						yearView.hide();
						monthView.show();
					} else {
						dropdown.dropdown.close();
					}
				});
				monthView = new MonthView(dropdownContent, boxSize, darkMode, opt, translate, weekSelection ? "w" : "d", function () {
					return partData;
				}, changeValue, updateHandler, function () {
					if (timeSelection) {
						selectPart("h");
						updateText();
						monthView.hide();
						clockHourView.show();
					} else {
						dropdown.dropdown.close();
					}
				});
				opt._updateMonthView = function () {
					return monthView.update(true);
				};
			}
			if (timeSelection) {
				clockHourView = new ClockView(dropdownContent, boxSize, darkMode, translate, "h", function () {
					return partData;
				}, changeValue, updateHandler, function () {
					if (minuteSelection) {
						selectPart("min");
						updateText();
						clockHourView.hide();
						clockMinuteView.show();
					} else {
						dropdown.dropdown.close();
					}
				});
				if (minuteSelection) clockMinuteView = new ClockView(dropdownContent, boxSize, darkMode, translate, "min", function () {
					return partData;
				}, changeValue, updateHandler, function () {
					if (secondSelection) {
						selectPart("s");
						updateText();
						clockMinuteView.hide();
						clockSecondView.show();
					} else {
						dropdown.dropdown.close();
					}
				});
				if (secondSelection) clockSecondView = new ClockView(dropdownContent, boxSize, darkMode, translate, "s", function () {
					return partData;
				}, changeValue, updateHandler, function () {
					dropdown.dropdown.close();
				});
			}

			var backButton = $("<button type='button'/>").addClass("button narrow").html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin:-2px"><path d="M6,6L6,9.5L0,5L6,0.5L6,4L10,4C11.796,4 13.284,4.62 14.332,5.668C15.38,6.716 16,8.204 16,10C16,11.796 15.38,13.284 14.332,14.332C13.284,15.38 11.796,16 10,16L8,16L8,14L10,14C11.204,14 12.216,13.62 12.918,12.918C13.62,12.216 14,11.204 14,10C14,8.796 13.62,7.784 12.918,7.082C12.216,6.38 11.204,6 10,6L6,6Z"/></svg>').attr("title", translate("back")).appendTo(dropdownButtons).click(function (event) {
				selectPart(findGreaterPartName(parts[selectedPart].name));
				updateViewVisibilities();
				updateText();
				cancelSearchTimeout();
			});
			$("<button type='button'/>").addClass("button").text(timeSelection ? translate("now") : translate("today")).appendTo(dropdownButtons).click(setNow);
			$("<button type='button'/>").addClass("button narrow").html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin:-2px;fill-rule:evenodd;"><path d="M9,13L6,13L6,16L9,16L9,13ZM5,9L2,9L2,12L5,12L5,9ZM13,9L10,9L10,12L13,12L13,9ZM9,9L6,9L6,12L9,12L9,9ZM5,5L2,5L2,8L5,8L5,5ZM9,5L6,5L6,8L9,8L9,5ZM13,5L10,5L10,8L13,8L13,5ZM5,1L2,1L2,4L5,4L5,1ZM9,1L6,1L6,4L9,4L9,1ZM13,1L10,1L10,4L13,4L13,1Z"/></svg>').attr("title", translate("keyboard")).appendTo(dropdownButtons).click(function (event) {
				isKeyboardMode = true;
				dropdown.dropdown.close();
				newInput.prop("readonly", false).attr("inputmode", "decimal");
				// https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
			});
			if (!required) {
				$("<button type='button'/>").addClass("button narrow").html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin:-2px;fill-rule:evenodd;"><path d="M0.293,8L6.293,14L16,14L16,2L6.293,2L0.293,8ZM6.707,3L1.707,8L6.707,13L15,13L15,3L6.707,3ZM10,7.293L12.646,4.646L13.354,5.354L10.707,8L13.354,10.646L12.646,11.354L10,8.707L7.354,11.354L6.646,10.646L9.293,8L6.646,5.354L7.354,4.646L10,7.293Z"/></svg>').attr("title", translate("clear")).appendTo(dropdownButtons).click(function (event) {
					dropdown.dropdown.close();
					setValue("");
					newInput.trigger("input").change();
				});
				dropdownButtons.addClass("four-buttons");
			}

			function updateViewVisibilities() {
				backButton.enable();
				switch (parts[selectedPart].name) {
					case "y":
					case "mo":
						yearView && yearView.show();
						monthView && monthView.hide();
						clockHourView && clockHourView.hide();
						clockMinuteView && clockMinuteView.hide();
						clockSecondView && clockSecondView.hide();
						backButton.disable();
						break;
					case "w":
					case "d":
						yearView && yearView.hideReverse();
						monthView && monthView.show();
						clockHourView && clockHourView.hide();
						clockMinuteView && clockMinuteView.hide();
						clockSecondView && clockSecondView.hide();
						break;
					case "h":
						yearView && yearView.hideReverse();
						monthView && monthView.hideReverse();
						clockHourView && clockHourView.show();
						clockMinuteView && clockMinuteView.hide();
						clockSecondView && clockSecondView.hide();
						if (!dateSelection) backButton.disable();
						break;
					case "min":
						yearView && yearView.hideReverse();
						monthView && monthView.hideReverse();
						clockHourView && clockHourView.hideReverse();
						clockMinuteView && clockMinuteView.show();
						clockSecondView && clockSecondView.hide();
						break;
					case "s":
						yearView && yearView.hideReverse();
						monthView && monthView.hideReverse();
						clockHourView && clockHourView.hideReverse();
						clockMinuteView && clockMinuteView.hideReverse();
						clockSecondView && clockSecondView.show();
						break;
				}
			}

			function updateViews() {
				yearView && yearView.update();
				monthView && monthView.update();
				clockHourView && clockHourView.update();
				clockMinuteView && clockMinuteView.update();
				clockSecondView && clockSecondView.update();
			}

			function openDropdown() {
				updateViewVisibilities();
				updateViews();
				newInput.addClass("open");
				dropdown.dropdown(newInput, { autoClose: false });
				if (newInput.closest(".dark").length > 0) dropdown.parent().addClass("dark"); // Set dropdown container to dark
			}

			function setNow() {
				var now = new Date();
				if (weekSelection) {
					var weekData = getWeekData(now);
					partData.y = weekData.y;
					partData.w = weekData.w;
				} else if (dateSelection) {
					partData.y = now.getFullYear();
					partData.mo = now.getMonth() + 1;
				}
				if (daySelection) partData.d = now.getDate();
				if (timeSelection) partData.h = now.getHours();
				if (minuteSelection) partData.min = now.getMinutes();
				if (secondSelection) partData.s = now.getSeconds();
				updateText();
				newInput.trigger("input").change();
			}

			var isMouseDown = false;
			dropdown.on("mousedown", function (event) {
				if (event.originalEvent.button === 0) {
					isMouseDown = true;
					setTimeout(function () {
						newInput.focus();
					}, 0);
				} else {
					isMouseDown = false;
				}
			});
			dropdown.on("mouseup", function (event) {
				if (!isMouseDown) return;
				isMouseDown = false;
				newInput.focus();
			});
			dropdown.on("dropdownclose", function () {
				//console.log("dropdown.dropdownclose");
				newInput.removeClass("open");
				if (!isKeyboardMode) fixValue();
			});
		});
	}

	function YearView(container, boxSize, darkMode, opt, translate, weekSelection, partDataAccessor, changeValue, updateHandler, doneHandler) {
		var instance = this;

		var outerDiv = $("<div/>").addClass("ff-timepicker-year").appendTo(container);
		var innerDiv = $("<div/>").addClass("ff-timepicker-inner").addClass("hidden").appendTo(outerDiv);

		var headerHeight = 30;
		var monthHeight = (boxSize.height - headerHeight - 1 /* margin */) / 4;

		var header = $("<div/>").addClass("header").css("height", headerHeight).appendTo(innerDiv);
		var prevButton = $("<a/>").addClass("button narrow transparent").html('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><polyline fill="none" stroke-width="1.2" points="6,1 1,6 6,11"/></svg>').on("repeatclick", function (event) {
			event.preventDefault();
			ensureYear();
			changeValue(-1, 1, "y");
		}).appendTo(header);
		prevButton.repeatButton();
		var yearText = $("<span/>").appendTo(header);
		var nextButton = $("<a/>").addClass("button narrow transparent").html('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><polyline fill="none" stroke-width="1.2" points="1,1 6,6 1,11"/></svg>').on("repeatclick", function (event) {
			event.preventDefault();
			ensureYear();
			changeValue(1, 1, "y");
		}).appendTo(header);
		nextButton.repeatButton();

		function ensureYear() {
			var partData = partDataAccessor();
			var now = new Date();
			if (!partData.y) partData.y = now.getFullYear();
		}

		var months = $("<div/>").addClass("months").appendTo(innerDiv);
		var monthFormat = new Intl.DateTimeFormat(opt.localeCode, { month: "long" });

		instance.update = function () {
			var partData = partDataAccessor();

			var now = new Date();
			var year = partData.y || now.getFullYear();
			yearText.text((year + "").padStart(4, "0"));

			prevButton.disabled(partData.y === 1);
			nextButton.disabled(partData.y === 9999);

			months.children().remove();

			var _loop2 = function _loop2(n) {
				var item = $("<div/>").addClass("item").css("height", monthHeight).appendTo(months).click(function () {
					var partData = partDataAccessor();
					partData.mo = n;
					if (!$.isSet(partData.y)) partData.y = new Date().getFullYear();
					instance.update();
					updateHandler && updateHandler();
					doneHandler && doneHandler();
				});
				$("<span/>").text(monthFormat.format(new Date(2000, n - 1, 1))).appendTo(item);
				opt.monthFormatter && opt.monthFormatter(item, new Date(year, n - 1, 1));
			};

			for (var n = 1; n <= 12; n++) {
				_loop2(n);
			}

			// Update week numbers
			if (weekSelection) {
				months.find(".item").each$(function (n, item) {
					item.children().eq(1).remove();
					$("<span/>").addClass("week-numbers").text(translate("w").substring(0, 1).toUpperCase() + " " + getWeekData(new Date(year, n, 1)).w + '\u202F\u2013\u202F' + getWeekData(new Date(year, n + 1, 0)).w) // NNBSP
					.appendTo(item);
				});
			}

			// Set current month as "selected"
			months.find(".item").removeClass("selected now");
			if ($.isSet(partData.mo)) {
				months.find(".item").eq(partData.mo - 1).addClass("selected");
			}
			if (now.getFullYear() === year) {
				months.find(".item").eq(now.getMonth()).addClass("now");
			}
		};

		instance.show = function () {
			innerDiv.removeClass("hidden hidden-reverse");
		};

		instance.hide = function () {
			innerDiv.addClass("hidden");
			innerDiv.removeClass("hidden-reverse");
		};

		instance.hideReverse = function () {
			innerDiv.addClass("hidden-reverse");
			innerDiv.removeClass("hidden");
		};

		instance.update();
	}

	function MonthView(container, boxSize, darkMode, opt, translate, partName, partDataAccessor, changeValue, updateHandler, doneHandler) {
		var instance = this;

		var outerDiv = $("<div/>").addClass("ff-timepicker-month").appendTo(container);
		var innerDiv = $("<div/>").addClass("ff-timepicker-inner").addClass("hidden").appendTo(outerDiv);

		var headerHeight = 30;
		var weekdayHeight = 20;
		var dayHeight = (boxSize.height - headerHeight - 1 /* margin */ - weekdayHeight) / 6;
		var skipWeeksFwd = void 0,
		    skipWeeksRev = void 0;

		var header = $("<div/>").addClass("header").css("height", headerHeight).appendTo(innerDiv);
		var prevButton = $("<a/>").addClass("button narrow transparent").html('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><polyline fill="none" stroke-width="1.2" points="6,1 1,6 6,11"/></svg>').on("repeatclick", function (event) {
			event.preventDefault();
			if (partName === "d") {
				ensureYearMonth();
				changeValue(-1, 1, "mo");
			} else {
				ensureYearWeek();
				changeValue(-1, skipWeeksRev, "w");
			}
		}).appendTo(header);
		prevButton.repeatButton();
		var monthText = $("<span/>").appendTo(header);
		var nextButton = $("<a/>").addClass("button narrow transparent").html('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><polyline fill="none" stroke-width="1.2" points="1,1 6,6 1,11"/></svg>').on("repeatclick", function (event) {
			event.preventDefault();
			if (partName === "d") {
				ensureYearMonth();
				changeValue(1, 1, "mo");
			} else {
				ensureYearWeek();
				changeValue(1, skipWeeksFwd, "w");
			}
		}).appendTo(header);
		nextButton.repeatButton();

		function ensureYearMonth() {
			var partData = partDataAccessor();
			var now = new Date();
			if (!partData.mo) partData.mo = now.getMonth() + 1;
			if (!partData.y) partData.y = now.getFullYear();
		}

		function ensureYearWeek() {
			var partData = partDataAccessor();
			var now = new Date();
			var weekData = getWeekData(now);
			if (!partData.w || !partData.y) {
				partData.w = weekData.w;
				partData.y = weekData.y;
			}
		}

		var dayFormat = new Intl.DateTimeFormat(opt.localeCode, { weekday: "short" });
		var weekdays = $("<div/>").addClass("weekdays").appendTo(innerDiv);
		for (var n = 1; n <= 7; n++) {
			$("<div/>").css("height", weekdayHeight).text(dayFormat.format(new Date(2018, 0, n)).toUpperCase()).appendTo(weekdays);
		}

		var weeks = $("<div/>").addClass("weeks").addClass(partName === "d" ? "day-selection" : "week-selection").appendTo(innerDiv);
		var monthFormat = new Intl.DateTimeFormat(opt.localeCode, { month: "long" });

		var displayedYear = void 0,
		    displayedMonth = void 0,
		    prevMonthFirstDay = void 0;

		instance.update = function (force) {
			var partData = partDataAccessor();

			var now = new Date();
			var year = partData.y || now.getFullYear();
			var month = partData.mo || now.getMonth() + 1;
			if (partName === "w" && partData.w) {
				// Find month that contains the selected week
				var date = new Date(year, 1, 1);
				while (date.getDay() !== 4) {
					// Thursday
					date.setDate(date.getDate() + 1);
				}while (partData.w !== getWeekData(date).w) {
					date.setDate(date.getDate() + 7);
				}month = date.getMonth() + 1;

				skipWeeksFwd = 4;
				date = new Date(year, month - 1, 1);
				if (getDaysInMonth(month, year) + (date.getDay() === 0 ? 7 : date.getDay()) >= 36) // Found by try&analyse
					skipWeeksFwd++;

				skipWeeksRev = 4;
				date = new Date(year, month - 2, 1);
				if (getDaysInMonth(month - 1, year) + (date.getDay() === 0 ? 7 : date.getDay()) >= 36) skipWeeksRev++;
			}

			monthText.text(monthFormat.format(new Date(year, month - 1, 1)) + " " + (year + "").padStart(4, "0"));

			prevButton.disabled(year === 1 && month === 1);
			nextButton.disabled(year === 9999 && month === 12);

			if (force || year !== displayedYear || month !== displayedMonth) {
				// Recreate days for the selected month
				weeks.children().remove();
				var maxDay = getDaysInMonth(month, year);
				var _date = new Date(year, month - 1, 1);
				var dayOfWeek = _date.getDay(); // 0 = Sun ... 6 = Sat
				if (dayOfWeek === 0) dayOfWeek = 7; // 1 = Mon ... 7 = Sun
				var maxDayPrevMonth = getDaysInMonth(month === 1 ? 12 : month - 1, year);
				prevMonthFirstDay = maxDayPrevMonth - (dayOfWeek - 2);
				var days = addWeek(_date);
				var daysCount = 0;

				var _loop3 = function _loop3(_n) {
					if (days.children(".item").length === 7) {
						_date.setDate(_date.getDate() + 7);
						days = addWeek(_date);
					}
					var item = $("<div/>").addClass("item prev-month").css("height", dayHeight).appendTo(days);
					if (partName === "d" && (month > 1 || year > 1)) {
						item.click(function () {
							var partData = partDataAccessor();
							partData.d = _n;
							partData.mo = month - 1;
							partData.y = year;
							if (partData.mo === 0) {
								partData.mo = 12;
								partData.y = year - 1;
							}
							instance.update();
							updateHandler && updateHandler();
							doneHandler && doneHandler();
						});
					}
					if (month > 1 || year > 1) {
						$("<span/>").text(_n).appendTo(item);
					} else {
						item.disable();
					}
					opt.dayFormatter && opt.dayFormatter(item, new Date(year, month - 2, _n));
					daysCount++;
				};

				for (var _n = prevMonthFirstDay; _n <= maxDayPrevMonth; _n++) {
					_loop3(_n);
				}

				var _loop4 = function _loop4(_n2) {
					if (days.children(".item").length === 7) {
						_date.setDate(_date.getDate() + 7);
						days = addWeek(_date);
					}
					var item = $("<div/>").addClass("item day").css("height", dayHeight).appendTo(days);
					if (partName === "d") {
						item.click(function () {
							var partData = partDataAccessor();
							partData.d = _n2;
							partData.mo = month;
							partData.y = year;
							instance.update();
							updateHandler && updateHandler();
							doneHandler && doneHandler();
						});
					}
					$("<span/>").text(_n2).appendTo(item);
					opt.dayFormatter && opt.dayFormatter(item, new Date(year, month - 1, _n2));
					daysCount++;
				};

				for (var _n2 = 1; _n2 <= maxDay; _n2++) {
					_loop4(_n2);
				}

				var _loop5 = function _loop5(_n3) {
					if (days.children(".item").length === 7) {
						_date.setDate(_date.getDate() + 7);
						days = addWeek(_date);
					}
					var item = $("<div/>").addClass("item next-month").css("height", dayHeight).appendTo(days);
					if (partName === "d" && (month < 12 || year < 9999)) {
						item.click(function () {
							var partData = partDataAccessor();
							partData.d = _n3;
							partData.mo = month + 1;
							partData.y = year;
							if (partData.mo === 13) {
								partData.mo = 1;
								partData.y = year + 1;
							}
							instance.update();
							updateHandler && updateHandler();
							doneHandler && doneHandler();
						});
					}
					if (month < 12 || year < 9999) {
						$("<span/>").text(_n3).appendTo(item);
					} else {
						item.disable();
					}
					opt.dayFormatter && opt.dayFormatter(item, new Date(year, month, _n3));
				};

				for (var _n3 = 1; _n3 <= 6 * 7 - daysCount; _n3++) {
					_loop5(_n3);
				}

				displayedYear = year;
				displayedMonth = month;
			}

			function addWeek(date) {
				var weekData = getWeekData(date);
				var week = $("<div/>").addClass("days").data("week", weekData.w).data("year", weekData.y).appendTo(weeks).append($("<div/>").addClass("week-number").append($("<span/>").text(weekData.w)));
				if (partName === "w") {
					week.click(function () {
						var partData = partDataAccessor();
						partData.w = weekData.w;
						partData.y = weekData.y;
						instance.update();
						updateHandler && updateHandler();
						doneHandler && doneHandler();
					});
				}
				return week;
			}

			// Set current day as "selected"
			if (partName === "d") {
				weeks.find(".item").removeClass("selected");
				if ($.isSet(partData.d)) {
					weeks.find(".item.day").eq(partData.d - 1).addClass("selected");
				}
			} else {
				weeks.children().removeClass("selected");
				if ($.isSet(partData.w)) {
					weeks.children().each$(function (_, week) {
						if (week.data("week") == partData.w) week.addClass("selected");
					});
				}
			}

			// Mark today
			weeks.find(".item").removeClass("now");
			if (now.getFullYear() === year && now.getMonth() === month - 1) {
				weeks.find(".item.day").eq(now.getDate() - 1).addClass("now");
			} else {
				var nowYearMonth = now.getFullYear() * 12 + now.getMonth();
				var yearMonth = year * 12 + month - 1;
				if (nowYearMonth === yearMonth - 1 && now.getDate() >= prevMonthFirstDay) {
					weeks.find(".item.prev-month").eq(now.getDate() - prevMonthFirstDay).addClass("now");
				} else if (nowYearMonth === yearMonth + 1 && now.getDate() <= 14) {
					weeks.find(".item.next-month").eq(now.getDate() - 1).addClass("now");
				}
			}
		};

		instance.show = function () {
			innerDiv.removeClass("hidden hidden-reverse");
		};

		instance.hide = function () {
			innerDiv.addClass("hidden");
			innerDiv.removeClass("hidden-reverse");
		};

		instance.hideReverse = function () {
			innerDiv.addClass("hidden-reverse");
			innerDiv.removeClass("hidden");
		};

		instance.update();
	}

	function ClockView(container, boxSize, darkMode, translate, partName, partDataAccessor, changeValue, updateHandler, doneHandler) {
		var instance = this;

		var padding = 10;
		var clockOuter = $("<div/>").addClass("ff-timepicker-clock").css("padding", padding + "px " + ((boxSize.width - boxSize.height) / 2 + padding) + "px").appendTo(container);
		var clockSize = boxSize.height - 2 * padding;
		var clockInner = $("<div/>").addClass("ff-timepicker-inner").addClass("hidden").css("width", clockSize).css("height", clockSize).appendTo(clockOuter);
		var itemSize = 32;
		var outerRadius = clockSize / 2 - itemSize / 2 - 5;
		var innerRadius = clockSize * 0.32 - itemSize / 2;
		if (partName === "h") {
			for (var n = 1; n <= 24; n++) {
				var radius = n <= 12 ? outerRadius : innerRadius;
				var top = clockSize / 2 - Math.cos(n / 12 * 2 * Math.PI) * radius - itemSize / 2;
				var left = clockSize / 2 + Math.sin(n / 12 * 2 * Math.PI) * radius - itemSize / 2;
				var _item = $("<span/>").css("top", top).css("left", left).appendTo(clockInner);
				$("<span/>").text(n % 24).appendTo(_item);
				if (n > 12) _item.addClass("inner-circle");
			}
		} else {
			for (var _n4 = 0; _n4 < 60; _n4 += 5) {
				var _top = clockSize / 2 - Math.cos(_n4 / 60 * 2 * Math.PI) * outerRadius - itemSize / 2;
				var _left = clockSize / 2 + Math.sin(_n4 / 60 * 2 * Math.PI) * outerRadius - itemSize / 2;
				var _item2 = $("<span/>").css("top", _top).css("left", _left).appendTo(clockInner);
				$("<span/>").text(_n4).appendTo(_item2);
			}
		}
		clockInner.children().addClass("item").css("width", itemSize).css("height", itemSize);

		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		clockInner.append(svg);
		var centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
		centerCircle.setAttribute("class", "clock-center-cirle");
		centerCircle.setAttribute("cx", clockSize / 2);
		centerCircle.setAttribute("cy", clockSize / 2);
		centerCircle.setAttribute("rx", 3.5);
		centerCircle.setAttribute("ry", 3.5);
		svg.appendChild(centerCircle);
		var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line.setAttribute("class", "clock-hour-line");
		line.setAttribute("visibility", "hidden");
		line.setAttribute("x1", clockSize / 2);
		line.setAttribute("y1", clockSize / 2);
		svg.appendChild(line);
		var extraItem = void 0,
		    line2 = void 0;
		if (partName !== "h") {
			line.setAttribute("class", "clock-minute-line");
			var backSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			clockInner.prepend(backSvg);
			extraItem = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
			extraItem.setAttribute("class", "clock-extra-item");
			extraItem.setAttribute("visibility", "hidden");
			extraItem.setAttribute("stroke-width", itemSize / 2 - 2);
			extraItem.setAttribute("rx", itemSize / 4 + 1);
			extraItem.setAttribute("ry", itemSize / 4 + 1);
			backSvg.appendChild(extraItem);
			line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line2.setAttribute("class", "clock-hour-line secondary");
			line2.setAttribute("visibility", "hidden");
			line2.setAttribute("x1", clockSize / 2);
			line2.setAttribute("y1", clockSize / 2);
			backSvg.appendChild(line2);
		}
		var draggable = $("<div/>").css("width", 0).css("height", 0) // draggable itself need not be seen or touchable
		.appendTo(clockInner);
		draggable.draggable({ catchElement: clockOuter });
		draggable.on("draggablemove", function (event) {
			// Compute angle and distance of draggable from centre
			var draggableRadius = draggable.outerWidth() / 2;
			var clockRect = clockInner.rect();
			var clockRadius = clockRect.width / 2;
			var angle = Math.atan2(event.newPoint.left + draggableRadius - (clockRect.left + clockRadius), clockRect.top + clockRadius - (event.newPoint.top + draggableRadius));
			var distance = Math.sqrt(Math.pow(event.newPoint.left + draggableRadius - (clockRect.left + clockRadius), 2) + Math.pow(event.newPoint.top + draggableRadius - (clockRect.top + clockRadius), 2));

			if (partName === "h") {
				// Closer to inner or outer hours circle?
				var isOuterCircle = distance > (innerRadius + outerRadius) / 2;

				// Determine nearest hour
				var angleDegree = (angle / 2 / Math.PI * 360 + 360) % 360; // rad to degrees
				var hour = Math.round(angleDegree / 360 * 12);
				hour = (hour + 11) % 12 + 1; // 0..11 → 1..12
				angleDegree = hour / 12 * 360;
				angle = angleDegree / 360 * 2 * Math.PI; // degrees to rad
				if (!isOuterCircle) hour = (hour + 12) % 24; // 1..12 → 13..0
				partDataAccessor()[partName] = hour;
				var _radius = isOuterCircle ? outerRadius : innerRadius;
				instance.update();
				updateHandler && updateHandler();

				// Calculate point for determined hour (not really displayed...)
				event.newPoint = {
					top: -Math.cos(angle) * _radius + clockRect.top + clockRadius - draggableRadius,
					left: Math.sin(angle) * _radius + clockRect.left + clockRadius - draggableRadius
				};
			} else {
				// Determine nearest minute/second
				var _angleDegree = (angle / 2 / Math.PI * 360 + 360) % 360; // rad to degrees
				var _n5 = Math.round(_angleDegree / 360 * 60) % 60; // 60 → 0
				_angleDegree = _n5 / 60 * 360;
				angle = _angleDegree / 360 * 2 * Math.PI; // degrees to rad
				var partData = partDataAccessor();
				if (partData[partName] >= 45 && _n5 <= 15) {
					// Increment next level
					changeValue(1, 1, partName === "s" ? "min" : "h");
				} else if (partData[partName] <= 15 && _n5 >= 45) {
					// Decrement next level
					changeValue(-1, 1, partName === "s" ? "min" : "h");
				}
				partData[partName] = _n5;
				instance.update();
				updateHandler && updateHandler();

				// Calculate point for determined minute/second (not really displayed...)
				event.newPoint = {
					top: -Math.cos(angle) * outerRadius + clockRect.top + clockRadius - draggableRadius,
					left: Math.sin(angle) * outerRadius + clockRect.left + clockRadius - draggableRadius
				};
			}
		});
		draggable.on("draggableend", function (event) {
			doneHandler && doneHandler();
		});

		instance.update = function () {
			var partData = partDataAccessor();

			if (partName === "h") {
				// Set current hour as "selected"
				clockInner.find(".item").removeClass("selected");
				if ($.isSet(partData[partName])) {
					// hour 1 → index 0 (first element), 2 → 1, 23 → 22, 0 → 23 (last element)
					clockInner.find(".item").eq((partData[partName] + 23) % 24).addClass("selected");
					// Move line to the edge of that item circle
					var clockRadius = clockSize / 2;
					var angle = partData[partName] / 12 * 2 * Math.PI; // rad
					var _radius2 = partData[partName] >= 1 && partData[partName] <= 12 ? outerRadius : innerRadius;
					_radius2 -= itemSize / 2 + 4; // only touch the item circle, don't go to its centre
					line.setAttribute("visibility", "visible");
					line.setAttribute("x2", Math.sin(angle) * _radius2 + clockRadius);
					line.setAttribute("y2", -Math.cos(angle) * _radius2 + clockRadius);
				} else {
					// Remove line
					line.setAttribute("visibility", "hidden");
					line.setAttribute("x2", clockSize / 2);
					line.setAttribute("y2", clockSize / 2);
				}
			} else {
				// Set current minute/second as "selected"
				clockInner.find(".item").removeClass("selected");
				if ($.isSet(partData[partName])) {
					if (partData[partName] % 5 === 0) clockInner.find(".item").eq(partData[partName] / 5).addClass("selected");
					// Move line to the edge of that item circle
					var _clockRadius = clockSize / 2;
					var _angle = partData[partName] / 60 * 2 * Math.PI; // rad
					var _radius3 = outerRadius - (itemSize / 2 + 4); // only touch the item circle, don't go to its centre
					line.setAttribute("visibility", "visible");
					line.setAttribute("x2", Math.sin(_angle) * _radius3 + _clockRadius);
					line.setAttribute("y2", -Math.cos(_angle) * _radius3 + _clockRadius);
					// Set extra item position
					if (partData[partName] % 5 !== 0) {
						extraItem.setAttribute("visibility", "visible");
						extraItem.setAttribute("cx", Math.sin(_angle) * outerRadius + _clockRadius);
						extraItem.setAttribute("cy", -Math.cos(_angle) * outerRadius + _clockRadius);
					} else {
						extraItem.setAttribute("visibility", "hidden");
					}

					if (partName === "min") {
						if ($.isSet(partData.h)) {
							// Set secondary (hour) line
							_angle = (partData.h + partData.min / 60) / 12 * 2 * Math.PI; // rad
							_radius3 *= 0.6;
							line2.setAttribute("visibility", "visible");
							line2.setAttribute("x2", Math.sin(_angle) * _radius3 + _clockRadius);
							line2.setAttribute("y2", -Math.cos(_angle) * _radius3 + _clockRadius);
						} else {
							// Remove secondary (hour) line
							line2.setAttribute("visibility", "hidden");
						}
					}
				} else {
					// Remove lines
					line.setAttribute("visibility", "hidden");
					line2.setAttribute("visibility", "hidden");
					// Remove extra item
					extraItem.setAttribute("visibility", "hidden");
				}
			}
		};

		instance.show = function () {
			clockInner.removeClass("hidden hidden-reverse");
		};

		instance.hide = function () {
			clockInner.addClass("hidden");
			clockInner.removeClass("hidden-reverse");
		};

		instance.hideReverse = function () {
			clockInner.addClass("hidden-reverse");
			clockInner.removeClass("hidden");
		};

		instance.update();
	}

	function getDaysInMonth(month, year) {
		if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
		if (month === 2) {
			if (year) {
				var leapYear = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
				return leapYear ? 29 : 28;
			}
			return 29;
		}
		return 31;
	}

	function getWeekData(date) {
		// Source: https://weeknumber.net/how-to/javascript
		var data = {};
		date = new Date(date.getTime());
		date.setHours(0, 0, 0, 0);
		// Thursday in current week decides the year
		date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
		data.y = date.getFullYear();
		// January 4 is always in week 1
		var week1 = new Date(date.getFullYear(), 0, 4);
		// Adjust to Thursday in week 1 and count number of weeks from date to week1
		data.w = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
		return data;
	}

	// Gets a function that changes the format of a month item.
	//
	// fn: Sets the function.
	function monthFormatter(fn) {
		// Getter
		if (fn === undefined) {
			var timePicker = this.first();
			if (timePicker.length === 0) return; // Nothing to do
			var opt = loadOptions("timePicker", timePicker);
			return opt.monthFormatter;
		}

		// Setter
		return this.each$(function (_, timePicker) {
			var opt = loadOptions("timePicker", timePicker);
			opt.monthFormatter = fn;
		});
	}

	// Gets a function that changes the format of a day item.
	//
	// fn: Sets the function.
	function dayFormatter(fn) {
		// Getter
		if (fn === undefined) {
			var timePicker = this.first();
			if (timePicker.length === 0) return; // Nothing to do
			var opt = loadOptions("timePicker", timePicker);
			return opt.dayFormatter;
		}

		// Setter
		return this.each$(function (_, timePicker) {
			var opt = loadOptions("timePicker", timePicker);
			opt.dayFormatter = fn;
			opt._updateMonthView && opt._updateMonthView();
		});
	}

	registerPlugin("timePicker", timePicker, {
		monthFormatter: monthFormatter,
		dayFormatter: dayFormatter
	});
	$.fn.timePicker.defaults = timePickerDefaults;

	// Automatically apply all controls now. Must be loaded at the end of the document.
	// Doing it now is faster than waiting for the DOM ready event, and when loaded at the end of the
	// document, all relevant DOM parts are already there.

	$.fn.frontfire = function (prefix) {
		if (prefix === undefined) prefix = "";
		var t = this;

		function findInclSelf(selector) {
			return t.find(selector).addBack(selector);
		}

		findInclSelf(prefix + ".accordion").accordion();
		findInclSelf(prefix + ".carousel").carousel();
		findInclSelf(prefix + ".gallery").gallery();
		// TODO: dropdown
		findInclSelf(prefix + "input[type=number]").spinner();
		findInclSelf(prefix + "input[type=checkbox].toggle-button").toggleButton();
		findInclSelf(prefix + "input[type=color]").colorPicker();
		// type=color has serious restrictions on acceptable values, ff-color is a workaround
		findInclSelf(prefix + "input[type=ff-color]").colorPicker();
		findInclSelf(prefix + "input[type=checkbox], input[type=radio]").styleCheckbox();
		findInclSelf(prefix + "input[type=checkbox].three-state").threeState();
		findInclSelf(prefix + "input[type=submit].submit-lock, button[type=submit].submit-lock").submitLock();
		findInclSelf(prefix + "input[type=date],input[type=datetime-local],input[type=month],input[type=time],input[type=week]").timePicker();
		findInclSelf(prefix + "textarea.auto-height").autoHeight();
		findInclSelf(prefix + ".menu").menu();
		findInclSelf(prefix + ".critical.closable, .error.closable, .warning.closable, .information.closable, .success.closable").closableMessage();
		// TODO: modal
		findInclSelf(prefix + ".progressbar").progressbar();
		findInclSelf(prefix + ".slider").slider();
		findInclSelf(prefix + ".sortable").sortable();
		findInclSelf(prefix + ".tabs").tabs();
		findInclSelf(prefix + ".selectable").selectable();
		findInclSelf(prefix + "select").selectable();

		// Duplicate all overlay texts to separate background and foreground opacity.
		// This effect cannot be achieved with a single element and rgba() background
		// because the semitransparent backgrounds of each text line overlap a bit and
		// reduce transparency in these areas. The line gap cannot be determined reliably
		// so a bit overlap is necessary to avoid empty space between the lines.
		findInclSelf(prefix + "div.image-overlay-text, " + prefix + "a.image-overlay-text").each$(function (_, el) {
			// Skip images (they're styled differently) and already marked elements
			el.children(":not(img):not(.ff-foreground-only):not(.ff-background-only)").each$(function (_, el) {
				// The second (duplicate) will show only the text.
				el.clone().addClass("ff-foreground-only").insertAfter(el);
				// The first (original) will show only the background and have a
				// fully opaque background, but the entire element's opacity is reduced.
				// Also exclude it from screen reading, one is enough.
				el.addClass("ff-background-only").attr("aria-hidden", "true");
			});
		});

		return this;
	};

	$(document).frontfire(":not(.no-autostart)");
})(jQuery, window, document);
//# sourceMappingURL=frontfire.bundle.js.map

//# sourceMappingURL=frontfire.es5.js.map