var computeFeatureScores = function (textItems, featureSets) {
    var textScores = textItems.map(function (item) { return ({
        text: item.text,
        score: 0,
        match: false,
    }); });
    for (var i = 0; i < textItems.length; i++) {
        var textItem = textItems[i];
        for (var _i = 0, featureSets_1 = featureSets; _i < featureSets_1.length; _i++) {
            var featureSet = featureSets_1[_i];
            var hasFeature = featureSet[0], score = featureSet[1], returnMatchingText = featureSet[2];
            var result = hasFeature(textItem);
            if (result) {
                var text = textItem.text;
                if (returnMatchingText && typeof result === "object") {
                    text = result[0];
                }
                var textScore = textScores[i];
                if (textItem.text === text) {
                    textScore.score += score;
                    if (returnMatchingText) {
                        textScore.match = true;
                    }
                }
                else {
                    textScores.push({ text: text, score: score, match: true });
                }
            }
        }
    }
    return textScores;
};
/**
 * Core util for the feature scoring system.
 *
 * It runs each text item through all feature sets and sums up the matching feature scores.
 * It then returns the text item with the highest computed feature score.
 */
export var getTextWithHighestFeatureScore = function (textItems, featureSets, returnEmptyStringIfHighestScoreIsNotPositive, returnConcatenatedStringForTextsWithSameHighestScore) {
    var _a;
    if (returnEmptyStringIfHighestScoreIsNotPositive === void 0) { returnEmptyStringIfHighestScoreIsNotPositive = true; }
    if (returnConcatenatedStringForTextsWithSameHighestScore === void 0) { returnConcatenatedStringForTextsWithSameHighestScore = false; }
    var textScores = computeFeatureScores(textItems, featureSets);
    var textsWithHighestFeatureScore = [];
    var highestScore = -Infinity;
    for (var _i = 0, textScores_1 = textScores; _i < textScores_1.length; _i++) {
        var _b = textScores_1[_i], text_1 = _b.text, score = _b.score;
        if (score >= highestScore) {
            if (score > highestScore) {
                textsWithHighestFeatureScore = [];
            }
            textsWithHighestFeatureScore.push(text_1);
            highestScore = score;
        }
    }
    if (returnEmptyStringIfHighestScoreIsNotPositive && highestScore <= 0)
        return ["", textScores];
    // Note: If textItems is an empty array, textsWithHighestFeatureScore[0] is undefined, so we default it to empty string
    var text = !returnConcatenatedStringForTextsWithSameHighestScore
        ? (_a = textsWithHighestFeatureScore[0]) !== null && _a !== void 0 ? _a : ""
        : textsWithHighestFeatureScore.map(function (s) { return s.trim(); }).join(" ");
    return [text, textScores];
};
