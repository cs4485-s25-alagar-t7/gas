import { getSectionLinesByKeywords } from "./lib/get-section-lines.js";
import { divideSectionIntoSubsections } from "./lib/subsections.js";
import { DATE_FEATURE_SETS, hasComma, hasLetter, hasNumber, } from "./lib/common-features.js";
import { getTextWithHighestFeatureScore } from "./lib/feature-scoring-system.js";
import { getBulletPointsFromLines, getDescriptionsLineIdx, } from "./lib/bullet-points.js";
/**
 *              Unique Attribute
 * School       Has school
 * Degree       Has degree
 * GPA          Has number
 */
// prettier-ignore
var SCHOOLS = ['College', 'University', 'Institute', 'School', 'Academy', 'BASIS', 'Magnet'];
var hasSchool = function (item) {
    return SCHOOLS.some(function (school) { return item.text.includes(school); });
};
// prettier-ignore
var DEGREES = ["Associate", "Bachelor", "Master", "PhD", "Ph.", "Doctor"];
var hasDegree = function (item) {
    return DEGREES.some(function (degree) { return item.text.includes(degree); }) ||
        /[ABM][A-Z\.]/.test(item.text);
}; // Match AA, B.S., MBA, etc.
var matchGPA = function (item) { return item.text.match(/[0-4]\.\d{1,2}/); };
var matchGrade = function (item) {
    var grade = parseFloat(item.text);
    if (Number.isFinite(grade) && grade <= 110) {
        return [String(grade)];
    }
    return null;
};
var SCHOOL_FEATURE_SETS = [
    [hasSchool, 4],
    [hasDegree, -4],
    [hasNumber, -4],
];
var DEGREE_FEATURE_SETS = [
    [hasDegree, 4],
    [hasSchool, -4],
    [hasNumber, -3],
];
var GPA_FEATURE_SETS = [
    [matchGPA, 4, true],
    [matchGrade, 3, true],
    [hasComma, -3],
    [hasLetter, -4],
];
export var extractEducation = function (sections) {
    var educations = [];
    var educationsScores = [];
    var lines = getSectionLinesByKeywords(sections, ["education"]);
    var subsections = divideSectionIntoSubsections(lines);
    for (var _i = 0, subsections_1 = subsections; _i < subsections_1.length; _i++) {
        var subsectionLines = subsections_1[_i];
        var textItems = subsectionLines.flat();
        var _a = getTextWithHighestFeatureScore(textItems, SCHOOL_FEATURE_SETS), school = _a[0], schoolScores = _a[1];
        var _b = getTextWithHighestFeatureScore(textItems, DEGREE_FEATURE_SETS), degree = _b[0], degreeScores = _b[1];
        var _c = getTextWithHighestFeatureScore(textItems, GPA_FEATURE_SETS), gpa = _c[0], gpaScores = _c[1];
        var _d = getTextWithHighestFeatureScore(textItems, DATE_FEATURE_SETS), date = _d[0], dateScores = _d[1];
        var descriptions = [];
        var descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines);
        if (descriptionsLineIdx !== undefined) {
            var descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
            descriptions = getBulletPointsFromLines(descriptionsLines);
        }
        educations.push({ school: school, degree: degree, gpa: gpa, date: date, descriptions: descriptions });
        educationsScores.push({
            schoolScores: schoolScores,
            degreeScores: degreeScores,
            gpaScores: gpaScores,
            dateScores: dateScores,
        });
    }
    if (educations.length !== 0) {
        var coursesLines = getSectionLinesByKeywords(sections, ["course"]);
        if (coursesLines.length !== 0) {
            educations[0].descriptions.push("Courses: " +
                coursesLines
                    .flat()
                    .map(function (item) { return item.text; })
                    .join(" "));
        }
    }
    return {
        educations: educations,
        educationsScores: educationsScores,
    };
};
