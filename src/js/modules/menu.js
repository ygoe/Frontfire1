import { registerPlugin, initOptions, loadOptions } from "../plugin";

// Converts each selected list element into a menu. Submenus are opened for nested lists.
function menu() {
	return this.each(function () {
		var menu = $(this);
		var isVertical = menu.hasClass("vertical");
		var itemsWithSubmenu = menu.children("li").has("ul");
		itemsWithSubmenu.each(function () {
			var item = $(this);
			item.addClass("ff-has-submenu");
			var submenu = item.children("ul").first();
			if (submenu.hasClass("ff-submenu")) return;   // Already done
			submenu.addClass("ff-submenu dropdown");

			// Open submenu on click
			item.children("a").first().click(function (event) {
				event.preventDefault();
				if (item.disabled()) return;
				var ddOpt = {};
				if (isVertical) {
					ddOpt["placement"] = "right-top";
				}
				submenu.dropdown(item, ddOpt);
				item.addClass("open");
				submenu.one("dropdownclose", function () {
					item.removeClass("open");
				});
			});

			// Prepare separators
			submenu.children("li").each$(function () {
				if (this.text() === "-") {
					this.text("");
					this.addClass("separator");
				}
			});
		});
	});
}

registerPlugin("menu", menu);
