import { forceReflow } from "./util";

var backgroundDimmerClass = "ff-background-dimmer";
var dimmingClass = "ff-dimming";
var dimmedClass = "ff-dimmed";

var dimCount = 0;

// Dims the entire document by adding an overlay.
export function dimBackground(noinput) {
	dimCount++;
	if ($("body > div." + backgroundDimmerClass + ":not(.closing)").length !== 0) return;   // Already there
	$("body").addClass(dimmingClass).addClass(dimmedClass);
	var backgroundLayer = $("<div/>")
		.addClass(backgroundDimmerClass)
		.appendTo("body");
	noinput && backgroundLayer.addClass("noinput");
	forceReflow();
	backgroundLayer.css("opacity", "1");
}

// Removes the overlay from the document. The overlay is already click-through during its
// fade-out transition.
export function undimBackground() {
	var backgroundLayer = $("body > div." + backgroundDimmerClass);
	if (backgroundLayer.length === 0) return;   // Not there
	dimCount--;
	if (dimCount > 0) return false;   // Not the last one, keep it dimmed
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
	return true;
}
