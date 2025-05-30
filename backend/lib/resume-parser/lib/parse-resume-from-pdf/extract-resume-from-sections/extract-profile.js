import { getSectionLinesByKeywords } from "./lib/get-section-lines.js";
import { isBold, hasNumber, hasComma, hasLetter, hasLetterAndIsAllUpperCase, } from "./lib/common-features.js";
import { getTextWithHighestFeatureScore } from "./lib/feature-scoring-system.js";
// Name
export var matchOnlyLetterSpaceOrPeriod = function (item) {
    return item.text.match(/^[a-zA-Z\s\.]+$/);
};
// Email
// Simple email regex: xxx@xxx.xxx (xxx = anything not space)
export var matchEmail = function (item) { return item.text.match(/\S+@\S+\.\S+/); };
var hasAt = function (item) { return item.text.includes("@"); };
// Phone
// Simple phone regex that matches (xxx)-xxx-xxxx where () and - are optional, - can also be space
export var matchPhone = function (item) {
    return item.text.match(/\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
};
var hasParenthesis = function (item) { return /\([0-9]+\)/.test(item.text); };
// Location
// Simple location regex that matches "<City>, <ST>"
export var matchCityAndState = function (item) {
    return item.text.match(/[A-Z][a-zA-Z\s]+, [A-Z]{2}/);
};
// Url
// Simple url regex that matches "xxx.xxx/xxx" (xxx = anything not space)
export var matchUrl = function (item) { return item.text.match(/\S+\.[a-z]+\/\S+/); };
// Match https://xxx.xxx where s is optional
var matchUrlHttpFallback = function (item) {
    return item.text.match(/https?:\/\/\S+\.\S+/);
};
// Match www.xxx.xxx
var matchUrlWwwFallback = function (item) {
    return item.text.match(/www\.\S+\.\S+/);
};
var hasSlash = function (item) { return item.text.includes("/"); };
// Summary
var has4OrMoreWords = function (item) { return item.text.split(" ").length >= 4; };
/**
 *              Unique Attribute
 * Name         Bold or Has all uppercase letter
 * Email        Has @
 * Phone        Has ()
 * Location     Has ,    (overlap with summary)
 * Url          Has slash
 * Summary      Has 4 or more words
 */
/**
 * Name -> contains only letters/space/period, e.g. Leonardo W. DiCaprio
 *         (it isn't common to include middle initial in resume)
 *      -> is bolded or has all letters as uppercase
 */
var NAME_FEATURE_SETS = [
    [matchOnlyLetterSpaceOrPeriod, 3, true],
    [isBold, 2],
    [hasLetterAndIsAllUpperCase, 2],
    // Match against other unique attributes
    [hasAt, -4], // Email
    [hasNumber, -4], // Phone
    [hasParenthesis, -4], // Phone
    [hasComma, -4], // Location
    [hasSlash, -4], // Url
    [has4OrMoreWords, -2], // Summary
];
// Email -> match email regex xxx@xxx.xxx
var EMAIL_FEATURE_SETS = [
    [matchEmail, 4, true],
    [isBold, -1], // Name
    [hasLetterAndIsAllUpperCase, -1], // Name
    [hasParenthesis, -4], // Phone
    [hasComma, -4], // Location
    [hasSlash, -4], // Url
    [has4OrMoreWords, -4], // Summary
];
// Phone -> match phone regex (xxx)-xxx-xxxx
var PHONE_FEATURE_SETS = [
    [matchPhone, 4, true],
    [hasLetter, -4], // Name, Email, Location, Url, Summary
];
// Location -> match location regex <City>, <ST>
var LOCATION_FEATURE_SETS = [
    [matchCityAndState, 4, true],
    [isBold, -1], // Name
    [hasAt, -4], // Email
    [hasParenthesis, -3], // Phone
    [hasSlash, -4], // Url
];
// URL -> match url regex xxx.xxx/xxx
var URL_FEATURE_SETS = [
    [matchUrl, 4, true],
    [matchUrlHttpFallback, 3, true],
    [matchUrlWwwFallback, 3, true],
    [isBold, -1], // Name
    [hasAt, -4], // Email
    [hasParenthesis, -3], // Phone
    [hasComma, -4], // Location
    [has4OrMoreWords, -4], // Summary
];
// Summary -> has 4 or more words
var SUMMARY_FEATURE_SETS = [
    [has4OrMoreWords, 4],
    [isBold, -1], // Name
    [hasAt, -4], // Email
    [hasParenthesis, -3], // Phone
    [matchCityAndState, -4, false], // Location
];
export var extractProfile = function (sections) {
    var lines = sections.profile || [];
    var textItems = lines.flat();
    var _a = getTextWithHighestFeatureScore(textItems, NAME_FEATURE_SETS), name = _a[0], nameScores = _a[1];
    var _b = getTextWithHighestFeatureScore(textItems, EMAIL_FEATURE_SETS), email = _b[0], emailScores = _b[1];
    var _c = getTextWithHighestFeatureScore(textItems, PHONE_FEATURE_SETS), phone = _c[0], phoneScores = _c[1];
    var _d = getTextWithHighestFeatureScore(textItems, LOCATION_FEATURE_SETS), location = _d[0], locationScores = _d[1];
    var _e = getTextWithHighestFeatureScore(textItems, URL_FEATURE_SETS), url = _e[0], urlScores = _e[1];
    var _f = getTextWithHighestFeatureScore(textItems, SUMMARY_FEATURE_SETS, undefined, true), summary = _f[0], summaryScores = _f[1];
    var summaryLines = getSectionLinesByKeywords(sections, ["summary"]);
    var summarySection = summaryLines
        .flat()
        .map(function (textItem) { return textItem.text; })
        .join(" ");
    var objectiveLines = getSectionLinesByKeywords(sections, ["objective"]);
    var objectiveSection = objectiveLines
        .flat()
        .map(function (textItem) { return textItem.text; })
        .join(" ");
    return {
        profile: {
            name: name,
            email: email,
            phone: phone,
            location: location,
            url: url,
            // Dedicated section takes higher precedence over profile summary
            summary: summarySection || objectiveSection || summary,
        },
        // For debugging
        profileScores: {
            name: nameScores,
            email: emailScores,
            phone: phoneScores,
            location: locationScores,
            url: urlScores,
            summary: summaryScores,
        },
    };
};
