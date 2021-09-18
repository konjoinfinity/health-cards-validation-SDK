"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.dataToQRImage = exports.svgToQRImage = exports.validate = void 0;
var svg2img_1 = __importDefault(require("svg2img")); // svg files to image buffer
var jsqr_1 = __importDefault(require("jsqr")); // qr image decoder
var error_1 = require("./error");
var logger_1 = __importDefault(require("./logger"));
var qr = __importStar(require("./qr"));
var pngjs_1 = require("pngjs");
var fs_1 = __importDefault(require("fs"));
var jimp_1 = __importDefault(require("jimp"));
var qrcode_1 = require("qrcode");
function validate(images) {
    return __awaiter(this, void 0, void 0, function () {
        var log, shcStrings, i, shc, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    log = new logger_1.default(images.length > 1 ?
                        'QR images (' + images.length.toString() + ')' :
                        'QR image');
                    shcStrings = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < images.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, decode(images[i], log)];
                case 2:
                    shc = _c.sent();
                    if (shc === undefined)
                        return [2 /*return*/, log];
                    shcStrings.push(shc);
                    log.info(images[i].name + " decoded");
                    log.debug(images[i].name + ' = ' + shc);
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    _b = (_a = log.child).push;
                    return [4 /*yield*/, qr.validate(shcStrings)];
                case 5:
                    _b.apply(_a, [(_c.sent())]);
                    return [2 /*return*/, log];
            }
        });
    });
}
exports.validate = validate;
// takes file path to QR data and returns base64 data
function decode(fileInfo, log) {
    return __awaiter(this, void 0, void 0, function () {
        var svgBuffer, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = fileInfo.fileType;
                    switch (_a) {
                        case 'svg': return [3 /*break*/, 1];
                        case 'png': return [3 /*break*/, 3];
                        case 'jpg': return [3 /*break*/, 3];
                        case 'bmp': return [3 /*break*/, 3];
                    }
                    return [3 /*break*/, 4];
                case 1: return [4 /*yield*/, svgToImageBuffer(fileInfo.buffer.toString(), log)];
                case 2:
                    svgBuffer = _b.sent();
                    fileInfo.image = pngjs_1.PNG.sync.read(svgBuffer);
                    fs_1.default.writeFileSync(fileInfo.path + '.png', svgBuffer);
                    _b.label = 3;
                case 3: return [2 /*return*/, Promise.resolve(decodeQrBuffer(fileInfo, log))];
                case 4:
                    log.fatal("Unknown data in file", error_1.ErrorCode.UNKNOWN_FILE_DATA);
                    return [2 /*return*/, Promise.resolve(undefined)];
            }
        });
    });
}
// the svg data is turned into an image buffer. these values ensure that the resulting image is readable
// by the QR image decoder. 300x300 fails while 400x400 succeeds 
var svgImageWidth = 600;
// Converts a SVG file into a QR image buffer (as if read from a image file)
function svgToImageBuffer(svgPath, log) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO: create a test that causes failure here
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    svg2img_1.default(svgPath, { width: svgImageWidth, height: svgImageWidth }, function (error, buffer) {
                        if (error) {
                            log.fatal("Could not convert SVG to image. Error: " + error.message);
                            reject(undefined);
                        }
                        resolve(buffer);
                    });
                })];
        });
    });
}
// Decode QR image buffer to base64 string
function decodeQrBuffer(fileInfo, log) {
    var result = undefined;
    //const png = PNG.sync.read(image);
    var data = fileInfo.image;
    if (!data) {
        log.fatal('Could not read image data from : ' + fileInfo.name);
        return undefined;
    }
    var code = jsqr_1.default(new Uint8ClampedArray(data.data.buffer), data.width, data.height);
    if (code == null) {
        log.fatal('Could not decode QR image from : ' + fileInfo.name, error_1.ErrorCode.QR_DECODE_ERROR);
        return result;
    }
    if (code.version > 22) {
        log.error("QR code version of " + code.version + " is larger than the maximum allowed of 22", error_1.ErrorCode.INVALID_QR_VERSION);
    }
    // check chunks. Note: jsQR calls chunks and type what the SMART Health Cards spec call segments and mode,
    // we use the later in error messages
    code.chunks.forEach(function (c, i) {
        var _a;
        var chunkText = c.text || ((_a = c.bytes) === null || _a === void 0 ? void 0 : _a.join(',')) || "<can't parse>";
        log.debug("segment " + (i + 1) + ": type: " + c.type + ", content: " + chunkText);
    });
    if (!code.chunks || code.chunks.length !== 2) {
        log.error("Wrong number of segments in QR code: found " + code.chunks.length + ", expected 2" +
            ("\nSegments types: " + code.chunks.map(function (chunk, i) { return i + 1 + ": " + chunk.type; }).join("; ")), error_1.ErrorCode.INVALID_QR);
    }
    else {
        if (code.chunks[0].type !== 'byte') {
            // unlikely, since 'shc:/' can only be legally encoded as with byte mode;
            // was not able to create test case for this
            log.error("Wrong encoding mode for first QR segment: found " + code.chunks[0].type + ", expected \"byte\"", error_1.ErrorCode.INVALID_QR);
        }
        if (code.chunks[1].type !== 'numeric') {
            log.error("Wrong encoding mode for second QR segment: found " + code.chunks[0].type + ", expected \"numeric\"", error_1.ErrorCode.INVALID_QR);
        }
        // let's make sure the QR code's version is tight
        try {
            var qrCode = qrcode_1.create(code.data, { errorCorrectionLevel: 'low' });
            if (qrCode.version < code.version) {
                log.warn("QR code has version " + code.version + ", but could have been created with version " + qrCode.version + " (with low error-correcting level). Make sure the larger version was chosen on purpose (e.g., not hardcoded).", error_1.ErrorCode.INVALID_QR_VERSION);
            }
        }
        catch (err) {
            log.warn("Can't re-create QR to check optimal version choice: ", err);
        }
    }
    // the proper formatting of the QR code data is done later in the pipeline
    return code.data;
}
function svgToQRImage(filePath) {
    var baseFileName = filePath.slice(0, filePath.lastIndexOf('.'));
    return new Promise(function (resolve, reject) {
        svg2img_1.default(filePath, { width: 600, height: 600 }, function (error, buffer) {
            error ? reject("Could not create image from svg") : resolve(buffer);
        });
    })
        .then(function (buffer) {
        fs_1.default.writeFileSync(baseFileName + '.png', buffer);
        return jimp_1.default.read(baseFileName + '.png');
    })
        .then(function (png) {
        return Promise.all([
            png.write(baseFileName + '.bmp'),
            png.grayscale().quality(100).write(baseFileName + '.jpg')
        ]);
    })
        .catch(function (err) { console.error(err); });
}
exports.svgToQRImage = svgToQRImage;
function dataToQRImage(path, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, qrcode_1.toFile(path, data, { type: 'png', errorCorrectionLevel: 'low' })
                        .catch(function (error) {
                        throw error;
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.dataToQRImage = dataToQRImage;
//# sourceMappingURL=image.js.map