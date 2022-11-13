﻿import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow } from "../util";

var accordionClass = "ff-accordion";

// Defines default options for the accordion plugin.
var accordionDefaults = {
	// Exclusive mode allows only one item to be expanded at a time. Default: false.
	exclusive: false,
	// Offset to consider when scrolling to an item, when there are fixed elements at the top. Default: 0.
	scrollOffset: 0,
	// Element whose height to consider when scrolling to an item. Both offsets are added. Default: null.
	scrollOffsetElement: null
};

// Converts all div elements in each selected element into accordion pages.
function accordion(options) {
	return this.each(function (_, obj) {
		var accordion = $(obj);
		if (accordion.hasClass(accordionClass)) return;   // Already done
		var opt = initOptions("accordion", accordionDefaults, accordion, {}, options);

		accordion.addClass(accordionClass);
		var items = accordion.children("div");
		items.each$(function (_, item) {
			var header = item.children("div").first();
			var content = item.children("div").last();

			header.css("transition", "none");
			header.addClass("ff-accordion-header");
			forceReflow();
			header.css("transition", "");
			header.attr("tabindex", "0");

			content.addClass("ff-accordion-content");
			
			header.click(function () {
				if (content[0].clientHeight) {
					accordion.accordion.collapse(item);
				} else {
					accordion.accordion.expand(item);
				}
			});
			header.keydown(function (event) {
				if (event.which === 13) {   // Enter
					event.preventDefault();
					header.click();
				}
			});

			var id = item.attr("id");
			if (id !== undefined && location.hash === "#" + id) {
				// Manually set item expanded
				item.addClass("expanded");
				content.css("height", "auto");
				$(function() {
					let offset = opt.scrollOffset || 0;
					if (opt.scrollOffsetElement) {
						offset += $(opt.scrollOffsetElement).height();
					}
					$("html,body").animate({ scrollTop: item.offset().top - offset });
				});
			}
			else {
				content.css("transition", "none");
				accordion.accordion.collapse(item);
				forceReflow();
				content.css("transition", "");
			}
		});
	});
}

function collapse(indexOrItem) {
	return this.each(function (_, obj) {
		var accordion = $(obj);
		var opt = loadOptions("accordion", accordion);

		var items = accordion.children("div");
		if (indexOrItem === undefined) {
			// Collapse all items
			items.each(function (_, obj) {
				accordion.accordion.collapse(obj);
			});
			return;
		}

		var item;
		if ($.isNumeric(indexOrItem)) {
			item = items.eq(+indexOrItem);
		}
		else {
			item = $(indexOrItem);
		}

		var content = item.children("div.ff-accordion-content").first();
		if (!content.hasClass("ff-fixed-height")) {
			content.css("height", content[0].scrollHeight);   // explicitly set to current value
			forceReflow();
			content.css("height", 0);   // now animate to 0
			content.addClass("ff-fixed-height");
			item.removeClass("expanded");

			accordion.triggerNative("itemCollapse", { item: item });
		}

		var id = item.attr("id");
		if (id !== undefined && location.hash === "#" + id) {
			history.replaceState(null, document.title, location.pathname + location.search);
		}
	});
}

function expand(indexOrItem) {
	return this.each(function (_, obj) {
		var accordion = $(obj);
		var opt = loadOptions("accordion", accordion);

		var items = accordion.children("div");
		if (indexOrItem === undefined && !opt.exclusive) {
			// Expand all items
			items.each(function (_, obj) {
				accordion.accordion.expand(obj);
			});
			return;
		}

		var item;
		if ($.isNumeric(indexOrItem)) {
			item = items.eq(+indexOrItem);
		}
		else {
			item = $(indexOrItem);
		}

		var content = item.children("div.ff-accordion-content").first();
		if (content[0].clientHeight) {
			return;   // Already expanded
		}
		content.css("height", content[0].scrollHeight);   // animate to desired height
		function onTransitionEnd(event) {
			if (event.originalEvent.propertyName == "height") {
				content.css("height", "auto");   // allow free layout again after animation has completed
				content.off("transitionend", onTransitionEnd);
				content.removeClass("ff-fixed-height");
			}
		}
		content.on("transitionend", onTransitionEnd);
		item.addClass("expanded");

		accordion.triggerNative("itemExpand", { item: item });

		var previousItemCollapsedHeight = 0;
		if (opt.exclusive) {
			let passedExpandedItem = false;
			items.each(function (_, obj) {
				if (obj !== item[0]) {
					if (!passedExpandedItem)
						previousItemCollapsedHeight += $(obj).children("div.ff-accordion-content").height();
					accordion.accordion.collapse(obj);
				}
				else {
					passedExpandedItem = true;
				}
			});
		}

		// If a previous item was collapsed, scroll so that the expanded header stays where it is on the screen
		//if (previousItemCollapsedHeight) {
		//	$("html,body").animate({ scrollTop: "-=" + previousItemCollapsedHeight }, 200);
		//}
		
		// TODO: At least keep the expanded header visible if a previous item was collapsed

		// TODO: Maybe also scroll to make the new content section visible as much as possible, while not pushing out its header (option)

		var id = item.attr("id");
		if (id !== undefined) {
			history.replaceState(null, document.title, "#" + id);
		}
	});
}

registerPlugin("accordion", accordion, {
	collapse: collapse,
	expand: expand
});
$.fn.accordion.defaults = accordionDefaults;
