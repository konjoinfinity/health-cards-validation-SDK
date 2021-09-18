"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileData = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var file_type_1 = __importDefault(require("file-type"));
var pngjs_1 = require("pngjs");
var jpeg_js_1 = __importDefault(require("jpeg-js"));
var bmp_js_1 = require("bmp-js");
// Reads a file and determines what kind of file it is
function getFileData(filepath) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, fileInfo, textFileContent;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!fs_1.default.existsSync(filepath)) {
                        throw new Error("File not found : " + filepath);
                    }
                    buffer = fs_1.default.readFileSync(filepath);
                    _a = {
                        name: path_1.default.basename(filepath),
                        path: path_1.default.resolve(filepath),
                        ext: path_1.default.extname(filepath),
                        buffer: buffer
                    };
                    return [4 /*yield*/, file_type_1.default.fromBuffer(buffer)];
                case 1:
                    fileInfo = (_a.fileType = _b.sent(),
                        _a);
                    if (fileInfo.fileType) {
                        if (fileInfo.fileType.ext) {
                            fileInfo.fileType = fileInfo.fileType.ext;
                        }
                    }
                    else {
                        textFileContent = buffer.toString('utf-8');
                        if (fileInfo.ext === '.svg' || textFileContent.startsWith("<svg")) {
                            fileInfo.fileType = 'svg';
                        }
                        else if (textFileContent.startsWith("shc:")) {
                            fileInfo.fileType = 'shc';
                        }
                    }
                    switch (fileInfo.fileType) {
                        case 'png':
                            fileInfo.image = pngjs_1.PNG.sync.read(fileInfo.buffer);
                            break;
                        case 'jpg':
                            fileInfo.image = jpeg_js_1.default.decode(buffer, { useTArray: true });
                            break;
                        case 'bmp':
                            fileInfo.image = bmp_js_1.decode(buffer);
                            break;
                        default:
                            break;
                    }
                    return [2 /*return*/, fileInfo];
            }
        });
    });
}
exports.getFileData = getFileData;
//# sourceMappingURL=file.js.map