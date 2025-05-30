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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
// Getting pdfjs to work is tricky. The following 3 lines would make it work
// https://stackoverflow.com/a/63486898/7699841
import pdfjs from "pdfjs-dist/legacy/build/pdf.js";
/**
 * Step 1: Read pdf and output textItems by concatenating results from each page.
 *
 * To make processing easier, it returns a new TextItem type, which removes unused
 * attributes (dir, transform), adds x and y positions, and replaces loaded font
 * name with original font name.
 *
 * @example
 * const onFileChange = async (e) => {
 *     const fileUrl = URL.createObjectURL(e.target.files[0]);
 *     const textItems = await readPdf(fileUrl);
 * }
 */
export var readPdf = function (fileBuffer) { return __awaiter(void 0, void 0, void 0, function () {
    var pdfAsTypedArray, pdfFile, textItems, _loop_1, i, isEmptySpace;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pdfAsTypedArray = convertBufToUint8Array(fileBuffer);
                return [4 /*yield*/, pdfjs.getDocument(pdfAsTypedArray).promise];
            case 1:
                pdfFile = _a.sent();
                textItems = [];
                _loop_1 = function (i) {
                    var page, textContent, commonObjs, pageTextItems;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, pdfFile.getPage(i)];
                            case 1:
                                page = _b.sent();
                                return [4 /*yield*/, page.getTextContent()];
                            case 2:
                                textContent = _b.sent();
                                // Wait for font data to be loaded
                                return [4 /*yield*/, page.getOperatorList()];
                            case 3:
                                // Wait for font data to be loaded
                                _b.sent();
                                commonObjs = page.commonObjs;
                                pageTextItems = textContent.items.map(function (item) {
                                    var _a = item, text = _a.str, dir = _a.dir, // Remove text direction
                                    transform = _a.transform, pdfFontName = _a.fontName, otherProps = __rest(_a, ["str", "dir", "transform", "fontName"]);
                                    // Extract x, y position of text item from transform.
                                    // As a side note, origin (0, 0) is bottom left.
                                    // Reference: https://github.com/mozilla/pdf.js/issues/5643#issuecomment-496648719
                                    var x = transform[4];
                                    var y = transform[5];
                                    // Use commonObjs to convert font name to original name (e.g. "GVDLYI+Arial-BoldMT")
                                    // since non system font name by default is a loaded name, e.g. "g_d8_f1"
                                    // Reference: https://github.com/mozilla/pdf.js/pull/15659
                                    var fontObj = commonObjs.get(pdfFontName);
                                    var fontName = fontObj.name;
                                    // pdfjs reads a "-" as "-­‐" in the resume example. This is to revert it.
                                    // Note "-­‐" is "-&#x00AD;‐" with a soft hyphen in between. It is not the same as "--"
                                    var newText = text.replace(/-­‐/g, "-");
                                    var newItem = __assign(__assign({}, otherProps), { fontName: fontName, text: newText, x: x, y: y });
                                    return newItem;
                                });
                                // Some pdf's text items are not in order. This is most likely a result of creating it
                                // from design softwares, e.g. canvas. The commented out method can sort pageTextItems
                                // by y position to put them back in order. But it is not used since it might be more
                                // helpful to let users know that the pdf is not in order.
                                // pageTextItems.sort((a, b) => Math.round(b.y) - Math.round(a.y));
                                // Add text items of each page to total
                                textItems.push.apply(textItems, pageTextItems);
                                return [2 /*return*/];
                        }
                    });
                };
                i = 1;
                _a.label = 2;
            case 2:
                if (!(i <= pdfFile.numPages)) return [3 /*break*/, 5];
                return [5 /*yield**/, _loop_1(i)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5:
                isEmptySpace = function (textItem) {
                    return !textItem.hasEOL && textItem.text.trim() === "";
                };
                textItems = textItems.filter(function (textItem) { return !isEmptySpace(textItem); });
                return [2 /*return*/, textItems];
        }
    });
}); };
/**
 * Convert Buffer to Uint8Array
 *
 * @param fileBuffer - Buffer<ArrayBufferLike> to convert
 * @returns Uint8Array
 */
function convertBufToUint8Array(fileBuffer) {
    return new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);
}
