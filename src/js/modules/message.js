import { registerPlugin, initOptions, loadOptions } from "../plugin";
import { minmax, round, forceReflow, bindInputButtonsDisabled, scrollIntoView, preventScrolling, stackElements } from "../util";

var messageCloseButtonClass = "ff-message-close-button";

// Makes each selected message div element closable by adding a close button to it.
function closableMessage() {
	return this.each(function () {
		var message = $(this);
		if (message.find("." + messageCloseButtonClass).length !== 0) return;   // Already added

		// Add close button
		var closeButton = $("<a/>").addClass(messageCloseButtonClass).attr("href", "#").appendTo(message);
		message.addClass("closable");
		closeButton.click(function (event) {
			event.preventDefault();
			if (event.button === 0) {
				message.closableMessage.close();
			}
		});
	});
}

// Closes each selected message div and removes it from the document.
function closeMessage() {
	return this.each(function () {
		var message = $(this);
		message.addClass("ff-closed");
		message.on("transitionend", function () {
			message.remove();
		});
	});
}

registerPlugin("closableMessage", closableMessage, {
	close: closeMessage
});
