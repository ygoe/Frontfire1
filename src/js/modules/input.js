﻿import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

const replacementKey = "ff-replacement";

var inputWrapperClass = "ff-input-wrapper";
var repeatButtonClass = "ff-repeat-button";
var styleCheckboxClass = "ff-checkbox";
var treeStateClass = "ff-threestate";
var textareaWrapperClass = "ff-textarea-wrapper";

// Makes each selected button trigger repeated click events while being pressed.
// The button will not trigger a click event anymore but instead repeatclick events.
function repeatButton() {
	return this.each$(function (_, button) {
		if (button.hasClass(repeatButtonClass)) return;   // Already done
		button.addClass(repeatButtonClass);
		var timeout, ms;
		button.on("mousedown touchstart", function (event) {
			event.preventDefault();
			button.addClass("ff-active");   // CSS :active doesn't trigger, do it manually with an alternate class
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
		if (input.parent().hasClass(inputWrapperClass)) return;   // Already done

		// Put a wrapper between the input and its parent
		var wrapper = $("<div/>").addClass(inputWrapperClass).attr("style", input.attr("style"));
		input.before(wrapper).appendTo(wrapper);
		input.attr("autocomplete", "off");

		// Add control buttons
		var buttons = [];
		var decButton = $("<button type='button'/>").addClass("button").appendTo(wrapper).attr("tabindex", "-1").text("\u2212");   // &minus;
		buttons.push(decButton);
		decButton.on("repeatclick", function () {
			if (input.disabled()) return;
			var value = +input.val();
			var min = input.attr("min");
			var max = input.attr("max");
			var stepBase = min !== undefined ? +min : 0;
			var stepAttr = "";
			if (input.data("step"))
				stepAttr = input.data("step") + ""
			else if (input.attr("step"))
				stepAttr = input.attr("step")
			let match = stepAttr.match(/^\s*\*(.*)/);
			if (match) {
				let factor = +match[1] || 10;
				if ((min === undefined || value / factor >= min) && (max === undefined || value / factor <= max))
					value /= factor;
			}
			else {
				if (max !== undefined && value > +max) value = +max + 1;
				var step = +stepAttr || 1;
				var corr = step / 1000;   // Correct JavaScript's imprecise numbers
				value = (Math.ceil((value - stepBase - corr) / step) - 1) * step + stepBase;   // Set to next-smaller valid step
				if (min !== undefined && value < +min) value = +min;
				while (max !== undefined && value > +max) value -= step;
			}
			let valueStr = value.toFixed(10).replace(/0+$/, "").replace(/[.,]$/, "");   // Correct JavaScript's imprecise numbers again
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
			if (input.data("step"))
				stepAttr = input.data("step") + ""
			else if (input.attr("step"))
				stepAttr = input.attr("step")
			let match = stepAttr.match(/^\s*\*(.*)/);
			if (match) {
				let factor = +match[1] || 10;
				if ((min === undefined || value * factor >= min) && (max === undefined || value * factor <= max))
					value *= factor;
			}
			else {
				if (max !== undefined && value > +max) value = +max + 1;
				var step = +stepAttr || 1;
				var corr = step / 1000;   // Correct JavaScript's imprecise numbers
				// TODO: With max=100 and step=0.1, incrementing from 100 results in 99.9 again. JavaScript double precision is still broken here!
				value = (Math.floor((value - stepBase + corr) / step) + 1) * step + stepBase;   // Set to next-greater valid step
				if (min !== undefined && value < +min) value = +min;
				while (max !== undefined && value > +max) value -= step;
			}
			let valueStr = +value.toFixed(10).replace(/0+$/, "").replace(/[.,]$/, "");   // Correct JavaScript's imprecise numbers again
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
		if (!input.is("input[type=checkbox]")) return;   // Wrong element
		let content;
		let isActive = input.prop("checked");
		//let activeValue = input.attr("value");
		let button;
		if (input.parent().is("label")) {
			let label = input.parent();
			input.insertBefore(label);
			content = label.html();
			label.remove();
		}
		else if (input.attr("id")) {
			let label = $("label[for='" + input.attr("id") + "']");
			if (label.length > 0) {
				content = label.html();
				label.remove();
			}
		}
		
		button = $("<button/>")
			.attr("type", "button")
			.attr("title", input.attr("title"))
			.attr("style", input.attr("style"))
			.addClass("button toggle-button")
			.html(content)
			.insertAfter(input);
		//input.attr("type", "hidden");
		input.hide();
		input.data(replacementKey, button);
		// Copy some CSS classes to the button
		["narrow", "transparent", "input-validation-error"].forEach(clsName => {
			if (input.hasClass(clsName))
				button.addClass(clsName);
		});

		if (isActive)
			button.addClass("active");
		//else
		//	input.val("");

		button.click(() => {
			button.toggleClass("active");
			//input.val(button.hasClass("active") ? activeValue : "");
			input.prop("checked", button.hasClass("active")).change();
		});
		
		input.on("change", () => {
			button.toggleClass("active", input.prop("checked"));
		});
	});
}

registerPlugin("toggleButton", toggleButton);

// Converts each selected input[type=color] element into a text field with color picker button.
function colorPicker() {
	return this.each$(function (_, input) {
		if (input.parent().hasClass(inputWrapperClass)) return;   // Already done
		var lastColor;

		input.attr("type", "text")
			.attr("autocapitalize", "off")
			.attr("autocomplete", "off")
			.attr("autocorrect", "off")
			.attr("spellcheck", "false");

		// Put a wrapper between the input and its parent
		var wrapper = $("<div/>").addClass(inputWrapperClass).attr("style", input.attr("style"));
		input.before(wrapper).appendTo(wrapper);

		// Create picker dropdown
		var dropdown = $("<div/>").addClass("dropdown bordered ff-colorpicker");
		dropdown.keydown(function (event) {
			if (event.keyCode >= 37 && event.keyCode <= 40) {   // Arrow keys
				event.preventDefault();
				dropdown.find("button").first().focus();
				dropdown.removeAttr("tabindex");
			}
			if (event.keyCode === 27) {   // Esc
				event.preventDefault();
				dropdown.dropdown.close();
				pickButton[0].focus();
			}
		});

		// Add control buttons
		var buttons = [];
		var pickButton = $("<button type='button'/>").addClass("button ff-colorbutton").appendTo(wrapper);
		buttons.push(pickButton);
		var colorBox = $("<div/>").appendTo(pickButton).text("\u2026");   // &hellip;
		input.on("input change", () => setColor(lastColor = input.val()));
		setColor(lastColor = input.val());

		// Create dropdown contents
		// Add grey tones explicitly
		var colors = [0x000000, 0x404040, 0x707070, 0xa0a0a0, 0xd0d0d0, 0xf0f0f0, 0xffffff];
		// Add colors with shades
		[
			0xff0000,   // red
			0xff8000,   // orange
			0xffc000,   // orangeyellow
			0xffe000,   // gold
			0xffff00,   // yellow
			0xc0ff00,   // greenyellow
			0x00ff00,   // green
			0x00ffc0,   // greencyan
			0x00ffff,   // cyan
			0x00c0ff,   // bluecyan
			0x0080ff,   // lightblue
			0x0000ff,   // blue
			0x8000ff,   // purple
			0xc000ff,   // violet
			0xff00ff    // magenta
		].forEach(function (baseColor_) {
			var baseColor = Color(baseColor_);
			[0.75, 0.5, 0.25].forEach(factor => colors.push(baseColor.blendWith(0x000000, factor)));
			colors.push(baseColor.toHTML());
			[0.5, 0.75, 0.875].forEach(factor => colors.push(baseColor.blendWith(0xffffff, factor)));
		});
		var buttonRow;
		colors.forEach(function (color, index) {
			color = Color(color);
			color.format = "HTML";
			if (index % 7 === 0)
				buttonRow = $("<div/>").appendTo(dropdown);
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
					case 37:   // Left
						newButton = activeButton.prev();
						break;
					case 39:   // Right
						newButton = activeButton.next();
						break;
					case 40:   // Down
						newButton = activeButton.parent().next().children().eq(activeButton.index());
						break;
					case 38:   // Up
						newButton = activeButton.parent().prev().children().eq(activeButton.index());
						break;
					case 27:   // Esc
						setColor(lastColor, true);
						dropdown.dropdown.close();
						pickButton[0].focus();
						break;
					case 13:   // Enter
						button.click();
						break;
					default:
						return;   // Not handled
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
			}
			else {
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
		if (input.hasClass(styleCheckboxClass)) return;   // Already done
		if (!input.is("input[type=checkbox], input[type=radio]")) return;   // Wrong element
		if (input.hasClass("toggle-button")) return;   // Hidden and replaced by a button

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
		if (input.hasClass(treeStateClass)) return;   // Already done
		if (!input.is("input[type=checkbox]")) return;   // Wrong element
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
			}
			else if (cb.readOnly) {
				// Was readonly (indeterminate) -> check and forget indeterminate state (unset readonly)
				cb.checked = true;   // Firefox and Chrome are already checked here, Edge is not
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
		if (textarea.parent().hasClass(textareaWrapperClass)) return;   // Already done

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
		if (textarea.prop("autofocus"))
			textarea.focus();

		function updateShadow() {
			// Copy textarea contents; browser will calculate correct height of shadow copy,
			// which will make overall wrapper taller, which will make textarea taller.
			// Also make sure the last line break is visible.
			// Add an extra line break to convince the browser that the textarea doesn't need a scrollbar.
			var text = textarea.val().replace(/\n$/, "\n.");
			if (extraRows)
				text += "\n.".repeat(extraRows);
			shadowContent.text(text);

			// Copy all layout-relevant styles from textarea to shadow element, in case they've changed
			[
				"border-bottom-style", "border-bottom-width",
				"border-left-style", "border-left-width",
				"border-right-style", "border-right-width",
				"border-top-style", "border-top-width",
				"font-family", "font-feature-settings", "font-kerning", "font-size", "font-stretch", "font-style",
				"font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian",
				"font-variant-ligatures", "font-variant-numeric", "font-variant-position", "font-weight",
				"hyphens", "letter-spacing", "line-height",
				"padding-bottom", "padding-left", "padding-right", "padding-top",
				"text-transform", "word-break", "word-spacing"
			].forEach(copyStyle);
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
		if (button.data("hasSubmitLock")) return;   // Already done
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

		let icon = button.find("i:empty");
		let loading;

		// Connect with form submit event if there is a form; otherwise, only explicit locking
		// available for this button
		let form = button[0].form;
		if (form) {
			$(form).on("submit", function (event) {
				//event.preventDefault();   // DEBUG
				if (button.disabled()) return;   // Nothing to do for this button
				lockButton(opt.timeout);
			});
		}

		function lockButton(timeout) {
			// Lock the button and replace the icon with a loading indicator
			button.disable();
			if (icon.length > 0) {
				if (button.data("submitLockClicked")) {
					let iconWidth = icon.width();
					let iconMarginLeft = parseFloat(icon.css("margin-left"));
					let iconMarginRight = parseFloat(icon.css("margin-right"));
					icon.hide();
					loading = $("<i/>")
						.addClass("loading thick")
						.css("font-size", "1em")
						.css("vertical-align", "-2px")
						.insertAfter(icon);
					let loadingWidth = loading.width();
					let dx = loadingWidth - iconWidth;
					loading
						.css("margin-left", -dx / 2 + iconMarginLeft)
						.css("margin-right", -dx / 2 + iconMarginRight);
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
