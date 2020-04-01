import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow } from "../util";

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
		if (elem.hasClass(selectableClass)) return;   // Already done
		elem.addClass(selectableClass);
		var opt = initOptions("selectable", selectableDefaults, elem, {}, options);
		opt._prepareChild = prepareChild;
		opt._selectAll = selectAll;
		opt._selectNone = selectNone;
		opt._selectItem = selectItem;

		let replaceHtmlSelect = elem[0].nodeName === "SELECT";
		let useDropdown = replaceHtmlSelect && !elem.attr("size");
		let htmlSelect, button;
		let htmlSelectChanging;
		let blurCloseTimeout;
		
		if (replaceHtmlSelect) {
			htmlSelect = elem;
			let origStyle = elem.attr("style");
			htmlSelect.hide();
			opt.multiple |= htmlSelect.attr("multiple") !== undefined;
			let newSelect = $("<div/>")
				.addClass(selectableClass)
				.insertAfter(htmlSelect);
			elem = newSelect;
			htmlSelect.data("ff-replacement", newSelect);
			updateFromHtmlSelect();
			if (useDropdown) {
				button = $("<div/>")
					.addClass("ff-selectable-button")
					.attr("tabindex", 0)
					.insertAfter(htmlSelect);
				button.attr("style", origStyle);
				newSelect.addClass("no-border dropdown bordered");
				htmlSelect.data("ff-replacement", button);
				updateButton();
				button.click(function () {
					if (button.disabled()) return;
					button.addClass("open");
					newSelect.dropdown(button);
					if (button.closest(".dark").length > 0)
						newSelect.parent().addClass("dark");   // Set dropdown container to dark
					newSelect.on("dropdownclose", function () {
						button.removeClass("open");
					});
					newSelect.parent(".ff-dropdown-container").css("min-width", button.outerWidth());
				});
				button.on("keydown", function (event) {
					//console.log(event);
					if (button.disabled()) return;
					switch (event.originalEvent.keyCode) {
						case 13:   // Enter
						case 32:   // Space
							event.preventDefault();
							button.click();
							break;
						case 35:   // End
							event.preventDefault();
							changeSelectedIndex(elem.children().length, !!event.originalEvent.shiftKey && opt.multiple);
							break;
						case 36:   // Home
							event.preventDefault();
							changeSelectedIndex(-elem.children().length, !!event.originalEvent.shiftKey && opt.multiple);
							break;
						case 38:   // ArrowUp
							event.preventDefault();
							changeSelectedIndex(-1, !!event.originalEvent.shiftKey && opt.multiple);
							break;
						case 40:   // ArrowDown
							event.preventDefault();
							changeSelectedIndex(1, !!event.originalEvent.shiftKey && opt.multiple);
							break;
						case 65:   // KeyA
							if (!!event.originalEvent.ctrlKey && !event.originalEvent.shiftKey) {
								event.preventDefault();
								selectAll();
							}
							break;
						case 68:   // KeyD
							if (!!event.originalEvent.ctrlKey && !event.originalEvent.shiftKey) {
								event.preventDefault();
								selectNone();
							}
							break;
					}
				});

				// Make the button unfocusable while it is disabled
				let onDisabledchange = function () {
					if (button.disabled())
						button.attr("tabindex", null);
					else
						button.attr("tabindex", 0);
				};
				button.on("disabledchange", onDisabledchange);
				onDisabledchange();

				// Close the dropdown when leaving the field with the Tab key
				// (but not when clicking an item in the dropdown)
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
				if (useDropdown)
					button.disable();
				else
					newSelect.disable();
			}

			// Apply nowrap class where appropriate
			if (htmlSelect.hasClass("wrap")) {
				if (useDropdown)
					button.addClass("wrap");
				else
					newSelect.addClass("wrap");
			}

			htmlSelect.change(function () {
				if (!htmlSelectChanging) {
					updateFromHtmlSelect();
					elem.children().each(prepareChild);
					lastClickedItem = elem.children(".selected").first();
					if (lastClickedItem.length === 0)
						lastClickedItem = elem.children(":not(.disabled)").first();
				}
				if (useDropdown) {
					updateButton();
				}
			});
		}

		elem.attr("tabindex", 0);
		elem.children().each(prepareChild);
		var lastClickedItem = elem.children(".selected").first();
		if (lastClickedItem.length === 0)
			lastClickedItem = elem.children(":not(.disabled)").first();
		var lastSelectedItem;
		
		elem.on("keydown", function (event) {
			//console.log(event);
			if (elem.disabled()) return;
			switch (event.originalEvent.keyCode) {
				case 35:   // End
					event.preventDefault();
					changeSelectedIndex(elem.children().length, !!event.originalEvent.shiftKey && opt.multiple);
					break;
				case 36:   // Home
					event.preventDefault();
					changeSelectedIndex(-elem.children().length, !!event.originalEvent.shiftKey && opt.multiple);
					break;
				case 38:   // ArrowUp
					event.preventDefault();
					changeSelectedIndex(-1, !!event.originalEvent.shiftKey && opt.multiple);
					break;
				case 40:   // ArrowDown
					event.preventDefault();
					changeSelectedIndex(1, !!event.originalEvent.shiftKey && opt.multiple);
					break;
				case 65:   // KeyA
					if (!!event.originalEvent.ctrlKey && !event.originalEvent.shiftKey) {
						event.preventDefault();
						selectAll();
					}
					break;
				case 68:   // KeyD
					if (!!event.originalEvent.ctrlKey && !event.originalEvent.shiftKey) {
						event.preventDefault();
						selectNone();
					}
					break;
			}
		});

		// Sets up event handlers on a selection child (passed as this).
		function prepareChild() {
			var child = $(this);
			if (child.hasClass("disabled"))
				return;
			var isMouseDown = false;
			child.on("mousedown", function (event) {
				if (event.originalEvent.button === 0) {
					isMouseDown = true;
					setTimeout(() => {
						if (useDropdown)
							button.focus();
						else
							elem.focus();
					}, 0);
				}
				else {
					isMouseDown = false;
				}
			});
			child.on("mouseup", function (event) {
				if (!isMouseDown) return;
				isMouseDown = false;
				if (useDropdown)
					button.focus();
				else
					elem.focus();
				let ctrlKey = !!event.originalEvent.ctrlKey;
				let shiftKey = !!event.originalEvent.shiftKey;
				if (!opt.multiple) ctrlKey = shiftKey = false;
				if (opt.toggle) ctrlKey = true;
				let changed = false;
				if (ctrlKey) {
					child.toggleClass("selected");
					if (!opt.allowEmpty && elem.children(".selected").length === 0) {
						// Empty selection not allowed
						child.addClass("selected");
					}
					else {
						changed = true;
					}
					lastClickedItem = child;
				}
				else if (shiftKey) {
					let lastIndex = lastClickedItem.index();
					let currentIndex = child.index();
					// Bring indices in a defined order
					let i1 = Math.min(lastIndex, currentIndex);
					let i2 = Math.max(lastIndex, currentIndex);
					// Replace selection with all items between these indices (inclusive)
					elem.children().removeClass("selected");
					for (let i = i1; i <= i2; i++) {
						let c = elem.children().eq(i);
						if (!c.hasClass("disabled"))
							c.addClass("selected");
					}
					changed = true;
				}
				else {
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
					let ctrlKey = !!event.originalEvent.ctrlKey;
					let shiftKey = !!event.originalEvent.shiftKey;
					if (!ctrlKey && !shiftKey) {
						elem.dropdown.close();
					}
				});
			}
		}
		
		// Updates the HTML select element's selection from the UI elements (selected CSS class).
		function updateHtmlSelect() {
			let selectedValues = [];
			elem.children().each$(function (_, child) {
				if (child.hasClass("selected"))
					selectedValues.push(child.data("value"));
			});

			htmlSelectChanging = true;
			htmlSelect.children("option").each$(function (_, option) {
				let selected = selectedValues.indexOf(option.prop("value")) !== -1;
				option.prop("selected", selected);
			});
			htmlSelect.change();
			htmlSelectChanging = false;
		}

		// Recreates the UI list elements from the HTML select options, including their selected
		// state.
		function updateFromHtmlSelect() {
			elem.children().remove();
			htmlSelect.children("option").each$(function (_, option) {
				let newOption = $("<div/>")
					.text(option.text())
					.data("value", option.prop("value"))
					.appendTo(elem);
				if (option.data("html"))
					newOption.html(option.data("html"))
				if (option.data("summary"))
					newOption.data("summary", option.data("summary"))
				if (option.data("summary-html"))
					newOption.data("summary-html", option.data("summary-html"))
				if (option.prop("selected"))
					newOption.addClass("selected");
				if (option.prop("disabled"))
					newOption.addClass("disabled");
			});
		}

		// Updates the dropdown list button's text from the current selection.
		function updateButton() {
			let html = "";
			elem.children(".selected").each$(function (_, child) {
				if (html) html += opt.separator;
				let summaryText = child.data("summary");
				let summaryHtml = child.data("summary-html");
				if (summaryHtml)
					html += summaryHtml;
				else if (summaryText)
					html += summaryText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
				else
					html += child.html();
			});
			if (html) {
				button.html("<span>" + html + "</span>");
			}
			else {
				button.html("&nbsp;");
			}
		}
		
		// Moves (and optionally extends) the selected index up or down.
		function changeSelectedIndex(offset, extend) {
			let children = elem.children();
			let count = children.length;
			if (count > 0 && offset !== 0) {
				let index = lastSelectedItem ? lastSelectedItem.index() : lastClickedItem.index();
				if (offset === -1 || offset === 1) {
					if (!lastClickedItem.hasClass("selected")) {
						// Select the lastClickedItem itself first, not one below/above it
					}
					else {
						// Move selection until an enabled item was found
						do {
							index += offset;
							if (index < 0 || index >= count) return;   // Nothing found
						}
						while (children.eq(index).hasClass("disabled"));
					}
				}
				else if (offset < 0) {
					// Move selection to the first enabled item
					index = elem.children(":not(.disabled)").first().index();
				}
				else if (offset > 0) {
					// Move selection to the last enabled item
					index = elem.children(":not(.disabled)").last().index();
				}
				if (index === -1) return;   // Nothing found

				children.removeClass("selected");
				if (extend) {
					let lastIndex = lastClickedItem.index();
					// Bring indices in a defined order
					let i1 = Math.min(lastIndex, index);
					let i2 = Math.max(lastIndex, index);
					// Replace selection with all items between these indices (inclusive)
					for (let i = i1; i <= i2; i++) {
						let c = children.eq(i);
						if (!c.hasClass("disabled"))
							c.addClass("selected");
					}
					lastSelectedItem = children.eq(index);
				}
				else {
					lastClickedItem = children.eq(index);
					lastClickedItem.addClass("selected");
					lastSelectedItem = lastClickedItem;
				}
				if (replaceHtmlSelect)
					updateHtmlSelect();
			}
		}

		// Selects all items, if allowed.
		function selectAll() {
			if (opt.multiple || opt.toggle) {
				elem.children(":not(.disabled)").addClass("selected");
				if (replaceHtmlSelect)
					updateHtmlSelect();
			}
		}

		// Deselects all items, if allowed.
		function selectNone() {
			if (opt.allowEmpty) {
				elem.children().removeClass("selected");
				if (replaceHtmlSelect)
					updateHtmlSelect();
			}
		}

		// Selects a single item.
		function selectItem(item) {
			elem.children().removeClass("selected");
			item.addClass("selected");
			elem.trigger("selectionchange");
			if (replaceHtmlSelect)
				updateHtmlSelect();
		}
	});
}

// Notifies the selectable plugin about a new child that needs to be initialized.
function addChild(child) {
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
	addChild: addChild,
	removeChild: removeChild,
	getSelection: getSelection,
	selectAll: selectAll,
	selectNone: selectNone,
	selectItem: selectItem
});
$.fn.selectable.defaults = selectableDefaults;
