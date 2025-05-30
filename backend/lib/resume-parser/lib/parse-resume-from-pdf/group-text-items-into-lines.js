var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { BULLET_POINTS } from "./extract-resume-from-sections/lib/bullet-points.js";
/**
 * Step 2: Group text items into lines. This returns an array where each position
 * contains text items in the same line of the pdf file.
 */
export var groupTextItemsIntoLines = function (textItems) {
    var lines = [];
    // Group text items into lines based on hasEOL
    var line = [];
    for (var _i = 0, textItems_1 = textItems; _i < textItems_1.length; _i++) {
        var item = textItems_1[_i];
        // If item is EOL, add current line to lines and start a new empty line
        if (item.hasEOL) {
            if (item.text.trim() !== "") {
                line.push(__assign({}, item));
            }
            lines.push(line);
            line = [];
        }
        // Otherwise, add item to current line
        else if (item.text.trim() !== "") {
            line.push(__assign({}, item));
        }
    }
    // Add last line if there is item in last line
    if (line.length > 0) {
        lines.push(line);
    }
    // Many pdf docs are not well formatted, e.g. due to converting from other docs.
    // This creates many noises, where a single text item is divided into multiple
    // ones. This step is to merge adjacent text items if their distance is smaller
    // than a typical char width to filter out those noises.
    var typicalCharWidth = getTypicalCharWidth(lines.flat());
    for (var _a = 0, lines_1 = lines; _a < lines_1.length; _a++) {
        var line_1 = lines_1[_a];
        // Start from the end of the line to make things easier to merge and delete
        for (var i = line_1.length - 1; i > 0; i--) {
            var currentItem = line_1[i];
            var leftItem = line_1[i - 1];
            var leftItemXEnd = leftItem.x + leftItem.width;
            var distance = currentItem.x - leftItemXEnd;
            if (distance <= typicalCharWidth) {
                if (shouldAddSpaceBetweenText(leftItem.text, currentItem.text)) {
                    leftItem.text += " ";
                }
                leftItem.text += currentItem.text;
                // Update leftItem width to include currentItem after merge before deleting current item
                var currentItemXEnd = currentItem.x + currentItem.width;
                leftItem.width = currentItemXEnd - leftItem.x;
                line_1.splice(i, 1);
            }
        }
    }
    return lines;
};
// Sometimes a space is lost while merging adjacent text items. This accounts for some of those cases
var shouldAddSpaceBetweenText = function (leftText, rightText) {
    var leftTextEnd = leftText[leftText.length - 1];
    var rightTextStart = rightText[0];
    var conditions = [
        __spreadArray([":", ",", "|", "."], BULLET_POINTS, true).includes(leftTextEnd) &&
            rightTextStart !== " ",
        leftTextEnd !== " " && __spreadArray(["|"], BULLET_POINTS, true).includes(rightTextStart),
    ];
    return conditions.some(function (condition) { return condition; });
};
/**
 * Return the width of a typical character. (Helper util for groupTextItemsIntoLines)
 *
 * A pdf file uses different characters, each with different width due to different
 * font family and font size. This util first extracts the most typically used font
 * family and font height, and compute the average character width using text items
 * that match the typical font family and height.
 */
var getTypicalCharWidth = function (textItems) {
    // Exclude empty space " " in calculations since its width isn't precise
    textItems = textItems.filter(function (item) { return item.text.trim() !== ""; });
    var heightToCount = {};
    var commonHeight = 0;
    var heightMaxCount = 0;
    var fontNameToCount = {};
    var commonFontName = "";
    var fontNameMaxCount = 0;
    for (var _i = 0, textItems_2 = textItems; _i < textItems_2.length; _i++) {
        var item = textItems_2[_i];
        var text = item.text, height = item.height, fontName = item.fontName;
        // Process height
        if (!heightToCount[height]) {
            heightToCount[height] = 0;
        }
        heightToCount[height]++;
        if (heightToCount[height] > heightMaxCount) {
            commonHeight = height;
            heightMaxCount = heightToCount[height];
        }
        // Process font name
        if (!fontNameToCount[fontName]) {
            fontNameToCount[fontName] = 0;
        }
        fontNameToCount[fontName] += text.length;
        if (fontNameToCount[fontName] > fontNameMaxCount) {
            commonFontName = fontName;
            fontNameMaxCount = fontNameToCount[fontName];
        }
    }
    // Find the text items that match common font family and height
    var commonTextItems = textItems.filter(function (item) { return item.fontName === commonFontName && item.height === commonHeight; });
    // Aggregate total width and number of characters of all common text items
    var _a = commonTextItems.reduce(function (acc, cur) {
        var preWidth = acc[0], prevChars = acc[1];
        return [preWidth + cur.width, prevChars + cur.text.length];
    }, [0, 0]), totalWidth = _a[0], numChars = _a[1];
    var typicalCharWidth = totalWidth / numChars;
    return typicalCharWidth;
};
