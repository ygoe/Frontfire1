import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

var tabHeadersClass = "ff-tab-headers";
var tabPagesClass = "ff-tab-pages";

// Converts all div elements in each selected element into tab pages.
// The tab page headers are read from the div elements' title attribute.
function tabs() {
	return this.each(function () {
		var container = $(this);
		if (container.children("div." + tabHeadersClass).length !== 0) return;   // Already done

		var pageDivs = $(this).children("div");
		var activePage = pageDivs.filter(".active").first();
		var headers = $("<div/>").addClass(tabHeadersClass).appendTo(container);
		var pages = $("<div/>").addClass(tabPagesClass).appendTo(container);
		pageDivs.each(function () {
			var header = $("<a/>").attr("href", "#").attr("tabindex", "-1").text($(this).attr("title")).appendTo(headers);
			var page = $(this).removeAttr("title").detach().appendTo(pages);
			if (activePage.length === 0 || activePage[0] === page[0]) {
				header.addClass("active").removeAttr("tabindex");
				page.addClass("active");
				activePage = page;
			}
			header.click(function (event) {
				event.preventDefault();
				container.tabs.activeTab(page);
			});
			header.keydown(function (event) {
				if (event.which === 37) {   // Left
					event.preventDefault();
					header.prev().focus().click();
				}
				if (event.which === 39) {   // Right
					event.preventDefault();
					header.next().focus().click();
				}
				if (event.which === 36) {   // Home
					event.preventDefault();
					header.parent().children().first().focus().click();
				}
				if (event.which === 35) {   // End
					event.preventDefault();
					header.parent().children().last().focus().click();
				}
			});
		});
	});
}

// Gets the active page in a tab container.
//
// indexOrPage: Sets the active page in each selected tab container, either by index or the page.
function activeTab(indexOrPage) {
	// Getter
	if (indexOrPage === undefined) {
		return this.find("div." + tabPagesClass + " > .active").first();
	}

	// Setter
	return this.each(function () {
		var container = $(this);
		var headers = container.children("div." + tabHeadersClass).first();
		var pages = container.find("div." + tabPagesClass).first();
		var index, page;
		if ($.isNumeric(indexOrPage)) {
			index = +indexOrPage;
			page = pages.children().eq(index);
		}
		else {
			index = indexOrPage.index();
			page = indexOrPage;
		}

		if (page && !page.hasClass("active")) {
			headers.children().attr("tabindex", "-1");
			headers.children(".active").removeClass("active");
			headers.children().eq(index).addClass("active").removeAttr("tabindex");
			pages.children(".active").removeClass("active");
			page.addClass("active");
			container.trigger("activeTabChange");
		}
	});
}

registerPlugin("tabs", tabs, {
	activeTab: activeTab
});
