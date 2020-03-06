Frontfire Web Frontend Framework
================================

<img src="https://ygoe.github.io/Frontfire/images/frontfire.svg" width="150">

The Frontfire Web Frontend Framework offers essential styles and effects combined with a consistent set of interactive widgets and layout utilities.
It is suitable for web pages and web applications that need a modern and consistent look and feel and use responsive design to work on all devices and screen sizes.
All interactions are fully touch-aware and work with any type of pointing device.

Requirements
------------
Frontfire is built from the ground up to support modern and widespread web browsers.
This includes Mozilla Firefox, Google Chrome, Microsoft Edge and Apple Safari, but also the last version of Microsoft Internet Explorer 11.
This framework builds upon [jQuery](https://jquery.com) and was tested with version 3.2 and up.

Building
--------
Frontfire is written in modern JavaScript and SASS. The distribution files are converted to browser-compatible JavaScript and standard CSS with a set of public tools (CSS: sassc, csso; JavaScript: rollup, babel, uglifyjs) bundled in the [Mini Web Compiler](https://github.com/ygoe/MiniWebCompiler) application for Windows.

To customise the styles with the provided SASS variables, you can either build your own version of Frontfire and use the build output files statically, or just include all SASS source files into your web project and build the CSS file right there.

When building your own version, you can also leave out certain modules that you don’t need to further reduce the file size.

Demo
----
[Open the demo page](https://ygoe.github.io/Frontfire) to get an impression of how Frontfire looks and see it live and in action.

License
-------
[MIT license](https://github.com/ygoe/Frontfire/blob/master/LICENSE)
