import { extractProfile } from "./extract-profile.js";
import { extractEducation } from "./extract-education.js";
import { extractWorkExperience } from "./extract-work-experience.js";
import { extractProject } from "./extract-project.js";
import { extractSkills } from "./extract-skills.js";
/**
 * Step 4. Extract resume from sections.
 *
 * This is the core of the resume parser to resume information from the sections.
 *
 * The gist of the extraction engine is a feature scoring system. Each resume attribute
 * to be extracted has a custom feature sets, where each feature set consists of a
 * feature matching function and a feature matching score if matched (feature matching
 * score can be a positive or negative number). To compute the final feature score of
 * a text item for a particular resume attribute, it would run the text item through
 * all its feature sets and sum up the matching feature scores. This process is carried
 * out for all text items within the section, and the text item with the highest computed
 * feature score is identified as the extracted resume attribute.
 */
export var extractResumeFromSections = function (sections) {
    var profile = extractProfile(sections).profile;
    var educations = extractEducation(sections).educations;
    var workExperiences = extractWorkExperience(sections).workExperiences;
    var projects = extractProject(sections).projects;
    var skills = extractSkills(sections).skills;
    return {
        profile: profile,
        educations: educations,
        workExperiences: workExperiences,
        projects: projects,
        skills: skills,
        custom: {
            descriptions: [],
        },
    };
};
