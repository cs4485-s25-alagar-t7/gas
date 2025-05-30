import { getSectionLinesByKeywords } from "./lib/get-section-lines.js";
import { DATE_FEATURE_SETS, getHasText, isBold, } from "./lib/common-features.js";
import { divideSectionIntoSubsections } from "./lib/subsections.js";
import { getTextWithHighestFeatureScore } from "./lib/feature-scoring-system.js";
import { getBulletPointsFromLines, getDescriptionsLineIdx, } from "./lib/bullet-points.js";
export var extractProject = function (sections) {
    var _a;
    var projects = [];
    var projectsScores = [];
    var lines = getSectionLinesByKeywords(sections, ["project"]);
    var subsections = divideSectionIntoSubsections(lines);
    for (var _i = 0, subsections_1 = subsections; _i < subsections_1.length; _i++) {
        var subsectionLines = subsections_1[_i];
        var descriptionsLineIdx = (_a = getDescriptionsLineIdx(subsectionLines)) !== null && _a !== void 0 ? _a : 1;
        var subsectionInfoTextItems = subsectionLines
            .slice(0, descriptionsLineIdx)
            .flat();
        var _b = getTextWithHighestFeatureScore(subsectionInfoTextItems, DATE_FEATURE_SETS), date = _b[0], dateScores = _b[1];
        var PROJECT_FEATURE_SET = [
            [isBold, 2],
            [getHasText(date), -4],
        ];
        var _c = getTextWithHighestFeatureScore(subsectionInfoTextItems, PROJECT_FEATURE_SET, false), project = _c[0], projectScores = _c[1];
        var descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
        var descriptions = getBulletPointsFromLines(descriptionsLines);
        projects.push({ project: project, date: date, descriptions: descriptions });
        projectsScores.push({
            projectScores: projectScores,
            dateScores: dateScores,
        });
    }
    return { projects: projects, projectsScores: projectsScores };
};
