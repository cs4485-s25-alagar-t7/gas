import { BULLET_POINTS } from "./bullet-points.js";
import { isBold } from "./common-features.js";
/**
 * Divide lines into subsections based on difference in line gap or bold text.
 *
 * For profile section, we can directly pass all the text items to the feature
 * scoring systems. But for other sections, such as education and work experience,
 * we have to first divide the section into subsections since there can be multiple
 * schools or work experiences in the section. The feature scoring system then
 * process each subsection to retrieve each's resume attributes and append the results.
 */
export var divideSectionIntoSubsections = function (lines) {
    // The main heuristic to determine a subsection is to check if its vertical line gap
    // is larger than the typical line gap * 1.4
    var isLineNewSubsectionByLineGap = createIsLineNewSubsectionByLineGap(lines);
    var subsections = createSubsections(lines, isLineNewSubsectionByLineGap);
    // Fallback heuristic if the main heuristic doesn't apply to check if the text item is bolded
    if (subsections.length === 1) {
        var isLineNewSubsectionByBold = function (line, prevLine) {
            if (!isBold(prevLine[0]) &&
                isBold(line[0]) &&
                // Ignore bullet points that sometimes being marked as bolded
                !BULLET_POINTS.includes(line[0].text)) {
                return true;
            }
            return false;
        };
        subsections = createSubsections(lines, isLineNewSubsectionByBold);
    }
    return subsections;
};
var createIsLineNewSubsectionByLineGap = function (lines) {
    // Extract the common typical line gap
    var lineGapToCount = {};
    var linesY = lines.map(function (line) { return line[0].y; });
    var lineGapWithMostCount = 0;
    var maxCount = 0;
    for (var i = 1; i < linesY.length; i++) {
        var lineGap = Math.round(linesY[i - 1] - linesY[i]);
        if (!lineGapToCount[lineGap])
            lineGapToCount[lineGap] = 0;
        lineGapToCount[lineGap] += 1;
        if (lineGapToCount[lineGap] > maxCount) {
            lineGapWithMostCount = lineGap;
            maxCount = lineGapToCount[lineGap];
        }
    }
    // Use common line gap to set a sub section threshold
    var subsectionLineGapThreshold = lineGapWithMostCount * 1.4;
    var isLineNewSubsection = function (line, prevLine) {
        return Math.round(prevLine[0].y - line[0].y) > subsectionLineGapThreshold;
    };
    return isLineNewSubsection;
};
var createSubsections = function (lines, isLineNewSubsection) {
    var subsections = [];
    var subsection = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (i === 0) {
            subsection.push(line);
            continue;
        }
        if (isLineNewSubsection(line, lines[i - 1])) {
            subsections.push(subsection);
            subsection = [];
        }
        subsection.push(line);
    }
    if (subsection.length > 0) {
        subsections.push(subsection);
    }
    return subsections;
};
