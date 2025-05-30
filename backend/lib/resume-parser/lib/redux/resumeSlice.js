var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
import { createSlice } from "@reduxjs/toolkit";
export var initialProfile = {
    name: "",
    summary: "",
    email: "",
    phone: "",
    location: "",
    url: "",
};
export var initialWorkExperience = {
    company: "",
    jobTitle: "",
    date: "",
    descriptions: [],
};
export var initialEducation = {
    school: "",
    degree: "",
    gpa: "",
    date: "",
    descriptions: [],
};
export var initialProject = {
    project: "",
    date: "",
    descriptions: [],
};
export var initialFeaturedSkill = { skill: "", rating: 4 };
export var initialFeaturedSkills = Array(6).fill(__assign({}, initialFeaturedSkill));
export var initialSkills = {
    featuredSkills: initialFeaturedSkills,
    descriptions: [],
};
export var initialCustom = {
    descriptions: [],
};
export var initialResumeState = {
    profile: initialProfile,
    workExperiences: [initialWorkExperience],
    educations: [initialEducation],
    projects: [initialProject],
    skills: initialSkills,
    custom: initialCustom,
};
export var resumeSlice = createSlice({
    name: "resume",
    initialState: initialResumeState,
    reducers: {
        changeProfile: function (draft, action) {
            var _a = action.payload, field = _a.field, value = _a.value;
            draft.profile[field] = value;
        },
        changeWorkExperiences: function (draft, action) {
            var _a = action.payload, idx = _a.idx, field = _a.field, value = _a.value;
            var workExperience = draft.workExperiences[idx];
            workExperience[field] = value;
        },
        changeEducations: function (draft, action) {
            var _a = action.payload, idx = _a.idx, field = _a.field, value = _a.value;
            var education = draft.educations[idx];
            education[field] = value;
        },
        changeProjects: function (draft, action) {
            var _a = action.payload, idx = _a.idx, field = _a.field, value = _a.value;
            var project = draft.projects[idx];
            project[field] = value;
        },
        changeSkills: function (draft, action) {
            var field = action.payload.field;
            if (field === "descriptions") {
                var value = action.payload.value;
                draft.skills.descriptions = value;
            }
            else {
                var _a = action.payload, idx = _a.idx, skill = _a.skill, rating = _a.rating;
                var featuredSkill = draft.skills.featuredSkills[idx];
                featuredSkill.skill = skill;
                featuredSkill.rating = rating;
            }
        },
        changeCustom: function (draft, action) {
            var value = action.payload.value;
            draft.custom.descriptions = value;
        },
        addSectionInForm: function (draft, action) {
            var form = action.payload.form;
            switch (form) {
                case "workExperiences": {
                    draft.workExperiences.push(structuredClone(initialWorkExperience));
                    return draft;
                }
                case "educations": {
                    draft.educations.push(structuredClone(initialEducation));
                    return draft;
                }
                case "projects": {
                    draft.projects.push(structuredClone(initialProject));
                    return draft;
                }
            }
        },
        moveSectionInForm: function (draft, action) {
            var _a = action.payload, form = _a.form, idx = _a.idx, direction = _a.direction;
            if (form !== "skills" && form !== "custom") {
                if ((idx === 0 && direction === "up") ||
                    (idx === draft[form].length - 1 && direction === "down")) {
                    return draft;
                }
                var section = draft[form][idx];
                if (direction === "up") {
                    draft[form][idx] = draft[form][idx - 1];
                    draft[form][idx - 1] = section;
                }
                else {
                    draft[form][idx] = draft[form][idx + 1];
                    draft[form][idx + 1] = section;
                }
            }
        },
        deleteSectionInFormByIdx: function (draft, action) {
            var _a = action.payload, form = _a.form, idx = _a.idx;
            if (form !== "skills" && form !== "custom") {
                draft[form].splice(idx, 1);
            }
        },
        setResume: function (draft, action) {
            return action.payload;
        },
    },
});
export var changeProfile = (_a = resumeSlice.actions, _a.changeProfile), changeWorkExperiences = _a.changeWorkExperiences, changeEducations = _a.changeEducations, changeProjects = _a.changeProjects, changeSkills = _a.changeSkills, changeCustom = _a.changeCustom, addSectionInForm = _a.addSectionInForm, moveSectionInForm = _a.moveSectionInForm, deleteSectionInFormByIdx = _a.deleteSectionInFormByIdx, setResume = _a.setResume;
export var selectResume = function (state) { return state.resume; };
export var selectProfile = function (state) { return state.resume.profile; };
export var selectWorkExperiences = function (state) {
    return state.resume.workExperiences;
};
export var selectEducations = function (state) { return state.resume.educations; };
export var selectProjects = function (state) { return state.resume.projects; };
export var selectSkills = function (state) { return state.resume.skills; };
export var selectCustom = function (state) { return state.resume.custom; };
export default resumeSlice.reducer;
