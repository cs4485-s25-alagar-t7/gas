/**
 * Return section lines that contain any of the keywords.
 */
export var getSectionLinesByKeywords = function (sections, keywords) {
    var _loop_1 = function (sectionName) {
        var hasKeyWord = keywords.some(function (keyword) {
            return sectionName.toLowerCase().includes(keyword);
        });
        if (hasKeyWord) {
            return { value: sections[sectionName] };
        }
    };
    for (var sectionName in sections) {
        var state_1 = _loop_1(sectionName);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return [];
};
