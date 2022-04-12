// This file uses its own scope to keep its helper functions private and make it reusable independently.
(function (undefined) {
	"use strict";

	var canvasContext;

	// Parses any color value understood by a browser into an object with r, g, b, a properties.
	function Color(value) {
		// Allow calling without "new" keyword
		if (!(this instanceof Color))
			return new Color(value);

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
			const div = document.createElement("div");
			div.style.display = "none";
			document.body.appendChild(div);   // required for getComputedStyle
			div.style.color = value;
			const color = getComputedStyle(div).color;
			const match = color.match(/rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*([0-9.]+)\s*)?\)/);
			if (match) {
				this.r = keep255(Number(match[1]));
				this.g = keep255(Number(match[2]));
				this.b = keep255(Number(match[3]));
				this.a = match[4] !== undefined ? keep1(Number(match[4])) : 1;
				return;
			}

			// Browser wasn't in the mood (probably Chrome with a named color), try harder
			if (!canvasContext) {
				const canvas = document.createElement("canvas");
				canvas.setAttribute("width", "1");
				canvas.setAttribute("height", "1");
				canvasContext = canvas.getContext("2d");
				canvasContext.globalCompositeOperation = "copy";   // required for alpha channel
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
			this.r = (value >> 16) & 0xff;
			this.g = (value >> 8) & 0xff;
			this.b = value & 0xff;
			const a = (value >> 24) & 0xff;
			this.a = a !== 0 ? round(a / 255, 3) : 1;
			return;
		}

		if (typeof value === "object") {
			if (Array.isArray(value)) {
				this.format = "Array";
				this.r = keep255(value[0]);
				this.g = keep255(value[1]);
				this.b = keep255(value[2]);
				this.a = value.length > 3 ? keep1(value[3]) : 1;
			}
			else {
				this.format = value.format !== undefined ? value.format : "Object";
				this.r = keep255(value.r);
				this.g = keep255(value.g);
				this.b = keep255(value.b);
				this.a = value.a !== undefined ? keep1(value.a) : 1;
				if (value.h !== undefined && value.s !== undefined && value.l !== undefined) {
					this.h = keep360(value.h);
					this.s = keep1(value.s);
					this.l = keep1(value.l);
				}
			}
			return;
		};

		console.error("Invalid color:", value);
	}

	// Make it public
	window.Color = Color;

	// Now add object methods
	const Color_prototype = Color.prototype;

	// Formats the color in the format it was originally parsed from. If the format is HTML and a
	// non-opaque alpha value is set, the result is in CSS rgba() format instead.
	Color_prototype.toString = function () {
		switch (this.format) {
			case "IntARGB":
				return this.toIntARGB();
			case "HTML":
				if (this.a === undefined || this.a === 1)
					return this.toHTML();
				return this.toCSS();   // Need CSS format for alpha value
			case "CSS":
			default:
				return this.toCSS();
		}
	};

	// Formats a color object into a CSS rgb() or rgba() string.
	Color_prototype.toCSS = function () {
		if (this.a === undefined || this.a === 1)
			return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
		return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
	};

	// Formats a color object into an HTML hexadecimal string. If requested, a non-opaque alpha
	// value is printed as a fourth hex digit pair, which is not valid HTML.
	Color_prototype.toHTML = function (withAlpha) {
		function conv(number) {
			return (number < 16 ? "0" : "") +
				round(keep255(number)).toString(16).toLowerCase();
		}

		let str = "#" + conv(this.r) + conv(this.g) + conv(this.b);
		if (withAlpha && this.a !== undefined && this.a !== 1)
			str += conv(this.a * 255);
		return str;
	};

	// Converts a color object into an integer number like 0xAARRGGBB.
	Color_prototype.toIntARGB = function () {
		return (this.a !== undefined ? round(keep1(this.a) * 255) : 255) << 24 |
			round(keep255(this.r)) << 16 |
			round(keep255(this.g)) << 8 |
			round(keep255(this.b));
	};

	// Converts a color object into an array with [r, g, b, a].
	Color_prototype.toArray = function () {
		const arr = [this.r, this.g, this.b];
		if (this.a !== undefined && this.a !== 1)
			arr.push[this.a * 255];
		return arr;
	};

	// Calculates the HSL components from the RGB components in the color object.
	Color_prototype.updateHSL = function () {
		this.r = keep255(this.r);
		this.g = keep255(this.g);
		this.b = keep255(this.b);

		const r = this.r / 255;
		const g = this.g / 255;
		const b = this.b / 255;
		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);

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
		this.h = keep360(this.h);
		this.s = keep1(this.s);
		this.l = keep1(this.l);

		const q = this.l < 0.5 ?
			this.l * (1 + this.s) :
			this.l + this.s - this.l * this.s;
		const p = 2 * this.l - q;
		const h = this.h / 360;   // Normalise hue to 0..1
		const t = { r: h + 1 / 3, g: h, b: h - 1 / 3 };

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
	// All R/G/B/A channels are blended separately.
	Color_prototype.blendWith = function (other, ratio, includeAlpha) {
		const isHSL = this.h !== undefined || other.h !== undefined;
		const color = Color(this);
		other = Color(other);
		ratio = keep1(ratio);
		["r", "g", "b"].forEach(c => {
			color[c] = keep255(round(extendFF(color[c]) + (extendFF(other[c]) - extendFF(color[c])) * ratio));
		});
		if (includeAlpha)
			color.a = round(color.a + (other.a - color.a) * ratio, 3);
		if (isHSL)
			color.updateHSL();
		return color;
	};

	// Returns a blended color with the specified ratio from 0 (no change) to 1 (only other color).
	// The H channel is blended on the short path around the circle, S/L/A channels are blended normally.
	Color_prototype.blendByHueWith = function (other, ratio, includeAlpha, largeArc) {
		const color = Color(this);
		if (!(other instanceof Color))
			other = Color(other);
		if (color.h === undefined)
			color.updateHSL();
		if (other.h === undefined)
			other.updateHSL();
		ratio = keep1(ratio);

		// If either color has no saturation, set its hue to the other's
		if (color.s === 0 && other.s !== 0)
			color.h = other.h;
		if (other.s === 0 && color.s !== 0)
			other.h = color.h;

		// Blend hue on the short path around the circle
		if (color.h < other.h) {
			if (!largeArc && other.h - color.h < 180 ||
				largeArc && other.h - color.h >= 180) {
				// Clockwise
				color.h = round(color.h + (other.h - color.h) * ratio, 3);
			}
			else {
				// Counter-clockwise with overflow
				const h = other.h - 360;
				color.h = round(color.h + (h - color.h) * ratio, 3);
				if (color.h < 0)
					color.h += 360;
			}
		}
		else {
			if (!largeArc && color.h - other.h < 180 ||
				largeArc && color.h - other.h >= 180) {
				// Counter-clockwise
				color.h = round(color.h + (other.h - color.h) * ratio, 3);
			}
			else {
				// Clockwise with overflow
				const h = color.h - 360;
				color.h = round(h + (other.h - h) * ratio, 3);
				if (color.h < 0)
					color.h += 360;
			}
		}

		["s", "l"].forEach(function (c) {
			color[c] = keep1(round(color[c] + (other[c] - color[c]) * ratio, 3));
		});
		if (includeAlpha)
			color.a = round(color.a + (other.a - color.a) * ratio, 3);
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
			const value = round(keep255(this.r) * 0.3 + keep255(this.g) * 0.59 + keep255(this.b) * 0.11);
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
			const value = this.isDark() ? 255 : 0;
			this.r = value;
			this.g = value;
			this.b = value;
			this.a = 1;
		});
	};

	const colorNames = {
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
		const color = Color(this);
		if (color.h === undefined)
			color.updateHSL();
		if (color.h === undefined || isNaN(color.h))
			return null;
		if (!(language in colorNames))
			language = "en";
		const names = colorNames[language];
		if (color.a < 0.02)
			return names.transparent;
		// Normalise values for development with a color tool
		const h = color.h / 360 * 255;
		const s = color.s * 255;
		const l = color.l * 255;
		if (l < 30)
			return names.black;
		if (l > 240)
			return names.white;

		const colorName =
			h < 15 ? names.red :
			h < 33 ? names.orange :
			h < 49 ? names.yellow :
			h < 111 ? names.green :
			h < 138 ? names.cyan :
			h < 180 ? names.blue :
			h < 207 ? names.purple :
			h < 238 ? names.pink :
			names.red;
		// Determines the saturation up to which the colour is grey (depending on the lightness)
		const graySaturation = l => {
			if (l < 128)
				return 90 + (30 - 90) * (l - 30) / (128 - 30);
			else
				return 30 + (90 - 30) * (l - 128) / (240 - 128);
		};
		if (l < 100) {
			if (s < graySaturation(l))
				return names.dark + names.gray;
			else if (colorName === names.orange)
				return names.brown;
			else
				return names.dark + colorName;
		}
		if (l > 190) {
			if (s < graySaturation(l))
				return names.light + names.gray;
			else
				return names.light + colorName;
		}
		if (s > 170)
			return colorName;
		if (s < graySaturation(l))
			return names.gray;
		else
			return names.pale + colorName;
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

	function keep360(value) {
		return minmax(value, 0, 360);
	}

	// Returns the value in the range between min and max.
	function minmax(value, min, max) {
		return Math.max(min, Math.min(value, max));
	}

	// Returns the value rounded to the specified number of decimals.
	function round(value, decimals) {
		if (decimals === undefined) decimals = 0;
		const precision = Math.pow(10, decimals);
		return Math.round(value * precision) / precision;
	}

})();
