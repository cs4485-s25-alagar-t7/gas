/**
 * List of bullet points
 * Reference: https://stackoverflow.com/questions/56540160/why-isnt-there-a-medium-small-black-circle-in-unicode
 * U+22C5   DOT OPERATOR (⋅)
 * U+2219   BULLET OPERATOR (∙)
 * U+1F784  BLACK SLIGHTLY SMALL CIRCLE (🞄)
 * U+2022   BULLET (•) -------- most common
 * U+2981   Z NOTATION SPOT (⦁)
 * U+26AB   MEDIUM BLACK CIRCLE (⚫︎)
 * U+25CF   BLACK CIRCLE (●)
 * U+2B24   BLACK LARGE CIRCLE (⬤)
 * U+26AC   MEDIUM SMALL WHITE CIRCLE ⚬
 * U+25CB   WHITE CIRCLE ○
 */
export var BULLET_POINTS = [
    "⋅",
    "∙",
    "🞄",
    "•",
    "⦁",
    "⚫︎",
    "●",
    "⬤",
    "⚬",
    "○",
];
/**
 * Convert bullet point lines into a string array aka descriptions.
 */
export var getBulletPointsFromLines = function (lines) {
    // Simply return all lines with text item joined together if there is no bullet point
    var firstBulletPointLineIndex = getFirstBulletPointLineIdx(lines);
    if (firstBulletPointLineIndex === undefined) {
        return lines.map(function (line) { return line.map(function (item) { return item.text; }).join(" "); });
    }
    // Otherwise, process and remove bullet points
    // Combine all lines into a single string
    var lineStr = "";
    for (var _i = 0, _a = lines.flat(); _i < _a.length; _i++) {
        var item = _a[_i];
        var text = item.text;
        // Make sure a space is added between 2 words
        if (!lineStr.endsWith(" ") && !text.startsWith(" ")) {
            lineStr += " ";
        }
        lineStr += text;
    }
    // Get the most common bullet point
    var commonBulletPoint = getMostCommonBulletPoint(lineStr);
    // Start line string from the beginning of the first bullet point
    var firstBulletPointIndex = lineStr.indexOf(commonBulletPoint);
    if (firstBulletPointIndex !== -1) {
        lineStr = lineStr.slice(firstBulletPointIndex);
    }
    // Divide the single string using bullet point as divider
    return lineStr
        .split(commonBulletPoint)
        .map(function (text) { return text.trim(); })
        .filter(function (text) { return !!text; });
};
var getMostCommonBulletPoint = function (str) {
    var bulletToCount = BULLET_POINTS.reduce(function (acc, cur) {
        acc[cur] = 0;
        return acc;
    }, {});
    var bulletWithMostCount = BULLET_POINTS[0];
    var bulletMaxCount = 0;
    for (var _i = 0, str_1 = str; _i < str_1.length; _i++) {
        var char = str_1[_i];
        if (bulletToCount.hasOwnProperty(char)) {
            bulletToCount[char]++;
            if (bulletToCount[char] > bulletMaxCount) {
                bulletWithMostCount = char;
            }
        }
    }
    return bulletWithMostCount;
};
var getFirstBulletPointLineIdx = function (lines) {
    for (var i = 0; i < lines.length; i++) {
        var _loop_1 = function (item) {
            if (BULLET_POINTS.some(function (bullet) { return item.text.includes(bullet); })) {
                return { value: i };
            }
        };
        for (var _i = 0, _a = lines[i]; _i < _a.length; _i++) {
            var item = _a[_i];
            var state_1 = _loop_1(item);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    }
    return undefined;
};
// Only consider words that don't contain numbers
var isWord = function (str) { return /^[^0-9]+$/.test(str); };
var hasAtLeast8Words = function (item) {
    return item.text.split(/\s/).filter(isWord).length >= 8;
};
export var getDescriptionsLineIdx = function (lines) {
    // The main heuristic to determine descriptions is to check if has bullet point
    var idx = getFirstBulletPointLineIdx(lines);
    // Fallback heuristic if the main heuristic doesn't apply (e.g. LinkedIn resume) to
    // check if the line has at least 8 words
    if (idx === undefined) {
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length === 1 && hasAtLeast8Words(line[0])) {
                idx = i;
                break;
            }
        }
    }
    return idx;
};
