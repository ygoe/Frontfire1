import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

var tabHeadersClass = "ff-tab-headers";
var tabPagesClass = "ff-tab-pages";

// Defines default options for the tabs plugin.
var tabsDefaults = {
};

// Converts all div elements in each selected element into tab pages.
// The tab page headers are read from the div elements' title attribute.
function tabs(options) {
	return this.each(function () {
		var container = $(this);
		if (container.children("div." + tabHeadersClass).length !== 0) return;   // Already done
		var opt = initOptions("tabs", tabsDefaults, container, {}, options);
		opt._addTab = addTab;

		var pageDivs = $(this).children("div");
		var activePage = pageDivs.filter(".active").first();
		var headers = $("<div/>").addClass(tabHeadersClass).appendTo(container);
		var pages = $("<div/>").addClass(tabPagesClass).appendTo(container);
		pageDivs.each(addTab);
		
		function addTab() {
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
		}
	});
}

// Adds a new tab page and header from a page div element.
//
// page: The new tab page to add. It does not have to be added to the DOM yet.
function addTab(page) {
	var tabs = $(this);
	var opt = loadOptions("tabs", tabs);
	opt._addTab.call(page);
}

// Removes a tab page and header.
//
// indexOrPage: The tab page to remove, either by index or the page.
function removeTab(indexOrPage) {
	var container = $(this);
	var headers = container.children("div." + tabHeadersClass).first();
	var pages = container.find("div." + tabPagesClass).first();
	var index = indexOrPage;
	if (!$.isNumeric(indexOrPage)) {
		index = indexOrPage.index();
	}
	var count = pages.children().length;
	var header = headers.children().eq(index);
	var page = pages.children().eq(index);
	header.remove();
	page.remove();
	if (page.hasClass("active")) {
		// Activate another tab
		let newIndex = Math.min(index, count - 2);
		if (newIndex >= 0)
			container.tabs.activeTab(newIndex);
	}
}

// Gets the title of a tab page in a tab container.
//
// indexOrPage: The tab page, either by index or the page.
// title: Sets the title.
function title(indexOrPage, title) {
	var container = $(this);
	var headers = container.children("div." + tabHeadersClass).first();
	var index = indexOrPage;
	if (!$.isNumeric(indexOrPage)) {
		index = indexOrPage.index();
	}
	var header = headers.children().eq(index);
	
	// Getter
	if (title === undefined) {
		return header.text();
	}
	
	// Setter
	header.text(title);
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

// Gets all page div elements.
function pages() {
	var container = $(this);
	var pages = container.find("div." + tabPagesClass).first();
	return pages.children();
}

// Moves a tab to another position.
function moveTab(indexOrPage, newIndex) {
	var container = $(this);
	var headers = container.children("div." + tabHeadersClass).first();
	var pages = container.find("div." + tabPagesClass).first();
	var index = indexOrPage;
	if (!$.isNumeric(indexOrPage)) {
		index = indexOrPage.index();
	}
	var headersChildren = headers.children();
	var pagesChildren = pages.children();
	var count = pagesChildren.length;
	var header = headersChildren.eq(index);
	var page = pagesChildren.eq(index);
	var destHeader = headersChildren.eq(newIndex);
	var destPage = pagesChildren.eq(newIndex);
	if (destHeader.length === 0) {
		if (newIndex > 0) {
			// Move to end
			header.insertAfter(headersChildren.last());
			page.insertAfter(pagesChildren.last());
		}
		else {
			// Move to beginning
			header.insertBefore(headersChildren.first());
			page.insertBefore(pagesChildren.first());
		}
	}
	else if (newIndex > index) {
		// Move after newIndex
		header.insertAfter(destHeader);
		page.insertAfter(destPage);
	}
	else if (newIndex < index) {
		// Move before newIndex
		header.insertBefore(destHeader);
		page.insertBefore(destPage);
	}
}

registerPlugin("tabs", tabs, {
	addTab: addTab,
	removeTab: removeTab,
	title: title,
	activeTab: activeTab,
	pages: pages,
	moveTab: moveTab
});
$.fn.tabs.defaults = tabsDefaults;
