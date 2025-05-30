var isTextItemBold = function (fontName) {
    return fontName.toLowerCase().includes("bold");
};
export var isBold = function (item) { return isTextItemBold(item.fontName); };
export var hasLetter = function (item) { return /[a-zA-Z]/.test(item.text); };
export var hasNumber = function (item) { return /[0-9]/.test(item.text); };
export var hasComma = function (item) { return item.text.includes(","); };
export var getHasText = function (text) { return function (item) {
    return item.text.includes(text);
}; };
export var hasOnlyLettersSpacesAmpersands = function (item) {
    return /^[A-Za-z\s&]+$/.test(item.text);
};
export var hasLetterAndIsAllUpperCase = function (item) {
    return hasLetter(item) && item.text.toUpperCase() === item.text;
};
// Date Features
var hasYear = function (item) { return /(?:19|20)\d{2}/.test(item.text); };
// prettier-ignore
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var hasMonth = function (item) {
    return MONTHS.some(function (month) {
        return item.text.includes(month) || item.text.includes(month.slice(0, 4));
    });
};
var SEASONS = ["Summer", "Fall", "Spring", "Winter"];
var hasSeason = function (item) {
    return SEASONS.some(function (season) { return item.text.includes(season); });
};
var hasPresent = function (item) { return item.text.includes("Present"); };
export var DATE_FEATURE_SETS = [
    [hasYear, 1],
    [hasMonth, 1],
    [hasSeason, 1],
    [hasPresent, 1],
    [hasComma, -1],
];
