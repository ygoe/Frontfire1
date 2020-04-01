import { registerPlugin, initOptions, loadOptions } from "../plugin";

// Converts each selected list element into a menu. Submenus are opened for nested lists.
function menu() {
	return this.each$(function (_, menu) {
		var isVertical = menu.hasClass("vertical");
		var itemsWithSubmenu = menu.children("li").has("ul");
		itemsWithSubmenu.each$(function (_, item) {
			item.addClass("ff-has-submenu");
			var submenu = item.children("ul").first();
			if (submenu.hasClass("ff-submenu")) return;   // Already done
			submenu.addClass("ff-submenu dropdown");
			if (item.closest("nav").length > 0)
				submenu.addClass("nav");

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
			submenu.children("li").each$(function (_, obj) {
				if (obj.text() === "-") {
					obj.text("");
					obj.addClass("separator");
				}
			});
			
			// Close submenu when clicking on one of its items
			submenu.find("li > a:not(.stay-open)").each$(function (_, obj) {
				obj.click(function () {
					submenu.dropdown.close();
				});
			});
		});
		
		// Replace # href with a true no-op
		menu.find("li > a[href='#']").attr("href", "javascript:");
	});
}

registerPlugin("menu", menu);
