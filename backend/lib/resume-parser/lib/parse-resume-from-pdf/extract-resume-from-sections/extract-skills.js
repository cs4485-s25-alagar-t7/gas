import { deepClone } from "../../deep-clone.js";
import { getSectionLinesByKeywords } from "./lib/get-section-lines.js";
import { initialFeaturedSkills } from "../../redux/resumeSlice.js";
import { getBulletPointsFromLines, getDescriptionsLineIdx, } from "./lib/bullet-points.js";
export var extractSkills = function (sections) {
    var _a;
    var lines = getSectionLinesByKeywords(sections, ["skill"]);
    var descriptionsLineIdx = (_a = getDescriptionsLineIdx(lines)) !== null && _a !== void 0 ? _a : 0;
    var descriptionsLines = lines.slice(descriptionsLineIdx);
    var descriptions = getBulletPointsFromLines(descriptionsLines);
    var featuredSkills = deepClone(initialFeaturedSkills);
    if (descriptionsLineIdx !== 0) {
        var featuredSkillsLines = lines.slice(0, descriptionsLineIdx);
        var featuredSkillsTextItems = featuredSkillsLines
            .flat()
            .filter(function (item) { return item.text.trim(); })
            .slice(0, 6);
        for (var i = 0; i < featuredSkillsTextItems.length; i++) {
            featuredSkills[i].skill = featuredSkillsTextItems[i].text;
        }
    }
    var skills = {
        featuredSkills: featuredSkills,
        descriptions: descriptions,
    };
    return { skills: skills };
};
