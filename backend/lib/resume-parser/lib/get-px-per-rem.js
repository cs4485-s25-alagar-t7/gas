export var getPxPerRem = function () {
    var bodyComputedStyle = getComputedStyle(document.querySelector("body"));
    return parseFloat(bodyComputedStyle["font-size"]) || 16;
};
