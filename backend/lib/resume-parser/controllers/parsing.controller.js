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
import Router from 'express';
import { parseResume } from '../services/parsing.service.js';
import multer from 'multer';
import AdmZip from 'adm-zip';
// create a multer instance to handle file uploads
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
var router = Router();
// endpoint to parse resumes. Expects a multipart/form-data request with a zip file of pdfs
// unzips the file and parses each pdf file in the zip file
// then saves the parsed resume data to the database
// returns a status code 200 if successful
router.post('/parse-resumes', upload.single('file'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var zipBuffer, zip, parsedResumes, _loop_1, _i, _a, file, state_1, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                if (!req.file) {
                    res.status(400).json({ error: 'No file uploaded' });
                    return [2 /*return*/];
                }
                zipBuffer = req.file.buffer;
                zip = new AdmZip(zipBuffer);
                if (!zip) {
                    res.status(400).json({ error: 'Invalid zip file' });
                    return [2 /*return*/];
                }
                parsedResumes = [];
                _loop_1 = function (file) {
                    var pdfBuffer, parsedData;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!file.entryName.endsWith('.pdf')) return [3 /*break*/, 3];
                                return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        file.getDataAsync(function (data, err) {
                                            if (err) {
                                                reject(err);
                                            }
                                            else {
                                                resolve(data);
                                            }
                                        });
                                    })];
                            case 1:
                                pdfBuffer = _c.sent();
                                if (!pdfBuffer) {
                                    res.status(400).json({ error: 'Invalid pdf file' });
                                    return [2 /*return*/, { value: void 0 }];
                                }
                                return [4 /*yield*/, parseResume(pdfBuffer)];
                            case 2:
                                parsedData = _c.sent();
                                // TODO: save parsedData to database
                                // await saveResumeInfoToDB(parsedData);
                                parsedResumes.push(parsedData);
                                _c.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, _a = zip.getEntries();
                _b.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                file = _a[_i];
                return [5 /*yield**/, _loop_1(file)];
            case 2:
                state_1 = _b.sent();
                if (typeof state_1 === "object")
                    return [2 /*return*/, state_1.value];
                _b.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                res.status(200).json({ message: 'Resumes parsed and saved successfully', data: parsedResumes });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('Error parsing resumes:', error_1);
                res.status(500).json({ error: 'Failed to parse resumes' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
export default router;
