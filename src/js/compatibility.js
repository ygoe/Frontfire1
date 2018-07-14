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
		if (targetLength > padString.length)
			padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
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
		if (targetLength > padString.length)
			padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
		return padString.slice(0, targetLength) + String(this);
	};
}

// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat#Polyfill
if (!String.prototype.repeat) {
	String.prototype.repeat = function(count) {
		'use strict';
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
	}
}

// Source: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc#Polyfill
Math.trunc = Math.trunc || (x => x - x % 1);

// Source: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/log10#Polyfill
Math.log10 = Math.log10 || (x => Math.log(x) * Math.LOG10E);
