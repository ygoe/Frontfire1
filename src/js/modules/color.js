import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

// This file uses its own scope to keep its helper functions private and make it reusable independently.
// There are a few places where jQuery is used but they can easily be replaced with DOM calls if necessary.
(function (undefined) {
	"use strict";

	// Parses any color value understood by a browser into an object with r, g, b, a properties.
	function Color(value) {
		// Allow calling without "new" keyword
		if (!(this instanceof Color))
			return new Color(value);

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
			this.r = (value >> 16) & 0xff;
			this.g = (value >> 8) & 0xff;
			this.b = value & 0xff;
			var a = (value >> 24) & 0xff;
			this.a = a !== 0 ? round(a / 255, 3) : 1;
			return;
		}

		if (typeof value === "object") {
			this.format = value.format !== undefined ? value.format : "Object";
			this.r = keep255(value.r);
			this.g = keep255(value.g);
			this.b = keep255(value.b);
			this.a = value.a !== undefined ? keep1(value.a) : 1;
			return;
		};

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
		if (this.a === undefined || this.a === 1)
			return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
		return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
	};

	// Formats a color object into an HTML hexadecimal string.
	Color_prototype.toHTML = function () {
		function conv(number) {
			return (number < 16 ? "0" : "") +
				round(keep255(number)).toString(16).toLowerCase();
		}

		var str = "#" + conv(this.r) + conv(this.g) + conv(this.b);
		if (this.a !== undefined && this.a !== 1) str += conv(this.a * 255);
		return str;
	};

	// Converts a color object into an integer number like 0xAARRGGBB.
	Color_prototype.toIntARGB = function () {
		return (this.a !== undefined ? round(keep1(this.a) * 255) : 255) << 24 |
			round(keep255(this.r)) << 16 |
			round(keep255(this.g)) << 8 |
			round(keep255(this.b));
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

		if (max === min)
			this.h = 0;
		else if (max === r)
			this.h = (60 * (g - b) / (max - min)) % 360;
		else if (max === g)
			this.h = (60 * (b - r) / (max - min) + 120) % 360;
		else // if (max === b)
			this.h = (60 * (r - g) / (max - min) + 240) % 360;
		if (this.h < 0)
			this.h += 360;

		this.s = 0;   // Just for the order of the properties
		this.l = (max + min) / 2;

		if (max === min)
			this.s = 0;
		else if (this.l <= 0.5)
			this.s = (max - min) / (2 * this.l);
		else
			this.s = (max - min) / (2 - 2 * this.l);
		return this;
	};

	// Calculates the RGB components from the HSL components in the color object.
	Color_prototype.updateRGB = function () {
		this.h = minmax(this.h, 0, 366);
		this.s = keep1(this.s);
		this.l = keep1(this.l);

		var q = this.l < 0.5 ?
			this.l * (1 + this.s) :
			this.l + this.s - this.l * this.s;
		var p = 2 * this.l - q;
		var h = this.h / 360;   // Normalise hue to 0..1
		var t = { r: h + 1 / 3, g: h, b: h - 1 / 3 };

		var that = this;
		["r", "g", "b"].forEach(function (c) {
			if (t[c] < 0) t[c]++;
			if (t[c] > 1) t[c]--;
			if (t[c] < 1 / 6)
				that[c] = p + ((q - p) * 6 * t[c]);
			else if (t[c] < 1 / 2)
				that[c] = q;
			else if (t[c] < 2 / 3)
				that[c] = p + ((q - p) * 6 * (2 / 3 - t[c]));
			else
				that[c] = p;
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
		if (includeAlpha)
			color.a = round(color.a + (other.a - color.a) * ratio, 3);
		if (isHSL)
			color.updateHSL();
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
		color = Color(color);   // Make a copy
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
