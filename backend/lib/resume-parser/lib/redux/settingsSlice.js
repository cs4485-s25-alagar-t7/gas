var _a;
import { createSlice } from "@reduxjs/toolkit";
export var DEFAULT_THEME_COLOR = "#38bdf8"; // sky-400
export var DEFAULT_FONT_FAMILY = "Roboto";
export var DEFAULT_FONT_SIZE = "11"; // text-base https://tailwindcss.com/docs/font-size
export var DEFAULT_FONT_COLOR = "#171717"; // text-neutral-800
export var initialSettings = {
    themeColor: DEFAULT_THEME_COLOR,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
    documentSize: "Letter",
    formToShow: {
        workExperiences: true,
        educations: true,
        projects: true,
        skills: true,
        custom: false,
    },
    formToHeading: {
        workExperiences: "WORK EXPERIENCE",
        educations: "EDUCATION",
        projects: "PROJECT",
        skills: "SKILLS",
        custom: "CUSTOM SECTION",
    },
    formsOrder: ["workExperiences", "educations", "projects", "skills", "custom"],
    showBulletPoints: {
        educations: true,
        projects: true,
        skills: true,
        custom: true,
    },
};
export var settingsSlice = createSlice({
    name: "settings",
    initialState: initialSettings,
    reducers: {
        changeSettings: function (draft, action) {
            var _a = action.payload, field = _a.field, value = _a.value;
            draft[field] = value;
        },
        changeShowForm: function (draft, action) {
            var _a = action.payload, field = _a.field, value = _a.value;
            draft.formToShow[field] = value;
        },
        changeFormHeading: function (draft, action) {
            var _a = action.payload, field = _a.field, value = _a.value;
            draft.formToHeading[field] = value;
        },
        changeFormOrder: function (draft, action) {
            var _a = action.payload, form = _a.form, type = _a.type;
            var lastIdx = draft.formsOrder.length - 1;
            var pos = draft.formsOrder.indexOf(form);
            var newPos = type === "up" ? pos - 1 : pos + 1;
            var swapFormOrder = function (idx1, idx2) {
                var temp = draft.formsOrder[idx1];
                draft.formsOrder[idx1] = draft.formsOrder[idx2];
                draft.formsOrder[idx2] = temp;
            };
            if (newPos >= 0 && newPos <= lastIdx) {
                swapFormOrder(pos, newPos);
            }
        },
        changeShowBulletPoints: function (draft, action) {
            var _a = action.payload, field = _a.field, value = _a.value;
            draft["showBulletPoints"][field] = value;
        },
        setSettings: function (draft, action) {
            return action.payload;
        },
    },
});
export var changeSettings = (_a = settingsSlice.actions, _a.changeSettings), changeShowForm = _a.changeShowForm, changeFormHeading = _a.changeFormHeading, changeFormOrder = _a.changeFormOrder, changeShowBulletPoints = _a.changeShowBulletPoints, setSettings = _a.setSettings;
export var selectSettings = function (state) { return state.settings; };
export var selectThemeColor = function (state) { return state.settings.themeColor; };
export var selectFormToShow = function (state) { return state.settings.formToShow; };
export var selectShowByForm = function (form) { return function (state) {
    return state.settings.formToShow[form];
}; };
export var selectFormToHeading = function (state) {
    return state.settings.formToHeading;
};
export var selectHeadingByForm = function (form) { return function (state) {
    return state.settings.formToHeading[form];
}; };
export var selectFormsOrder = function (state) { return state.settings.formsOrder; };
export var selectIsFirstForm = function (form) { return function (state) {
    return state.settings.formsOrder[0] === form;
}; };
export var selectIsLastForm = function (form) { return function (state) {
    return state.settings.formsOrder[state.settings.formsOrder.length - 1] === form;
}; };
export var selectShowBulletPoints = function (form) { return function (state) {
    return state.settings.showBulletPoints[form];
}; };
export default settingsSlice.reducer;
