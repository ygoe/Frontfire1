// Returns the value in the range between min and max.
export function minmax(value, min, max) {
	return Math.max(min, Math.min(value, max));
}

// Returns the value rounded to the specified number of decimals.
export function round(value, decimals) {
	if (decimals === undefined) decimals = 0;
	var precision = Math.pow(10, decimals);
	return Math.round(value * precision) / precision;
}

// Forces a browser layout reflow. This can be used to start CSS transitions on new elements.
export function forceReflow() {
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
function installHook(hooks, name, id, get, set) {
	// Explanation: https://blog.rodneyrehm.de/archives/11-jQuery-Hooks.html
	var hookInstalled = name in hooks &&
		"ffId" in hooks[name] &&
		hooks[name].ffId === id;
	if (!hookInstalled) {
		var prevHook = hooks[name];
		hooks[name] = {
			ffId: id,
			get: function (a, b, c) {
				if (get) {
					var result = get(a, b, c);
					if (result !== null)
						return result;
				}
				if (prevHook && prevHook.get)
					return prevHook.get(a, b, c);
				return null;
			},
			set: function (a, b, c) {
				if (set) {
					var result = set(a, b, c);
					if (result !== undefined)
						return result;
				}
				if (prevHook && prevHook.set)
					return prevHook.set(a, b, c);
			}
		};
	}
}

// Installs a hook that triggers the "disabledchange" event for input elements.
export function installDisabledchangeHook() {
	installHook(
		$.propHooks, "disabled", "disabledchange",
		undefined,
		function (elem, value, name) {
			if (elem.disabled !== value) {
				elem.disabled = value;   // Set before triggering change event
				$(elem).trigger("disabledchange");
			}
		});
}

// Binds the disabled state of the input element to the associated buttons.
export function bindInputButtonsDisabled(input, buttons) {
	// When the input element was disabled or enabled, also update other elements
	installDisabledchangeHook();
	var handler = function () {
		if (input.disabled()) {
			input.disable();   // Disable everything related as well (label etc.)
			buttons.forEach(button => button.disable());
		}
		else {
			input.enable();   // Enable everything related as well (label etc.)
			buttons.forEach(button => button.enable());
		}
	};
	input.on("disabledchange", handler);

	// Setup disabled state initially.
	// Also enable elements. If they were disabled and the page is reloaded, their state
	// may be restored halfway. This setup brings everything in the same state.
	handler();
}

// Scrolls the window so that the rectangle is fully visible.
export function scrollIntoView(rect) {
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
export function preventScrolling(state) {
	var $document = $(document), $html = $("html");
	if (state || state === undefined) {
		var scrollTop = $document.scrollTop();
		var scrollLeft = $document.scrollLeft();
		$document.on("scroll.ff-prevent-scrolling", function () {
			$document.scrollTop(scrollTop);
			$document.scrollLeft(scrollLeft);
		});
		$html.css("touch-action", "none");
	}
	else {
		$document.off("scroll.ff-prevent-scrolling");
		$html.css("touch-action", "");
	}
}

// Stacks the selected elements and moved one element to the top.
export function stackElements(stackedElems, topElem) {
	// Find all selected stackable elements and sort them by:
	//   currently dragging, then z-index, then DOM index
	// and assign their new z-index
	stackedElems = stackedElems
		.map(function (index, el) {
			var zIndex = parseInt($(el).css("z-index"));
			if (!$.isNumeric(zIndex))
				zIndex = stackedElems.length;
			return { elem: el, dragElem: el === topElem ? 1 : 0, index: index, zIndex: zIndex };
		})
		.sort(function (a, b) {
			if (a.dragElem !== b.dragElem) return a.dragElem - b.dragElem;
			if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
			return a.index - b.index;
		});
	if (stackedElems.length !== 0) {
		var maxZIndex = Math.max.apply(Math, stackedElems.toArray().map(o => o.zIndex));
		stackedElems.each(function (index, item) {
			$(item.elem).css("z-index", maxZIndex - (stackedElems.length - 1) + index);
		});
	}
}
