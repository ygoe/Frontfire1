import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow } from "../util";

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
		if (elem.hasClass(progressbarClass)) return;   // Already done
		elem.addClass(progressbarClass);
		var opt = initOptions("progressbar", progressbarDefaults, elem, {}, options);
		opt._setValue = setValue;

		let bar = $("<div/>")
			.addClass("ff-bar")
			.appendTo(elem);
		let number = $("<span/>")
			.appendTo(bar);
		setValue(opt.value);
		
		// Sets a progress bar value and triggers the change event.
		function setValue(value) {
			value = minmax(value, opt.min, opt.max);
			let relWidth = (value - opt.min) / (opt.max - opt.min);
			bar.css("width", (relWidth * 100) + "%");
			number.text(opt.valuePrefix + value + opt.valueSuffix);
			number.toggleClass("outside", number.width() + 8 > relWidth * elem.width());
			
			if (value !== opt.value) {
				opt.value = value;
				elem.triggerNative("valuechange");
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
		if (progressbar.length === 0) return;   // Nothing to do
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
		if (progressbar.length === 0) return;   // Nothing to do
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
		if (progressbar.length === 0) return;   // Nothing to do
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
