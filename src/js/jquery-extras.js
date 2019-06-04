import { bindInputButtonsDisabled } from "./util";

$.bindInputButtonsDisabled = bindInputButtonsDisabled;

// Define some more helper functions as jQuery plugins. Similar functions already exist in
// jQuery and these complement the set.

// A variant of $.each that uses $(this) as the called function's context instead of this.
$.fn.each$ = function (fn) {
	return this.each(function (index, element) {
		return fn.call($(this), index, element);
	});
};

// Variable tests

// Determines whether the value is set (i. e. not undefined or null).
$.isSet = value => typeof value !== "undefined" && value !== null;

// Determines whether the value is boolean.
$.isBoolean = value => typeof value === "boolean";

// Determines whether the value is a number.
$.isNumber = value => typeof value === "number";

// Determines whether the value is a string.
$.isString = value => typeof value === "string";

// Determines whether the value is an even number.
$.isEven = value => $.isNumber(value) && value % 2 === 0;

// Determines whether the value is an odd number.
$.isOdd = value => $.isNumber(value) && value % 2 === 1;

// Operating system tests

// Determines whether the client operating system is Android.
$.isAndroid = () => !!navigator.userAgent.match(/Android/);

// Determines whether the client operating system is iOS.
$.isIos = () => !!navigator.platform.match(/iPhone|iPad|iPod/);

// Determines whether the client operating system is Linux (not Android).
$.isLinux = () => !!navigator.platform.match(/Linux/) && !$.isAndroid();

// Determines whether the client operating system is macOS.
$.isMac = () => !!navigator.platform.match(/Mac/);

// Determines whether the client operating system is Windows.
$.isWindows = () => !!navigator.platform.match(/Win/);

if ($.isAndroid()) {
	$("html").addClass("simple-dimmer");
}

// Browser tests
// Source: https://stackoverflow.com/a/9851769

// Determines whether the browser has a Blink engine.
$.isBlink = () => ($.isChrome() || $.isOpera()) && !!window.CSS;

// Determines whether the browser is Chrome.
$.isChrome = () => !!window.chrome && !!window.chrome.webstore;

// Determines whether the browser is Edge.
$.isEdge = () => !$.isInternetExplorer() && !!window.StyleMedia;

// Determines whether the browser is Firefox.
$.isFirefox = () => typeof InstallTrigger !== 'undefined';

// Determines whether the browser is Internet Explorer.
$.isInternetExplorer = () => /*@cc_on!@*/false || !!document.documentMode;

// Determines whether the browser is Opera.
$.isOpera = () => (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Determines whether the browser is Safari.
$.isSafari = () => /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
