/**
 * cx is a simple util to join classNames together. Think of it as a simplified version of the open source classnames util
 * Reference: https://dev.to/gugaguichard/replace-clsx-classnames-or-classcat-with-your-own-little-helper-3bf
 *
 * @example
 * cx('px-1', 'mt-2'); // => 'px-1 mt-2'
 * cx('px-1', true && 'mt-2'); // => 'px-1 mt-2'
 * cx('px-1', false && 'mt-2'); // => 'px-1'
 */
export var cx = function () {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    var newClasses = [];
    for (var _a = 0, classes_1 = classes; _a < classes_1.length; _a++) {
        var c = classes_1[_a];
        if (typeof c === "string") {
            newClasses.push(c.trim());
        }
    }
    return newClasses.join(" ");
};
