var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { deepClone } from "lib/deep-clone";
/**
 * makeObjectCharIterator is a generator function that iterates a start object to
 * match an end object state by iterating through each string character.
 *
 * Note: Start object and end object must have the same structure and same keys.
 *       And they must have string or array or object as values.
 *
 * @example
 * const start = {a : ""}
 * const end = {a : "abc"};
 * const iterator = makeObjectCharIterator(start, end);
 * iterator.next().value // {a : "a"}
 * iterator.next().value // {a : "ab"}
 * iterator.next().value // {a : "abc"}
 */
export function makeObjectCharIterator(start, end, level) {
    var object, _i, _a, _b, key, endValue, recursiveIterator, next, i;
    if (level === void 0) { level = 0; }
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                object = level === 0 ? deepClone(start) : start;
                _i = 0, _a = Object.entries(end);
                _c.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 10];
                _b = _a[_i], key = _b[0], endValue = _b[1];
                if (!(typeof endValue === "object")) return [3 /*break*/, 5];
                recursiveIterator = makeObjectCharIterator(object[key], endValue, level + 1);
                _c.label = 2;
            case 2:
                if (!true) return [3 /*break*/, 4];
                next = recursiveIterator.next();
                if (next.done) {
                    return [3 /*break*/, 4];
                }
                return [4 /*yield*/, deepClone(object)];
            case 3:
                _c.sent();
                return [3 /*break*/, 2];
            case 4: return [3 /*break*/, 9];
            case 5:
                i = 1;
                _c.label = 6;
            case 6:
                if (!(i <= endValue.length)) return [3 /*break*/, 9];
                object[key] = endValue.slice(0, i);
                return [4 /*yield*/, deepClone(object)];
            case 7:
                _c.sent();
                _c.label = 8;
            case 8:
                i++;
                return [3 /*break*/, 6];
            case 9:
                _i++;
                return [3 /*break*/, 1];
            case 10: return [2 /*return*/];
        }
    });
}
export var countObjectChar = function (object) {
    var count = 0;
    for (var _i = 0, _a = Object.values(object); _i < _a.length; _i++) {
        var value = _a[_i];
        if (typeof value === "object") {
            count += countObjectChar(value);
        }
        else if (typeof value === "string") {
            count += value.length;
        }
    }
    return count;
};
