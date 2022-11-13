// Encoding: UTF-8 without BOM (auto-detect: °°°°°) for built-in message texts

import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, regExpEscape, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

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
		if (input.parent().hasClass(inputWrapperClass)) return;   // Already done
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
		input.prop("required", false);   // We have no way to show a browser-generated message on the original hidden and new readonly field

		// Put a wrapper between the input and its parent
		var wrapper = $("<div/>").addClass(inputWrapperClass).attr("style", input.attr("style"));
		input.before(wrapper).appendTo(wrapper);

		// Hide original input and add a new one, synchronise (and convert) values
		input.hide();
		input.attr("autocomplete", "off");
		var inputChanging = false;
		var isKeyboardMode = false;
		var newInput = $("<input/>")
			.attr("type", "text")
			.addClass("ff-timepicker-input")
			.prop("readonly", true)
			.attr("inputmode", "none")
			.attr("enterkeyhint", "done")   // Enter key is handled separately to close dropdown/keyboard but prevent submit
			.attr("autocapitalize", "off")
			.attr("autocomplete", "off")
			.attr("autocorrect", "off")
			.attr("spellcheck", "false")
			.insertAfter(input);
		input.data("ff-replacement", newInput);
		// Copy some CSS classes to the replacement element
		["input-validation-error"].forEach(clsName => {
			if (input.hasClass(clsName))
				newInput.addClass(clsName);
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
				newInput.triggerNative("input");
				newInput.triggerNative("change");
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
				let text = event.originalEvent.clipboardData.getData("text");
				let pattern = "";
				let matchParts = [];
				for (let i = 0; i < parts.length; i++) {
					if (parts[i].name) {
						if (parts[i].options) {
							pattern += "(" + parts[i].options.map(o => regExpEscape(o)).join("|") + ")";
						}
						else {
							pattern += "([0-9]{1," + parts[i].length + "})";
						}
						matchParts.push(parts[i]);
					}
					else {
						pattern += regExpEscape(parts[i].text);
					}
				}
				let re = new RegExp("^" + pattern + "$");
				let match = re.exec(text);
				let newPartData = {};
				if (match) {
					for (let i = 0; i < matchParts.length; i++) {
						let value = +match[i + 1];
						if (isNaN(value)) {
							value = matchParts[i].options.indexOf(match[i + 1]) + matchParts[i].min;
						}
						if (value < matchParts[i].min || value > matchParts[i].max) return;   // Invalid value
						newPartData[matchParts[i].name] = value;
					}
					partData = newPartData;
					input.val(getValue());   // Update native field for validation/fixing
					fixValue(true);
					updateText();
					newInput.triggerNative("input");
					newInput.triggerNative("change");
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
			if (key in dictionary[language])
				return dictionary[language][key];
			return dictionary.en[key];
		}

		function fixValue(noChangeEvent) {
			let isComplete = true;
			for (let i = 0; i < parts.length; i++) {
				if (parts[i].name && !$.isSet(partData[parts[i].name])) {
					isComplete = false;
					break;
				}
			}
			if (isComplete && !input.val()) {
				// All values set but no valid value available
				if (weekSelection) {
					let part = findPart("w");
					if (part) partData.w = getPartMax(part);
				}
				else {
					let part = findPart("d");
					if (part) partData.d = getPartMax(part);
				}
				if (!noChangeEvent) {
					updateText();
					newInput.triggerNative("input");
					newInput.triggerNative("change");
				}
			}
		}

		function validate() {
			if (required) {
				if (input.val())
					newInput.attr("pattern", null);
				else
					newInput.attr("pattern", "^invalid$");
			}
		}

		validate();

		// Create picker dropdown
		var dropdown = $("<div/>").addClass("dropdown bordered");

		// Set up masked edit
		let formatOptions = {
			calendar: "gregory",
			numberingSystem: "latn"
		};
		if (dateSelection && !weekSelection) {
			if (daySelection) {
				formatOptions.day = "numeric";
				formatOptions.month = "numeric";
			}
			else {
				formatOptions.month = "long";
			}
			formatOptions.year = "numeric";
		}
		if (timeSelection) {
			formatOptions.hour = "numeric";
			formatOptions.hour12 = false;   // TODO: Add 12h clock support; detect from format part "dayPeriod"
			if (minuteSelection) {
				formatOptions.minute = "numeric";
				if (secondSelection) {
					formatOptions.second = "numeric";
				}
			}
		}
		let format = new Intl.DateTimeFormat(opt.localeCode, formatOptions);
		let formatResolvedOptions = format.resolvedOptions();
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
					if (dateSelection)
						parts.push({ text: opt.isoFormatSeparator });
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
			}
			else {
				let formatParts = format.formatToParts(new Date());
				for (let f of formatParts) {
					switch (f.type) {
						case "literal": parts.push({ text: f.value }); break;
						case "year": parts.push({ name: "y", min: 1, max: 9999, length: 4, placeholder: translate("y") }); break;
						case "month":
							if (formatOptions.month === "numeric") {
								parts.push({ name: "mo", min: 1, max: 12, length: 2, placeholder: translate("mo") });
							}
							else {
								// Collect all localised month names
								let monthFormat = new Intl.DateTimeFormat(opt.localeCode, { month: "long" });
								let monthNames = [];
								for (let m = 0; m < 12; m++)
									monthNames.push(monthFormat.format(new Date(2000, m, 1)));
								parts.push({ name: "mo", min: 1, max: 12, length: 4, options: monthNames, placeholder: translate("month") });
							}
							break;
						case "day": parts.push({ name: "d", min: 1, max: 31, length: 2, placeholder: translate("d") }); break;
						case "hour": parts.push({ name: "h", min: 0, max: 23, length: 2 }); break;
						case "minute": parts.push({ name: "min", min: 0, max: 59, length: 2 }); break;
						case "second": parts.push({ name: "s", min: 0, max: 59, length: 2 }); break;
					}
				}
			}
		}
		else {
			if (translate("week1"))
				parts.push({ text: translate("week1") });
			parts.push({ name: "w", min: 1, max: 53, length: 2, placeholder: translate("w") });
			if (translate("week2"))
				parts.push({ text: translate("week2") });
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
		for (let i = 0; i < parts.length; i++) {
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
			for (let i = 0; i < parts.length; i++) {
				if (parts[i].name === name)
					return parts[i];
			}
			return null;
		}

		function findGreaterPartName(name) {
			switch (name) {
				case "mo": return "y";
				case "w": return "y";
				case "d": return "mo";
				case "h": return "d";
				case "min": return "h";
				case "s": return "min";
				default: return null;
			}
		}

		function selectPart(name) {
			for (let i = 0; i < parts.length; i++) {
				if (parts[i].name === name) {
					selectedPart = i;
					appendInput = false;
					inputLength = 0;
					break;
				}
			}
		}

		function updateText() {
			let text = "";
			let anyValueSet = false;
			for (let i = 0; i < parts.length; i++) {
				let part = parts[i];
				if ($.isSet(part.text)) {
					text += part.text;
				}
				else if (part.name) {
					part.start = text.length;
					let value = partData[part.name];
					if ($.isSet(value)) {
						// Display value
						anyValueSet = true;
						if (part.options) {
							text += part.options[value - part.min];
						}
						else {
							text += (value + "").padStart(part.length, "0");
						}
					}
					else {
						// Display placeholder or empty space
						if (part.placeholder)
							text += part.placeholder;
						else
							text += "-".repeat(part.length);
							//text += "\u2007".repeat(part.length);   // FIGURE SPACE
					}
					part.end = text.length;
				}
			}
			newInput.val(text);
			newInput.toggleClass("empty", !anyValueSet);
			if (parts[selectedPart] && parts[selectedPart].end) {
				newInput[0].setSelectionRange(parts[selectedPart].start, parts[selectedPart][isFocused ? "end" : "start"]);
				// Setting a non-empty selection always shows the selection background, even if not
				// focused. To avoid this, when unfocused, only the selection start is set to
				// maintain the selected part.
			}
		}

		updateText();

		function getValue() {
			let value = "";
			if (dateSelection) {
				if (!$.isSet(partData.y)) return "";
				value += (partData.y + "").padStart(4, "0") + "-";
				if (weekSelection) {
					if (!$.isSet(partData.w)) return "";
					value += "W" + (partData.w + "").padStart(2, "0");
				}
				else {
					if (!$.isSet(partData.mo)) return "";
					value += (partData.mo + "").padStart(2, "0");
					if (daySelection) {
						if (!$.isSet(partData.d)) return "";
						value += "-" + (partData.d + "").padStart(2, "0");
					}
				}
			}
			if (timeSelection) {
				if (dateSelection)
					value += "T";
				if (!$.isSet(partData.h)) return "";
				if (!$.isSet(partData.min)) return "";
				value += (partData.h + "").padStart(2, "0") + ":" +
					(partData.min + "").padStart(2, "0");
				if (secondSelection) {
					if (!$.isSet(partData.s)) return "";
					value += ":" + (partData.s + "").padStart(2, "0");
				}
			}
			return value;
		}

		function setValue(value) {
			let match;
			partData = {};
			if (match = value.match(/^([0-9]+)-([0-9]+)(?:-([0-9]+)(?:T([0-9]+):([0-9]+)(?::([0-9]+)(?:.[0-9]+)?)?)?)?$/)) {
				partData.y = +match[1];
				partData.mo = +match[2];
				if (match[3])
					partData.d = +match[3];
				if (match[4])
					partData.h = +match[4];
				if (match[5])
					partData.min = +match[5];
				if (match[6])
					partData.s = +match[6];
				// Ignore (but accept) optional milliseconds
			}
			else if (match = value.match(/^([0-9]+):([0-9]+)(?::([0-9]+))?$/)) {
				partData.h = +match[1];
				partData.min = +match[2];
				if (match[3])
					partData.s = +match[3];
			}
			else if (match = value.match(/^([0-9]+)-W([0-9]+)$/)) {
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
			let part = partName ? findPart(partName) : parts[selectedPart];
			if (part) {
				let value = partData[part.name];
				// TODO: Consider valid values as defined by step and min
				if ($.isSet(value)) {
					let backupPartData = $.extend({}, partData);
					while (count-- > 0) {
						let isOverflow;
						let myPart = part;
						do
						{
							partData[myPart.name] += direction;
							isOverflow = false;
							if (direction > 0 && partData[myPart.name] > getPartMax(myPart)) {
								isOverflow = true;
								partData[myPart.name] = getPartMin(myPart, direction);   // min of next overflow state
							}
							else if (direction < 0 && partData[myPart.name] < getPartMin(myPart)) {
								isOverflow = true;
								partData[myPart.name] = getPartMax(myPart, direction);   // max of next overflow state
							}
							if (isOverflow) {
								myPart = findPart(findGreaterPartName(myPart.name));
								if (myPart && !$.isSet(partData[myPart.name]))
									isOverflow = false;   // Incomplete data, don't overflow to next field
							}
						}
						while (myPart && isOverflow);
						if (isOverflow && dateSelection) {
							// No more space for the overflow, cancel entire change
							partData = backupPartData;
						}
					}
				}
				else {
					partData[part.name] = part[direction > 0 ? "min" : "max"];
				}
				updateText();
				cancelSearchTimeout();
				newInput.triggerNative("input");
				newInput.triggerNative("change");
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
				let year = partData.y;
				if (year) {
					year += (nextLevelOffset || 0);
					// A year has 53 weeks if it begins or ends on a Thursday
					// Source: https://de.wikipedia.org/wiki/Woche#Z%C3%A4hlweise_nach_ISO_8601
					// Algorithm to determine the weekday of the 1st January in a year (0 = Sun ... 6 = Sat)
					// Source: https://de.wikipedia.org/wiki/Gau%C3%9Fsche_Wochentagsformel
					// Simplification:
					// * A year that begins on a Thursday (= 4) has 53 weeks
					// * A year that ends on a Thursday (the next year begins on a Friday = 5) has 53 weeks
					// * Other years have 52 weeks
					let firstWeekday = year => (1 + 5 * ((year - 1) % 4) + 4 * ((year - 1) % 100) + 6 * ((year - 1) % 400)) % 7;
					if (firstWeekday(year) !== 4 && firstWeekday(year + 1) !== 5)
						return 52;
				}
				return part.max;
			}
			if (part.name === "d") {
				let month = partData.mo;
				if (month) {
					month += (nextLevelOffset || 0);
					if (month === 0) month = 12;
					let year = partData.y;
					return getDaysInMonth(month, year);
				}
				return part.max;
			}
			return part.max;
		}
		
		// Focus and selection events
		var isFocused = false;
		var blurCloseTimeout;
		newInput.focus(() => {
			//console.log("newInput.focus:", newInput[0]);
			isFocused = true;
			setTimeout(fixSelection, 0);
			if (blurCloseTimeout) {
				// Clicked on an item, focused back; don't close the dropdown
				clearTimeout(blurCloseTimeout);
				blurCloseTimeout = undefined;
			}
		});
		newInput.blur(() => {
			//console.log("newInput.blur:", newInput[0]);
			isFocused = false;
			cancelSearchTimeout();
			newInput.prop("readonly", true)
				.attr("inputmode", "none");
			isKeyboardMode = false;
			if (!newInput.hasClass("open"))
				fixValue();
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
				}
				else if (weekSelection && !partData.w) {
					selectPart("w");
					updateText();
				}
				else if (timeSelection && !$.isSet(partData.h)) {
					selectPart("h");
					updateText();
				}
				openDropdown();
			}
		});
		let separatorChars = [".", ":", "-", "/", ","];
		newInput.keydown(function (event) {
			//console.log("keydown: keyCode:", event.keyCode, event);
			//alert("keyCode: " + event.keyCode + ", key: " + event.originalEvent.key);
			let keyCode = event.keyCode;
			if (event.keyCode === 13) {   // Enter
				event.preventDefault();
				dropdown.dropdown.close();
				newInput.prop("readonly", true)
					.attr("inputmode", "none");
				isKeyboardMode = false;
			}
			if (event.keyCode === 27) {   // Esc
				event.preventDefault();
				dropdown.dropdown.close();
			}
			if (event.keyCode === 32) {   // Space
				event.preventDefault();
				if (!newInput.hasClass("open"))
					openDropdown();
				else
					dropdown.dropdown.close();
			}
			else if (keyCode === 37) {   // Left
				event.preventDefault();
				prevPart();
				updateText();
				cancelSearchTimeout();
			}
			else if (keyCode === 39) {   // Right
				event.preventDefault();
				nextPart();
				updateText();
				cancelSearchTimeout();
			}
			else if (keyCode === 38) {   // Up
				event.preventDefault();
				changeValue(1, 1);
			}
			else if (keyCode === 40) {   // Down
				event.preventDefault();
				changeValue(-1, 1);
			}
			else if (keyCode === 33) {   // PageUp
				event.preventDefault();
				changeValue(1, getPartLargeStep());
			}
			else if (keyCode === 34) {   // PageDown
				event.preventDefault();
				changeValue(-1, getPartLargeStep());
			}
			else if (keyCode === 8 || keyCode === 46) {   // Backspace, Del
				event.preventDefault();
				if (!required) {
					delete partData[parts[selectedPart].name];
					updateText();
					newInput.triggerNative("input");
					newInput.triggerNative("change");
				}
				cancelSearchTimeout();
			}
			else if (keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105) {   // 0-9, Num0-Num9
				event.preventDefault();
				let digit = event.keyCode;
				if (digit >= 96) digit -= (96 - 48);
				digit -= 48;
				let part = parts[selectedPart];
				let value = partData[part.name];
				if ($.isSet(value) && appendInput) {
					value = value * 10 + digit;
					if (value > getPartMax(part))
						value = digit;
				}
				else {
					value = digit;
				}
				appendInput = true;
				inputLength++;
				partData[part.name] = value;
				// Skip to next part if the value is complete
				if (inputLength >= part.length && value >= part.min ||
					value * 10 > getPartMax(part)) {
					nextPart();
				}
				updateText();
				cancelSearchTimeout();
				newInput.triggerNative("input");
				newInput.triggerNative("change");
			}
			else if (separatorChars.indexOf(event.originalEvent.key) !== -1) {   // Separator
				event.preventDefault();
				if (appendInput) {
					nextPart();
					updateText();
				}
				cancelSearchTimeout();
			}
			else if (event.originalEvent.key.length === 1 && !event.originalEvent.altKey && !event.originalEvent.ctrlKey) {   // Other char
				event.preventDefault();
				if (!appendInput)
					optionSearch = "";
				optionSearch += event.originalEvent.key.toLowerCase();
				appendInput = true;
				inputLength++;
				//console.log("optionSearch:", optionSearch);
				let part = parts[selectedPart];
				if (part.options) {
					for (let i = 0; i < part.options.length; i++) {
						if (part.options[i].toLowerCase().startsWith(optionSearch)) {
							partData[part.name] = i + part.min;
							updateText();
							break;
						}
					}
				}
				startSearchTimeout();
			}
			else {
				// Whatever it was, reset the text
				updateText();
				newInput.triggerNative("input");
				newInput.triggerNative("change");
			}
		});
		let newInputInInputEvent = false;
		newInput.on("input", function (event) {
			if (newInputInInputEvent) return;   // Recursion
			newInputInInputEvent = true;
			if (event.originalEvent) {
				// Something was typed in, reset the text
				// (Generated input events have no originalEvent)
				if (separatorChars.indexOf(event.originalEvent.data) !== -1) {   // Separator (for Chrome/Android: https://crbug.com/118639)
					if (appendInput) {
						nextPart();
					}
					cancelSearchTimeout();
				}
				updateText();
				newInput.triggerNative("input");
				newInput.triggerNative("change");
			}
			newInputInInputEvent = false;
		});

		function startSearchTimeout() {
			if (!optionSearchTimeout) {
				optionSearchTimeout = setTimeout(() => {
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
				case "y": return 10;
				case "mo": return 3;
				case "d": return 7;
				case "h": return 12;
				case "min": return 15;
				case "s": return 15;
				default: return 1;
			}
		}

		function prevPart() {
			//console.log("selectedPart:", selectedPart);
			for (let i = selectedPart - 1; i >= 0; i--) {
				if (parts[i].name) {
					selectedPart = i;
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
			for (let i = selectedPart + 1; i < parts.length; i++) {
				if (parts[i].name) {
					selectedPart = i;
					//console.log("new selectedPart:", selectedPart);
					appendInput = false;
					inputLength = 0;
					updateViewVisibilities();
					break;
				}
			}
		}

		function fixSelection() {
			let selStart = newInput[0].selectionStart;
			//console.log("selectionStart:", selStart);
			for (let i = 0; i < parts.length; i++) {
				let part = parts[i];
				if (part.name && selStart <= part.end) {
					selectedPart = i;
					//console.log("New selected part:", i);
					appendInput = false;
					inputLength = 0;
					updateViewVisibilities();
					if (isFocused)
						newInput[0].setSelectionRange(part.start, part.end);
					break;
				}
			}
		}

		// Load initial value
		setValue(input.val());

		// Create dropdown contents
		let dropdownInner = $("<div/>")
			.addClass("ff-timepicker")
			.appendTo(dropdown);
		let dropdownButtons = $("<div/>")
			.addClass("ff-timepicker-buttons")
			.appendTo(dropdownInner);

		let boxSize = { width: 280, height: 240 };
		if (!dateSelection)
			boxSize.width = boxSize.height;   // No need for space for longer month names
		let dropdownContent = $("<div/>")
			.addClass("ff-timepicker-content")
			.css("width", boxSize.width)
			.css("height", boxSize.height)
			.appendTo(dropdownInner);
		let darkMode = dropdown.parent().hasClass("dark");

		let updateHandler = () => {
			updateText();
			newInput.triggerNative("input");
			newInput.triggerNative("change");
		};

		let yearView;
		let monthView;
		let clockHourView;
		let clockMinuteView;
		let clockSecondView;
		if (dateSelection) {
			yearView = new YearView(dropdownContent, boxSize, darkMode, opt, translate, weekSelection, () => partData, changeValue, updateHandler, () => {
				if (daySelection) {
					selectPart("d");
					updateText();
					yearView.hide();
					monthView.show();
				}
				else if (weekSelection) {
					// Convert month selection to week selection
					// (Keep selected week if the month matches)
					if (partData.w < getWeekData(new Date(partData.y, partData.mo - 1, 1)).w ||
						partData.w > getWeekData(new Date(partData.y, partData.mo, 0)).w) {
						let weekData = getWeekData(new Date(partData.y, partData.mo - 1, 4));   // Thursday
						delete partData.mo;
						partData.y = weekData.y;
						partData.w = weekData.w;
					}
					selectPart("w");
					updateText();
					monthView.update();
					yearView.hide();
					monthView.show();
				}
				else {
					dropdown.dropdown.close();
				}
			});
			monthView = new MonthView(dropdownContent, boxSize, darkMode, opt, translate, weekSelection ? "w" : "d", () => partData, changeValue, updateHandler, () => {
				if (timeSelection) {
					selectPart("h");
					updateText();
					monthView.hide();
					clockHourView.show();
				}
				else {
					dropdown.dropdown.close();
				}
			});
			opt._updateMonthView = () => monthView.update(true);
		}
		if (timeSelection) {
			clockHourView = new ClockView(dropdownContent, boxSize, darkMode, translate, "h", () => partData, changeValue, updateHandler, () => {
				if (minuteSelection) {
					selectPart("min");
					updateText();
					clockHourView.hide();
					clockMinuteView.show();
				}
				else {
					dropdown.dropdown.close();
				}
			});
			if (minuteSelection)
				clockMinuteView = new ClockView(dropdownContent, boxSize, darkMode, translate, "min", () => partData, changeValue, updateHandler, () => {
					if (secondSelection) {
						selectPart("s");
						updateText();
						clockMinuteView.hide();
						clockSecondView.show();
					}
					else {
						dropdown.dropdown.close();
					}
				});
			if (secondSelection)
				clockSecondView = new ClockView(dropdownContent, boxSize, darkMode, translate, "s", () => partData, changeValue, updateHandler, () => {
					dropdown.dropdown.close();
				});
		}

		let backButton = $("<button type='button'/>")
			.addClass("button narrow")
			.html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin:-2px"><path d="M6,6L6,9.5L0,5L6,0.5L6,4L10,4C11.796,4 13.284,4.62 14.332,5.668C15.38,6.716 16,8.204 16,10C16,11.796 15.38,13.284 14.332,14.332C13.284,15.38 11.796,16 10,16L8,16L8,14L10,14C11.204,14 12.216,13.62 12.918,12.918C13.62,12.216 14,11.204 14,10C14,8.796 13.62,7.784 12.918,7.082C12.216,6.38 11.204,6 10,6L6,6Z"/></svg>')
			.attr("title", translate("back"))
			.appendTo(dropdownButtons)
			.click(event => {
				selectPart(findGreaterPartName(parts[selectedPart].name));
				updateViewVisibilities();
				updateText();
				cancelSearchTimeout();
			});
		$("<button type='button'/>")
			.addClass("button")
			.text(timeSelection ? translate("now") : translate("today"))
			.appendTo(dropdownButtons)
			.click(setNow);
		$("<button type='button'/>")
			.addClass("button narrow")
			.html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin:-2px;fill-rule:evenodd;"><path d="M9,13L6,13L6,16L9,16L9,13ZM5,9L2,9L2,12L5,12L5,9ZM13,9L10,9L10,12L13,12L13,9ZM9,9L6,9L6,12L9,12L9,9ZM5,5L2,5L2,8L5,8L5,5ZM9,5L6,5L6,8L9,8L9,5ZM13,5L10,5L10,8L13,8L13,5ZM5,1L2,1L2,4L5,4L5,1ZM9,1L6,1L6,4L9,4L9,1ZM13,1L10,1L10,4L13,4L13,1Z"/></svg>')
			.attr("title", translate("keyboard"))
			.appendTo(dropdownButtons)
			.click(event => {
				isKeyboardMode = true;
				dropdown.dropdown.close();
				newInput.prop("readonly", false)
					.attr("inputmode", "decimal");
				// https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
			});
		if (!required) {
			$("<button type='button'/>")
				.addClass("button narrow")
				.html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin:-2px;fill-rule:evenodd;"><path d="M0.293,8L6.293,14L16,14L16,2L6.293,2L0.293,8ZM6.707,3L1.707,8L6.707,13L15,13L15,3L6.707,3ZM10,7.293L12.646,4.646L13.354,5.354L10.707,8L13.354,10.646L12.646,11.354L10,8.707L7.354,11.354L6.646,10.646L9.293,8L6.646,5.354L7.354,4.646L10,7.293Z"/></svg>')
				.attr("title", translate("clear"))
				.appendTo(dropdownButtons)
				.click(event => {
					dropdown.dropdown.close();
					setValue("");
					newInput.triggerNative("input");
					newInput.triggerNative("change");
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
					if (!dateSelection)
						backButton.disable();
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
			if (newInput.closest(".dark .not-dark").hasClass("dark"))
				dropdown.parent().addClass("dark");   // Set dropdown container to dark
		}

		function setNow() {
			let now = new Date();
			if (weekSelection) {
				let weekData = getWeekData(now);
				partData.y = weekData.y;
				partData.w = weekData.w;
			}
			else if (dateSelection) {
				partData.y = now.getFullYear();
				partData.mo = now.getMonth() + 1;
			}
			if (daySelection) partData.d = now.getDate();
			if (timeSelection) partData.h = now.getHours();
			if (minuteSelection) partData.min = now.getMinutes();
			if (secondSelection) partData.s = now.getSeconds();
			updateText();
			newInput.triggerNative("input");
			newInput.triggerNative("change");
		}

		var isMouseDown = false;
		dropdown.on("mousedown", function (event) {
			if (event.originalEvent.button === 0) {
				isMouseDown = true;
				setTimeout(() => {
					newInput.focus();
				}, 0);
			}
			else {
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
			if (!isKeyboardMode)
				fixValue();
		});
	});
}

function YearView(container, boxSize, darkMode, opt, translate, weekSelection, partDataAccessor, changeValue, updateHandler, doneHandler) {
	var instance = this;

	let outerDiv = $("<div/>")
		.addClass("ff-timepicker-year")
		.appendTo(container);
	let innerDiv = $("<div/>")
		.addClass("ff-timepicker-inner")
		.addClass("hidden")
		.appendTo(outerDiv);

	let headerHeight = 30;
	let monthHeight = (boxSize.height - headerHeight - 1 /* margin */) / 4;

	let header = $("<div/>")
		.addClass("header")
		.css("height", headerHeight)
		.appendTo(innerDiv);
	let prevButton = $("<a/>")
		.addClass("button narrow transparent")
		.html('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><polyline fill="none" stroke-width="1.2" points="6,1 1,6 6,11"/></svg>')
		.on("repeatclick", event => {
			event.preventDefault();
			ensureYear();
			changeValue(-1, 1, "y");
		})
		.appendTo(header);
	prevButton.repeatButton();
	let yearText = $("<span/>")
		.appendTo(header);
	let nextButton = $("<a/>")
		.addClass("button narrow transparent")
		.html('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><polyline fill="none" stroke-width="1.2" points="1,1 6,6 1,11"/></svg>')
		.on("repeatclick", event => {
			event.preventDefault();
			ensureYear();
			changeValue(1, 1, "y");
		})
		.appendTo(header);
	nextButton.repeatButton();

	function ensureYear() {
		let partData = partDataAccessor();
		let now = new Date();
		if (!partData.y)
			partData.y = now.getFullYear();
	}

	let months = $("<div/>")
		.addClass("months")
		.appendTo(innerDiv);
	let monthFormat = new Intl.DateTimeFormat(opt.localeCode, { month: "long" });

	instance.update = function () {
		var partData = partDataAccessor();

		let now = new Date();
		let year = partData.y || now.getFullYear();
		yearText.text((year + "").padStart(4, "0"));

		prevButton.disabled(partData.y === 1);
		nextButton.disabled(partData.y === 9999);

		months.children().remove();
		for (let n = 1; n <= 12; n++) {
			let item = $("<div/>")
				.addClass("item")
				.css("height", monthHeight)
				.appendTo(months)
				.click(function () {
					let partData = partDataAccessor();
					partData.mo = n;
					if (!$.isSet(partData.y))
						partData.y = (new Date()).getFullYear();
					instance.update();
					updateHandler && updateHandler();
					doneHandler && doneHandler();
				});
			let text = $("<span/>")
				.text(monthFormat.format(new Date(2000, n - 1, 1)))
				.appendTo(item);
			opt.monthFormatter && opt.monthFormatter(item, new Date(year, n - 1, 1));
		}

		// Update week numbers
		if (weekSelection) {
			months.find(".item").each$((n, item) => {
				item.children().eq(1).remove();
				$("<span/>")
					.addClass("week-numbers")
					.text(translate("w").substring(0, 1).toUpperCase() + " " + getWeekData(new Date(year, n, 1)).w + "\u202F–\u202F" + getWeekData(new Date(year, n + 1, 0)).w)   // NNBSP
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

	let outerDiv = $("<div/>")
		.addClass("ff-timepicker-month")
		.appendTo(container);
	let innerDiv = $("<div/>")
		.addClass("ff-timepicker-inner")
		.addClass("hidden")
		.appendTo(outerDiv);

	let headerHeight = 30;
	let weekdayHeight = 20;
	let dayHeight = (boxSize.height - headerHeight - 1 /* margin */ - weekdayHeight) / 6;
	let skipWeeksFwd, skipWeeksRev;

	let header = $("<div/>")
		.addClass("header")
		.css("height", headerHeight)
		.appendTo(innerDiv);
	let prevButton = $("<a/>")
		.addClass("button narrow transparent")
		.html('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><polyline fill="none" stroke-width="1.2" points="6,1 1,6 6,11"/></svg>')
		.on("repeatclick", event => {
			event.preventDefault();
			if (partName === "d") {
				ensureYearMonth();
				changeValue(-1, 1, "mo");
			}
			else {
				ensureYearWeek();
				changeValue(-1, skipWeeksRev, "w");
			}
		})
		.appendTo(header);
	prevButton.repeatButton();
	let monthText = $("<span/>")
		.appendTo(header);
	let nextButton = $("<a/>")
		.addClass("button narrow transparent")
		.html('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><polyline fill="none" stroke-width="1.2" points="1,1 6,6 1,11"/></svg>')
		.on("repeatclick", event => {
			event.preventDefault();
			if (partName === "d") {
				ensureYearMonth();
				changeValue(1, 1, "mo");
			}
			else {
				ensureYearWeek();
				changeValue(1, skipWeeksFwd, "w");
			}
		})
		.appendTo(header);
	nextButton.repeatButton();

	function ensureYearMonth() {
		let partData = partDataAccessor();
		let now = new Date();
		if (!partData.mo)
			partData.mo = now.getMonth() + 1;
		if (!partData.y)
			partData.y = now.getFullYear();
	}

	function ensureYearWeek() {
		let partData = partDataAccessor();
		let now = new Date();
		let weekData = getWeekData(now);
		if (!partData.w || !partData.y) {
			partData.w = weekData.w;
			partData.y = weekData.y;
		}
	}

	let dayFormat = new Intl.DateTimeFormat(opt.localeCode, { weekday: "short" });
	let weekdays = $("<div/>")
		.addClass("weekdays")
		.appendTo(innerDiv);
	for (let n = 1; n <= 7; n++) {
		let item = $("<div/>")
			.css("height", weekdayHeight)
			.text(dayFormat.format(new Date(2018, 0, n)).toUpperCase())
			.appendTo(weekdays);
	}

	let weeks = $("<div/>")
		.addClass("weeks")
		.addClass(partName === "d" ? "day-selection" : "week-selection")
		.appendTo(innerDiv);
	let monthFormat = new Intl.DateTimeFormat(opt.localeCode, { month: "long" });

	let displayedYear, displayedMonth, prevMonthFirstDay;

	instance.update = function (force) {
		var partData = partDataAccessor();

		let now = new Date();
		let year = partData.y || now.getFullYear();
		let month = partData.mo || now.getMonth() + 1;
		if (partName === "w" && partData.w) {
			// Find month that contains the selected week
			let date = new Date(year, 1, 1);
			while (date.getDay() !== 4)   // Thursday
				date.setDate(date.getDate() + 1);
			while (partData.w !== getWeekData(date).w)
				date.setDate(date.getDate() + 7);
			month = date.getMonth() + 1;

			skipWeeksFwd = 4;
			date = new Date(year, month - 1, 1);
			if (getDaysInMonth(month, year) + (date.getDay() === 0 ? 7 : date.getDay()) >= 36)   // Found by try&analyse
				skipWeeksFwd++;
			
			skipWeeksRev = 4;
			date = new Date(year, month - 2, 1);
			if (getDaysInMonth(month - 1, year) + (date.getDay() === 0 ? 7 : date.getDay()) >= 36)
				skipWeeksRev++;
		}

		monthText.text(monthFormat.format(new Date(year, month - 1, 1)) + " " + (year + "").padStart(4, "0"));

		prevButton.disabled(year === 1 && month === 1);
		nextButton.disabled(year === 9999 && month === 12);

		if (force || year !== displayedYear || month !== displayedMonth) {
			// Recreate days for the selected month
			weeks.children().remove();
			let maxDay = getDaysInMonth(month, year);
			let date = new Date(year, month - 1, 1);
			let dayOfWeek = date.getDay();   // 0 = Sun ... 6 = Sat
			if (dayOfWeek === 0) dayOfWeek = 7;   // 1 = Mon ... 7 = Sun
			let maxDayPrevMonth = getDaysInMonth(month === 1 ? 12 : month - 1, year);
			prevMonthFirstDay = maxDayPrevMonth - (dayOfWeek - 2);
			let days = addWeek(date);
			let daysCount = 0;
			for (let n = prevMonthFirstDay; n <= maxDayPrevMonth; n++) {
				if (days.children(".item").length === 7) {
					date.setDate(date.getDate() + 7);
					days = addWeek(date);
				}
				let item = $("<div/>")
					.addClass("item prev-month")
					.css("height", dayHeight)
					.appendTo(days);
				if (partName === "d" && (month > 1 || year > 1)) {
					item.click(function () {
						let partData = partDataAccessor();
						partData.d = n;
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
					let text = $("<span/>")
						.text(n)
						.appendTo(item);
				}
				else {
					item.disable();
				}
				opt.dayFormatter && opt.dayFormatter(item, new Date(year, month - 2, n));
				daysCount++;
			}
			for (let n = 1; n <= maxDay; n++) {
				if (days.children(".item").length === 7) {
					date.setDate(date.getDate() + 7);
					days = addWeek(date);
				}
				let item = $("<div/>")
					.addClass("item day")
					.css("height", dayHeight)
					.appendTo(days);
				if (partName === "d") {
					item.click(function () {
						let partData = partDataAccessor();
						partData.d = n;
						partData.mo = month;
						partData.y = year;
						instance.update();
						updateHandler && updateHandler();
						doneHandler && doneHandler();
					});
				}
				let text = $("<span/>")
					.text(n)
					.appendTo(item);
				opt.dayFormatter && opt.dayFormatter(item, new Date(year, month - 1, n));
				daysCount++;
			}
			for (let n = 1; n <= 6 * 7 - daysCount; n++) {
				if (days.children(".item").length === 7) {
					date.setDate(date.getDate() + 7);
					days = addWeek(date);
				}
				let item = $("<div/>")
					.addClass("item next-month")
					.css("height", dayHeight)
					.appendTo(days);
				if (partName === "d" && (month < 12 || year < 9999)) {
					item.click(function () {
						let partData = partDataAccessor();
						partData.d = n;
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
					let text = $("<span/>")
						.text(n)
						.appendTo(item);
				}
				else {
					item.disable();
				}
				opt.dayFormatter && opt.dayFormatter(item, new Date(year, month, n));
			}
			
			displayedYear = year;
			displayedMonth = month;
		}

		function addWeek(date) {
			let weekData = getWeekData(date);
			let week = $("<div/>")
				.addClass("days")
				.data("week", weekData.w)
				.data("year", weekData.y)
				.appendTo(weeks)
				.append($("<div/>")
					.addClass("week-number")
					.append($("<span/>")
						.text(weekData.w)));
			if (partName === "w") {
				week.click(function () {
					let partData = partDataAccessor();
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
		}
		else {
			weeks.children().removeClass("selected");
			if ($.isSet(partData.w)) {
				weeks.children().each$((_, week) => {
					if (week.data("week") == partData.w)
						week.addClass("selected");
				});
			}
		}

		// Mark today
		weeks.find(".item").removeClass("now");
		if (now.getFullYear() === year && now.getMonth() === month - 1) {
			weeks.find(".item.day").eq(now.getDate() - 1).addClass("now");
		}
		else {
			let nowYearMonth = now.getFullYear() * 12 + now.getMonth();
			let yearMonth = year * 12 + month - 1;
			if (nowYearMonth === yearMonth - 1 && now.getDate() >= prevMonthFirstDay) {
				weeks.find(".item.prev-month").eq(now.getDate() - prevMonthFirstDay).addClass("now");
			}
			else if (nowYearMonth === yearMonth + 1 && now.getDate() <= 14) {
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

	let padding = 10;
	let clockOuter = $("<div/>")
		.addClass("ff-timepicker-clock")
		.css("padding", padding + "px " + ((boxSize.width - boxSize.height) / 2 + padding) + "px")
		.appendTo(container);
	let clockSize = boxSize.height - 2 * padding;
	let clockInner = $("<div/>")
		.addClass("ff-timepicker-inner")
		.addClass("hidden")
		.css("width", clockSize)
		.css("height", clockSize)
		.appendTo(clockOuter);
	let itemSize = 32;
	let outerRadius = clockSize / 2 - itemSize / 2 - 5;
	let innerRadius = clockSize * 0.32 - itemSize / 2;
	if (partName === "h") {
		for (let n = 1; n <= 24; n++) {
			let radius = n <= 12 ? outerRadius : innerRadius;
			let top = clockSize / 2 - Math.cos(n / 12 * 2 * Math.PI) * radius - itemSize / 2;
			let left = clockSize / 2 + Math.sin(n / 12 * 2 * Math.PI) * radius - itemSize / 2;
			let item = $("<span/>")
				.css("top", top)
				.css("left", left)
				.appendTo(clockInner);
			let text = $("<span/>")
				.text(n % 24)
				.appendTo(item);
			if (n > 12)
				item.addClass("inner-circle");
		}
	}
	else {
		for (let n = 0; n < 60; n += 5) {
			let top = clockSize / 2 - Math.cos(n / 60 * 2 * Math.PI) * outerRadius - itemSize / 2;
			let left = clockSize / 2 + Math.sin(n / 60 * 2 * Math.PI) * outerRadius - itemSize / 2;
			let item = $("<span/>")
				.css("top", top)
				.css("left", left)
				.appendTo(clockInner);
			let text = $("<span/>")
				.text(n)
				.appendTo(item);
		}
	}
	clockInner.children()
		.addClass("item")
		.css("width", itemSize)
		.css("height", itemSize);

	let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	clockInner.append(svg);
	let centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
	centerCircle.setAttribute("class", "clock-center-cirle");
	centerCircle.setAttribute("cx", clockSize / 2);
	centerCircle.setAttribute("cy", clockSize / 2);
	centerCircle.setAttribute("rx", 3.5);
	centerCircle.setAttribute("ry", 3.5);
	svg.appendChild(centerCircle);
	let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
	line.setAttribute("class", "clock-hour-line");
	line.setAttribute("visibility", "hidden");
	line.setAttribute("x1", clockSize / 2);
	line.setAttribute("y1", clockSize / 2);
	svg.appendChild(line);
	let extraItem, line2;
	if (partName !== "h") {
		line.setAttribute("class", "clock-minute-line");
		let backSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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
	let draggable = $("<div/>")
		.css("width", 0)
		.css("height", 0)   // draggable itself need not be seen or touchable
		.appendTo(clockInner);
	draggable.draggable({ catchElement: clockOuter });
	draggable.on("draggablemove", function (event) {
		// Compute angle and distance of draggable from centre
		let draggableRadius = draggable.outerWidth() / 2;
		let clockRect = clockInner.rect();
		let clockRadius = clockRect.width / 2;
		let angle = Math.atan2(
			(event.originalEvent.newPoint.left + draggableRadius) - (clockRect.left + clockRadius),
			(clockRect.top + clockRadius) - (event.originalEvent.newPoint.top + draggableRadius));
		let distance = Math.sqrt(
			Math.pow((event.originalEvent.newPoint.left + draggableRadius) - (clockRect.left + clockRadius), 2) +
			Math.pow((event.originalEvent.newPoint.top + draggableRadius) - (clockRect.top + clockRadius), 2));

		if (partName === "h") {
			// Closer to inner or outer hours circle?
			let isOuterCircle = distance > (innerRadius + outerRadius) / 2;

			// Determine nearest hour
			let angleDegree = (angle / 2 / Math.PI * 360 + 360) % 360;   // rad to degrees
			let hour = Math.round(angleDegree / 360 * 12);
			hour = (hour + 11) % 12 + 1;   // 0..11 → 1..12
			angleDegree = hour / 12 * 360;
			angle = angleDegree / 360 * 2 * Math.PI;   // degrees to rad
			if (!isOuterCircle)
				hour = (hour + 12) % 24;   // 1..12 → 13..0
			partDataAccessor()[partName] = hour;
			let radius = isOuterCircle ? outerRadius : innerRadius;
			instance.update();
			updateHandler && updateHandler();

			// Calculate point for determined hour (not really displayed...)
			event.originalEvent.newPoint = {
				top: -Math.cos(angle) * radius + clockRect.top + clockRadius - draggableRadius,
				left: Math.sin(angle) * radius + clockRect.left + clockRadius - draggableRadius
			};
		}
		else {
			// Determine nearest minute/second
			let angleDegree = (angle / 2 / Math.PI * 360 + 360) % 360;   // rad to degrees
			let n = Math.round(angleDegree / 360 * 60) % 60;   // 60 → 0
			angleDegree = n / 60 * 360;
			angle = angleDegree / 360 * 2 * Math.PI;   // degrees to rad
			let partData = partDataAccessor();
			if (partData[partName] >= 45 && n <= 15) {
				// Increment next level
				changeValue(1, 1, partName === "s" ? "min" : "h");
			}
			else if (partData[partName] <= 15 && n >= 45) {
				// Decrement next level
				changeValue(-1, 1, partName === "s" ? "min" : "h");
			}
			partData[partName] = n;
			instance.update();
			updateHandler && updateHandler();

			// Calculate point for determined minute/second (not really displayed...)
			event.originalEvent.newPoint = {
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
				let clockRadius = clockSize / 2;
				let angle = partData[partName] / 12 * 2 * Math.PI;   // rad
				let radius = partData[partName] >= 1 && partData[partName] <= 12 ? outerRadius : innerRadius;
				radius -= itemSize / 2 + 4;   // only touch the item circle, don't go to its centre
				line.setAttribute("visibility", "visible");
				line.setAttribute("x2", Math.sin(angle) * radius + clockRadius);
				line.setAttribute("y2", -Math.cos(angle) * radius + clockRadius);
			}
			else {
				// Remove line
				line.setAttribute("visibility", "hidden");
				line.setAttribute("x2", clockSize / 2);
				line.setAttribute("y2", clockSize / 2);
			}
		}
		else {
			// Set current minute/second as "selected"
			clockInner.find(".item").removeClass("selected");
			if ($.isSet(partData[partName])) {
				if (partData[partName] % 5 === 0)
					clockInner.find(".item").eq(partData[partName] / 5).addClass("selected");
				// Move line to the edge of that item circle
				let clockRadius = clockSize / 2;
				let angle = partData[partName] / 60 * 2 * Math.PI;   // rad
				let radius = outerRadius - (itemSize / 2 + 4);   // only touch the item circle, don't go to its centre
				line.setAttribute("visibility", "visible");
				line.setAttribute("x2", Math.sin(angle) * radius + clockRadius);
				line.setAttribute("y2", -Math.cos(angle) * radius + clockRadius);
				// Set extra item position
				if (partData[partName] % 5 !== 0) {
					extraItem.setAttribute("visibility", "visible");
					extraItem.setAttribute("cx", Math.sin(angle) * outerRadius + clockRadius);
					extraItem.setAttribute("cy", -Math.cos(angle) * outerRadius + clockRadius);
				}
				else {
					extraItem.setAttribute("visibility", "hidden");
				}

				if (partName === "min") {
					if ($.isSet(partData.h)) {
						// Set secondary (hour) line
						angle = (partData.h + partData.min / 60) / 12 * 2 * Math.PI;   // rad
						radius *= 0.6;
						line2.setAttribute("visibility", "visible");
						line2.setAttribute("x2", Math.sin(angle) * radius + clockRadius);
						line2.setAttribute("y2", -Math.cos(angle) * radius + clockRadius);
					}
					else
					{
						// Remove secondary (hour) line
						line2.setAttribute("visibility", "hidden");
					}
				}
			}
			else {
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
	if (month === 4 || month === 6 || month === 9 || month === 11)
		return 30;
	if (month === 2) {
		if (year) {
			let leapYear = (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0);
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
		if (timePicker.length === 0) return;   // Nothing to do
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
		if (timePicker.length === 0) return;   // Nothing to do
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
