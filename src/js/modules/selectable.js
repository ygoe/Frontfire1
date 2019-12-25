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
	return this.each(function () {
		var elem = $(this);
		if (elem.hasClass(selectableClass)) return;   // Already done
		elem.addClass(selectableClass);
		var opt = initOptions("selectable", selectableDefaults, elem, {}, options);
		opt._prepareChild = prepareChild;
		opt._selectAll = selectAll;
		opt._selectNone = selectNone;

		let replaceHtmlSelect = elem[0].nodeName === "SELECT";
		let useDropdown = elem[0].nodeName === "SELECT" && !elem.attr("size");
		let htmlSelect, button;
		let htmlSelectChanging;
		
		if (replaceHtmlSelect) {
			htmlSelect = elem;
			htmlSelect.hide();
			opt.multiple |= htmlSelect.attr("multiple") !== undefined;
			let newSelect = $("<div/>")
				.addClass(selectableClass)
				.insertAfter(htmlSelect);
			elem = newSelect;
			updateFromHtmlSelect();
			if (useDropdown) {
				button = $("<div/>")
					.addClass("ff-selectable-button")
					.attr("tabindex", 0)
					.insertAfter(htmlSelect);
				newSelect.addClass("no-border dropdown bordered");
				updateButton();
				button.click(function () {
					button.addClass("open");
					newSelect.dropdown(button);
					newSelect.on("dropdownclose", function () {
						button.removeClass("open");
					});
					newSelect.parent(".ff-dropdown-container").css("min-width", button.outerWidth());
				});
				button.on("keydown", function (event) {
					//console.log(event);
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
			}

			htmlSelect.change(function () {
				if (!htmlSelectChanging) {
					updateFromHtmlSelect();
					elem.children().each(prepareChild);
					lastClickedItem = elem.children().first();
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
			lastClickedItem = elem.children().first();
		var lastSelectedItem;
		
		elem.on("keydown", function (event) {
			//console.log(event);
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
			child.click(function (event) {
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
					lastSelectedItem = child;
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
						elem.children().eq(i).addClass("selected");
					}
					changed = true;
					lastSelectedItem = child;
				}
				else {
					if (!child.hasClass("selected")) {
						elem.children().removeClass("selected");
						child.addClass("selected");
						changed = true;
					}
					lastClickedItem = child;
					lastSelectedItem = child;
				}
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
			htmlSelectChanging = true;
			htmlSelect.children("option").each$(function (_, option) {
				let selected = false;
				elem.children().each$(function (_, child) {
					if (child.data("value") === option.prop("value")) {
						selected = child.hasClass("selected");
						return false;
					}
				});
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
				if (option.prop("selected"))
					newOption.addClass("selected");
			});
		}

		// Updates the dropdown list button's text from the current selection.
		function updateButton() {
			let html = "";
			elem.children(".selected").each$(function (_, child) {
				if (html) html += opt.separator;
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
			let count = elem.children().length;
			if (count > 0) {
				let index = lastSelectedItem ? lastSelectedItem.index() : lastClickedItem.index();
				if ((offset === -1 || offset === 1) && !lastClickedItem.hasClass("selected")) {
					// Select the lastClickedItem itself first, not one below/above it
				}
				else {
					index += offset;
					if (index < 0)
						index = 0;
					if (index >= count)
						index = count - 1;
				}
				elem.children().removeClass("selected");
				if (extend) {
					let lastIndex = lastClickedItem.index();
					// Bring indices in a defined order
					let i1 = Math.min(lastIndex, index);
					let i2 = Math.max(lastIndex, index);
					// Replace selection with all items between these indices (inclusive)
					elem.children().removeClass("selected");
					for (let i = i1; i <= i2; i++) {
						elem.children().eq(i).addClass("selected");
					}
					lastSelectedItem = elem.children().eq(index);
				}
				else {
					lastClickedItem = elem.children().eq(index);
					lastClickedItem.addClass("selected");
					lastSelectedItem = lastClickedItem;
				}
				updateHtmlSelect();
			}
		}

		// Selects all items, if allowed.
		function selectAll() {
			if (opt.multiple || opt.toggle) {
				elem.children().addClass("selected");
				updateHtmlSelect();
			}
		}

		// Deselects all items, if allowed.
		function selectNone() {
			if (opt.allowEmpty) {
				elem.children().removeClass("selected");
				updateHtmlSelect();
			}
		}
	});
}

// Notifies the selectable plugin about a new child that needs to be initialized.
function addChild(child) {
	var selectable = $(this);
	var opt = loadOptions("selectable", selectable);
	opt._prepareChild.call(child);
}

// Notifies the selectable plugin about a removed child that may affect the selection.
function removeChild(child) {
	var selectable = $(this);
	if (child.hasClass("selected")) {
		selectable.trigger("selectionchange");
	}
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

registerPlugin("selectable", selectable, {
	addChild: addChild,
	removeChild: removeChild,
	getSelection: getSelection,
	selectAll: selectAll,
	selectNone: selectNone
});
$.fn.selectable.defaults = selectableDefaults;
