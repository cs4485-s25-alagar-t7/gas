import { getSectionLinesByKeywords } from "./lib/get-section-lines.js";
import { DATE_FEATURE_SETS, hasNumber, getHasText, isBold, } from "./lib/common-features.js";
import { divideSectionIntoSubsections } from "./lib/subsections.js";
import { getTextWithHighestFeatureScore } from "./lib/feature-scoring-system.js";
import { getBulletPointsFromLines, getDescriptionsLineIdx, } from "./lib/bullet-points.js";
// prettier-ignore
var WORK_EXPERIENCE_KEYWORDS_LOWERCASE = ['work', 'experience', 'employment', 'history', 'job'];
// prettier-ignore
var JOB_TITLES = ['Accountant', 'Administrator', 'Advisor', 'Agent', 'Analyst', 'Apprentice', 'Architect', 'Assistant', 'Associate', 'Auditor', 'Bartender', 'Biologist', 'Bookkeeper', 'Buyer', 'Carpenter', 'Cashier', 'CEO', 'Clerk', 'Co-op', 'Co-Founder', 'Consultant', 'Coordinator', 'CTO', 'Developer', 'Designer', 'Director', 'Driver', 'Editor', 'Electrician', 'Engineer', 'Extern', 'Founder', 'Freelancer', 'Head', 'Intern', 'Janitor', 'Journalist', 'Laborer', 'Lawyer', 'Lead', 'Manager', 'Mechanic', 'Member', 'Nurse', 'Officer', 'Operator', 'Operation', 'Photographer', 'President', 'Producer', 'Recruiter', 'Representative', 'Researcher', 'Sales', 'Server', 'Scientist', 'Specialist', 'Supervisor', 'Teacher', 'Technician', 'Trader', 'Trainee', 'Treasurer', 'Tutor', 'Vice', 'VP', 'Volunteer', 'Webmaster', 'Worker'];
var hasJobTitle = function (item) {
    return JOB_TITLES.some(function (jobTitle) {
        return item.text.split(/\s/).some(function (word) { return word === jobTitle; });
    });
};
var hasMoreThan5Words = function (item) { return item.text.split(/\s/).length > 5; };
var JOB_TITLE_FEATURE_SET = [
    [hasJobTitle, 4],
    [hasNumber, -4],
    [hasMoreThan5Words, -2],
];
export var extractWorkExperience = function (sections) {
    var _a;
    var workExperiences = [];
    var workExperiencesScores = [];
    var lines = getSectionLinesByKeywords(sections, WORK_EXPERIENCE_KEYWORDS_LOWERCASE);
    var subsections = divideSectionIntoSubsections(lines);
    for (var _i = 0, subsections_1 = subsections; _i < subsections_1.length; _i++) {
        var subsectionLines = subsections_1[_i];
        var descriptionsLineIdx = (_a = getDescriptionsLineIdx(subsectionLines)) !== null && _a !== void 0 ? _a : 2;
        var subsectionInfoTextItems = subsectionLines
            .slice(0, descriptionsLineIdx)
            .flat();
        var _b = getTextWithHighestFeatureScore(subsectionInfoTextItems, DATE_FEATURE_SETS), date = _b[0], dateScores = _b[1];
        var _c = getTextWithHighestFeatureScore(subsectionInfoTextItems, JOB_TITLE_FEATURE_SET), jobTitle = _c[0], jobTitleScores = _c[1];
        var COMPANY_FEATURE_SET = [
            [isBold, 2],
            [getHasText(date), -4],
            [getHasText(jobTitle), -4],
        ];
        var _d = getTextWithHighestFeatureScore(subsectionInfoTextItems, COMPANY_FEATURE_SET, false), company = _d[0], companyScores = _d[1];
        var subsectionDescriptionsLines = subsectionLines.slice(descriptionsLineIdx);
        var descriptions = getBulletPointsFromLines(subsectionDescriptionsLines);
        workExperiences.push({ company: company, jobTitle: jobTitle, date: date, descriptions: descriptions });
        workExperiencesScores.push({
            companyScores: companyScores,
            jobTitleScores: jobTitleScores,
            dateScores: dateScores,
        });
    }
    return { workExperiences: workExperiences, workExperiencesScores: workExperiencesScores };
};
