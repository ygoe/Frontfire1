import { registerPlugin, initOptions, loadOptions } from "../plugin";

var galleryClass = "ff-gallery";
var galleryRowClass = "gallery-row";

// Defines default options for the gallery plugin.
var galleryDefaults = {
	// The desired image size (depending on sizeMode), in pixels. Default: 150.
	desiredSize: 150,
	
	// The allowed factor of exceeding the desired size in the last row before the row is left-aligned. Default: 1.2.
	allowedOversize: 1.2,
	
	// The layout size mode. Default: height.
	// Possible values: height, area
	// height: The desiredSize is the preferred row height.
	// area: The square value of desiredSize is the preferred image area.
	sizeMode: "height",

	// The spacing between the images, in pixels. Default: 10.
	gap: 10
};

// Shows a gallery layout for the element.
function gallery(options) {
	return this.each$(function (_, gallery) {
		if (gallery.hasClass(galleryClass)) return;   // Already done
		gallery.addClass(galleryClass);
		var opt = initOptions("gallery", galleryDefaults, gallery, {}, options);
		opt._relayout = relayout;
		
		// Validate options
		if (opt.desiredSize <= 0)
			opt.desiredSize = 150;
		if (["height", "area"].indexOf(opt.sizeMode) === -1)
			opt.sizeMode = "height";
		if (opt.gap < 0)
			opt.gap = 0;

		let images = [];
		let appendCount = 0;
		let rowImages = [];
		let rowWidthSum = 0;
		let currentGalleryWidth = gallery.width();
		let largeImages = [];
		
		// Create loading indicator
		let loadingRow = $("<div/>").addClass("loading-row").appendTo(gallery);
		$("<i/>").addClass("loading small").appendTo(loadingRow);

		// Finishes the layout of images in the current row. Scales images of a row exactly.
		let createRow = isLast => {
			// Find the correct row height for the images in the row (and the gaps in between)
			let normalisedWidthSum = 0;
			for (let i = 0; i < rowImages.length; i++) {
				let img = rowImages[i];
				if (img.tagName.toLowerCase() !== "img")
					img = img.querySelector("img");
				normalisedWidthSum += img.naturalWidth / img.naturalHeight;
			}
			let galleryWidth = gallery.width();
			let galleryWidthWithoutGaps = galleryWidth - (opt.gap * (rowImages.length - 1));
			let rowHeight = galleryWidthWithoutGaps / normalisedWidthSum;

			// Don't force-fill the row if the height would be too tall and it's the last row
			let fullWidth = true;
			if (isLast && opt.sizeMode === "height" && rowHeight > opt.desiredSize * opt.allowedOversize) {
				rowHeight = opt.desiredSize;
				fullWidth = false;
			}
			else if (isLast && opt.sizeMode === "area" && rowHeight * galleryWidthWithoutGaps / rowImages.length > opt.desiredSize * opt.desiredSize * opt.allowedOversize * opt.allowedOversize) {
				let avgAspectRatio = normalisedWidthSum / rowImages.length;
				rowHeight = Math.sqrt(opt.desiredSize * opt.desiredSize / avgAspectRatio);
				fullWidth = false;
			}

			// Create row
			let rows = gallery.children("." + galleryRowClass);
			let isFirstRow = rows.length === 0;
			let row = $("<div/>")
				.addClass(galleryRowClass);
			if (!fullWidth) {
				row.addClass("incomplete");
			}

			// Insert new rows at the beginning of the gallery, in order.
			// This keeps new rows before all remaining images and thus all images of the gallery
			// keep their order at all times (except for separated larger images).
			if (isFirstRow) {
				row.prependTo(gallery);
			}
			else {
				row.css("margin-top", opt.gap);
				let lastRow = rows[rows.length - 1];
				row.insertAfter(lastRow);
			}

			// Update loading indicator at the end of the gallery
			if (!isLast)
				loadingRow.appendTo(gallery);
			else
				loadingRow.remove();
			
			// Add all images with relative width (space is evenly distributed by flex layout, except in last row)
			for (let i = 0; i < rowImages.length; i++) {
				let elem = rowImages[i];
				let img = elem;
				if (img.tagName.toLowerCase() !== "img")
					img = img.querySelector("img");
				// The scaled width of the image for the given row height
				let scaledWidth = img.naturalWidth / img.naturalHeight * rowHeight;
				// A single gap, corrected for one less = The average gap for each image in a row
				let gap2 = opt.gap / rowImages.length * (rowImages.length - 1);
				// The fractional width of the image including its average gap share
				let swPercent = (scaledWidth + gap2) / galleryWidth * 100;
				$(elem)
					// Let the browser calculate back to the width, but for the actual total width, minus the fixed average gap share
					.css("width", "calc(" + swPercent + "% - " + gap2 + "px)")
					// Only the last row (which is not filled) needs explicit gaps
					.css("margin-left", !fullWidth && i > 0 ? opt.gap : 0)
					.appendTo(row);
				if (img !== elem) {
					$(img).css("width", "100%");
				}
			}
		};

		// Appends an image to the layout. Assigns images to a row.
		// If the <img> element is a direct child of the gallery, elem and img are the same.
		// Otherwise, elem is the direct child and img is the <img> element therein.
		let appendImage = (elem, img, isLast) => {
			if (elem.dataset.gallerySize == "large") {
				if (isLast) {
					createRow(false);
					for (let i = 0; i < largeImages.length; i++) {
						rowImages = [largeImages[i]];
						createRow(false);
					}
					largeImages = [];
					rowImages = [elem];
					createRow(true);
					rowImages = [];
					rowWidthSum = 0;
				}
				else {
					largeImages.push(elem);
				}
				return;
			}
			
			let scaledWidth;
			if (opt.sizeMode === "height") {
				scaledWidth = img.naturalWidth / img.naturalHeight * opt.desiredSize;
			}
			else {
				scaledWidth = Math.sqrt(opt.desiredSize * opt.desiredSize * img.naturalWidth / img.naturalHeight);
			}
			
			let galleryWidth = gallery.width();
			let myGap = rowWidthSum > 0 ? opt.gap : 0;
			let oldDist = Math.abs(galleryWidth - rowWidthSum);
			let newDist = Math.abs(galleryWidth - (rowWidthSum + myGap + scaledWidth));
			if (newDist < oldDist) {
				// We're nearer to the total width with this image, so keep it in the row
				rowImages.push(elem);
				rowWidthSum += myGap + scaledWidth;
			}
			else {
				// We're futher away from the total width with this image, so put it on a new row
				createRow(false);
				// Insert rows of retained large images
				for (let i = 0; i < largeImages.length; i++) {
					rowImages = [largeImages[i]];
					createRow(false);
				}
				largeImages = [];
				// Continue next row with current image
				rowImages = [elem];
				rowWidthSum = scaledWidth;
			}
			
			if (isLast) {
				if (largeImages.length > 0) {
					createRow(false);
					for (let i = 0; i < largeImages.length; i++) {
						rowImages = [largeImages[i]];
						createRow(i === largeImages.length - 1);
					}
					largeImages = [];
				}
				else {
					createRow(true);
				}
				rowImages = [];
				rowWidthSum = 0;
			}
		};

		// Appends the next image if it's loaded, repeats for all subsequent loaded images.
		let apendNextImages = () => {
			while (true) {
				if (appendCount >= images.length) {
					// All images appended
					return false;
				}
				let img = images[appendCount];
				if (img.tagName.toLowerCase() !== "img")
					img = img.querySelector("img");
				if (!img.complete || img.naturalWidth === 0) {
					// Image is not loaded
					return true;
				}
				let isLast = appendCount === images.length - 1;
				appendImage(images[appendCount], img, isLast);
				appendCount++;
			}
		};
		
		// Removes an image from the list that won't load.
		let removeImage = img => {
			// Should only affect images after appendCount, so that need not be corrected
			console.error("Removed image from gallery due to load error:", img.src);
			images = images.filter(i => i !== img);
		};

		// Scan all child elements and collect images, set up load event handlers
		gallery.children("img, a").each$((_, child) => {
			images.push(child[0]);
			let img = child;
			if (!img.is("img"))
				img = img.find("img");
			img.on("load", () => apendNextImages());
			img.on("error", () => { removeImage(child[0]); apendNextImages() });
		});
		apendNextImages();

		// Relayout on window resize
		$(window).on("resize", () => {
			let newGalleryWidth = gallery.width();
			if (newGalleryWidth !== currentGalleryWidth) {
				currentGalleryWidth = newGalleryWidth;
				relayout();
			}
		});

		function relayout() {
			gallery.children("." + galleryRowClass).remove();
			appendCount = 0;
			rowImages = [];
			rowWidthSum = 0;
			apendNextImages();
		}
	});
}

// Updates the layout of the gallery after a size change.
function relayout() {
	return this.each$(function (_, gallery) {
		var opt = loadOptions("gallery", gallery);
		opt._relayout();
	});
}

registerPlugin("gallery", gallery, {
	relayout: relayout
});
$.fn.gallery.defaults = galleryDefaults;
