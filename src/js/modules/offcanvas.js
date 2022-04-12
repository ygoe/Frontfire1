import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";
import { dimBackground, undimBackground } from "../dimmer";

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
	if (offCanvas.length === 0) return this;   // Nothing to do
	if (offCanvas.hasClass(offCanvasClass)) return this;   // Already open
	var opt = initOptions("offCanvas", offCanvasDefaults, offCanvas, {}, options);

	offCanvas.addClass(offCanvasClass);
	offCanvas.detach().appendTo("body");

	if (["left", "right"].indexOf(opt.edge) === -1)
		opt.edge = "left";
	if (opt.edge === "left") opt._opposite = "right";
	else if (opt.edge === "right") opt._opposite = "left";

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
			if (event.keyCode === 27) {   // Escape
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
	if (offCanvas.length === 0) return this;   // Nothing to do
	if (!offCanvas.hasClass(offCanvasClass)) return this;   // offCanvas is not open
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
