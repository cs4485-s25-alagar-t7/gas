var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { hasLetterAndIsAllUpperCase, hasOnlyLettersSpacesAmpersands, isBold, } from "./extract-resume-from-sections/lib/common-features.js";
export var PROFILE_SECTION = "profile";
/**
 * Step 3. Group lines into sections
 *
 * Every section (except the profile section) starts with a section title that
 * takes up the entire line. This is a common pattern not just in resumes but
 * also in books and blogs. The resume parser uses this pattern to group lines
 * into the closest section title above these lines.
 */
export var groupLinesIntoSections = function (lines) {
    var _a;
    var sections = {};
    var sectionName = PROFILE_SECTION;
    var sectionLines = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var text = (_a = line[0]) === null || _a === void 0 ? void 0 : _a.text.trim();
        if (isSectionTitle(line, i)) {
            sections[sectionName] = __spreadArray([], sectionLines, true);
            sectionName = text;
            sectionLines = [];
        }
        else {
            sectionLines.push(line);
        }
    }
    if (sectionLines.length > 0) {
        sections[sectionName] = __spreadArray([], sectionLines, true);
    }
    return sections;
};
var SECTION_TITLE_PRIMARY_KEYWORDS = [
    "experience",
    "education",
    "project",
    "skill",
];
var SECTION_TITLE_SECONDARY_KEYWORDS = [
    "job",
    "course",
    "extracurricular",
    "objective",
    "summary", // LinkedIn generated resume has a summary section
    "award",
    "honor",
    "project",
];
var SECTION_TITLE_KEYWORDS = __spreadArray(__spreadArray([], SECTION_TITLE_PRIMARY_KEYWORDS, true), SECTION_TITLE_SECONDARY_KEYWORDS, true);
var isSectionTitle = function (line, lineNumber) {
    var isFirstTwoLines = lineNumber < 2;
    var hasMoreThanOneItemInLine = line.length > 1;
    var hasNoItemInLine = line.length === 0;
    if (isFirstTwoLines || hasMoreThanOneItemInLine || hasNoItemInLine) {
        return false;
    }
    var textItem = line[0];
    // The main heuristic to determine a section title is to check if the text is double emphasized
    // to be both bold and all uppercase, which is generally true for a well formatted resume
    if (isBold(textItem) && hasLetterAndIsAllUpperCase(textItem)) {
        return true;
    }
    // The following is a fallback heuristic to detect section title if it includes a keyword match
    // (This heuristics is not well tested and may not work well)
    var text = textItem.text.trim();
    var textHasAtMost2Words = text.split(" ").filter(function (s) { return s !== "&"; }).length <= 2;
    var startsWithCapitalLetter = /[A-Z]/.test(text.slice(0, 1));
    if (textHasAtMost2Words &&
        hasOnlyLettersSpacesAmpersands(textItem) &&
        startsWithCapitalLetter &&
        SECTION_TITLE_KEYWORDS.some(function (keyword) {
            return text.toLowerCase().includes(keyword);
        })) {
        return true;
    }
    return false;
};
