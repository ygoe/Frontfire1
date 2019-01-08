import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow } from "../util";

var selectableClass = "ff-selectable";

// Defines default options for the selectable plugin.
var selectableDefaults = {
	// Indicates whether multiple items can be selected. Default: false.
	multi: false,

	// Indicates whether a single click toggles the selection of an item. Default: false.
	toggle: false
};

// Makes the child elements in each selected element selectable.
function selectable(options) {
	return this.each(function () {
		var elem = this;
		var $elem = $(elem);
		if ($elem.hasClass(selectableClass)) return;   // Already done
		$elem.addClass(selectableClass);
		var opt = initOptions("selectable", selectableDefaults, $elem, {}, options);
		opt._prepareChild = prepareChild;

		$elem.children().each(prepareChild);
		
		function prepareChild() {
			var child = $(this);
			child.click(function (event) {
				event.preventDefault();
				event.stopPropagation();
				let ctrlKey = !!event.originalEvent.ctrlKey;
				if (!opt.multi) ctrlKey = false;
				if (opt.toggle) ctrlKey = true;
				let changed = false;
				if (ctrlKey) {
					child.toggleClass("selected");
					changed = true;
				}
				else {
					if (!child.hasClass("selected")) {
						$elem.children().removeClass("selected");
						child.addClass("selected");
						changed = true;
					}
				}
				if (changed) {
					$elem.trigger("selectionchange");
				}
			});
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

registerPlugin("selectable", selectable, {
	addChild: addChild,
	removeChild: removeChild,
	getSelection: getSelection
});
$.fn.selectable.defaults = selectableDefaults;
