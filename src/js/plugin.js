// Registers a jQuery plugin.
//
// name: The name of the plugin.
// create: The plugin create function.
// obj: An object containing additional operation functions.
export function registerPlugin(name, create, obj) {
	// Define a new property for each jQuery object in which the plugin is accessible.
	// This property getter is called whenever the plugin or one of its additional functions is called.
	Object.defineProperty($.fn, name, {
		get: function () {
			// Plugin default function
			// Returned to make this property callable
			var ret = create;

			// Plugin additional functions, added to the returned function
			// Bound to whoever has called this property to pass on "this" to the next function
			for (let key in obj) {
				if ($.isFunction(obj[key])) {
					ret[key] = obj[key].bind(this);
				}
			}
			return ret;
		}
	});
}

// Determines the options to use for a plugin.
//
// name: The plugin name.
// defaults: The plugin's default options. Only properties defined in here are considered for data attributes.
// elem: The element to find data attributes in. Options are stored here, too.
// converters: An object that specifies a conversion function for each special data attribute.
// params: The options specified to the plugin function.
export function initOptions(name, defaults, elem, converters, params) {
	params = params || {};

	// Start with the defaults
	var opts = $.extend({}, defaults);

	// Look for a combined HTML data-opt attribute containing a JSON object
	var optValue = $(elem).data("opt");
	if (optValue !== undefined) {
		try {
			optValue = (new Function("return " + optValue + ";"))();
			opts = $.extend(opts, optValue);
		}
		catch (err) {
			console.error("ERROR: data-opt value for " + name + " cannot be parsed:", optValue, err);
		}
	}

	// Then overwrite with individual HTML data attributes
	for (let key in defaults) {
		// Only do the work if it's not overridden again by params
		if (params[key] === undefined) {
			let elemDataValue = $(elem).data("opt-" + key);
			if (elemDataValue !== undefined) {
				if ($.isFunction(converters[key])) {
					opts[key] = converters[key](elemDataValue);
				}
				else {
					opts[key] = elemDataValue;
				}
			}
		}
	}

	// Finally overwrite with params
	$.extend(opts, params);

	// Keep options in DOM element's data
	$(elem).data("ff-" + name + "-options", opts);

	return opts;
}

// Loads plugin options for additional plugin functions.
//
// name: The plugin name.
// elem: The element to find data attributes in. Options are stored here, too.
export function loadOptions(name, elem) {
	return $(elem).data("ff-" + name + "-options") || {};
}
