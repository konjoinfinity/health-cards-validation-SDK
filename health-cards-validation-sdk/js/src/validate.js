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
exports.validateCard = exports.validateKey = void 0;
var logger_1 = __importDefault(require("./logger"));
var shcKeyValidator_1 = require("./shcKeyValidator");
var error_1 = require("./error");
var healthCard = __importStar(require("./healthCard"));
var fhirHealthCard = __importStar(require("./fhirHealthCard"));
var jws = __importStar(require("./jws-compact"));
var jwsPayload = __importStar(require("./jws-payload"));
var fhirBundle = __importStar(require("./fhirBundle"));
var qr = __importStar(require("./qr"));
var image = __importStar(require("./image"));
var fhirBundle_1 = require("./fhirBundle");
var issuerDirectory_1 = require("./issuerDirectory");
/** Validate the issuer key */
function validateKey(keySet) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, shcKeyValidator_1.verifyAndImportHealthCardIssuerKey(keySet, new logger_1.default('Validate Key-Set'))];
                case 1: return [2 /*return*/, (_a.sent())];
            }
        });
    });
}
exports.validateKey = validateKey;
/** Validates SMART Health Card */
function validateCard(fileData, options) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fhirBundle_1.FhirOptions.ValidationProfile =
                        options.profile ?
                            fhirBundle_1.ValidationProfiles[options.profile] :
                            fhirBundle_1.FhirOptions.ValidationProfile = fhirBundle_1.ValidationProfiles['any'];
                    if (!options.directory) return [3 /*break*/, 2];
                    return [4 /*yield*/, issuerDirectory_1.setTrustedIssuerDirectory(options.directory)];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    issuerDirectory_1.clearTrustedIssuerDirectory();
                    _b.label = 3;
                case 3:
                    _a = options.type.toLocaleLowerCase();
                    switch (_a) {
                        case "qr": return [3 /*break*/, 4];
                        case "qrnumeric": return [3 /*break*/, 6];
                        case "healthcard": return [3 /*break*/, 8];
                        case "fhirhealthcard": return [3 /*break*/, 10];
                        case "jws": return [3 /*break*/, 12];
                        case "jwspayload": return [3 /*break*/, 14];
                        case "fhirbundle": return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 16];
                case 4: return [4 /*yield*/, image.validate(fileData)];
                case 5:
                    result = _b.sent();
                    return [3 /*break*/, 17];
                case 6: return [4 /*yield*/, qr.validate(fileData.map(function (fi) { return fi.buffer.toString('utf-8'); }))];
                case 7:
                    result = _b.sent();
                    return [3 /*break*/, 17];
                case 8: return [4 /*yield*/, healthCard.validate(fileData[0].buffer.toString())];
                case 9:
                    result = _b.sent();
                    if (fileData[0].ext !== '.smart-health-card') {
                        result.warn("Invalid file extension. Should be .smart-health-card.", error_1.ErrorCode.INVALID_FILE_EXTENSION);
                    }
                    return [3 /*break*/, 17];
                case 10: return [4 /*yield*/, fhirHealthCard.validate(fileData[0].buffer.toString())];
                case 11:
                    result = _b.sent();
                    return [3 /*break*/, 17];
                case 12: return [4 /*yield*/, jws.validate(fileData[0].buffer.toString())];
                case 13:
                    result = _b.sent();
                    return [3 /*break*/, 17];
                case 14:
                    result = jwsPayload.validate(fileData[0].buffer.toString());
                    return [3 /*break*/, 17];
                case 15:
                    result = fhirBundle.validate(fileData[0].buffer.toString());
                    return [3 /*break*/, 17];
                case 16: return [2 /*return*/, Promise.reject("Invalid type : " + options.type)];
                case 17: return [2 /*return*/, result];
            }
        });
    });
}
exports.validateCard = validateCard;
//# sourceMappingURL=validate.js.map