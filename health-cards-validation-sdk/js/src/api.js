"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationProfiles = exports.validate = exports.LogLevels = exports.ErrorCode = void 0;
var healthCard = __importStar(require("./healthCard"));
var fhirHealthCard = __importStar(require("./fhirHealthCard"));
var jws = __importStar(require("./jws-compact"));
var jwsPayload = __importStar(require("./jws-payload"));
var fhirBundle = __importStar(require("./fhirBundle"));
var fhirBundle_1 = require("./fhirBundle");
Object.defineProperty(exports, "ValidationProfiles", { enumerable: true, get: function () { return fhirBundle_1.ValidationProfiles; } });
var qr = __importStar(require("./qr"));
var logger_1 = __importStar(require("./logger"));
var error_1 = require("./error");
var shcKeyValidator_1 = require("./shcKeyValidator");
var utils_1 = require("./utils");
var issuerDirectory_1 = require("./issuerDirectory");
function formatOutput(log, logLevel) {
    return log
        .log
        .map(function (e) {
        return { message: e.message, code: e.code, level: e.logLevel };
    })
        .filter(function (f) { return f.level >= logLevel; });
}
function validateKeySet(text, options) {
    return __awaiter(this, void 0, void 0, function () {
        var keySet, keySetLog;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keySet = utils_1.parseJson(text);
                    if (keySet == null) {
                        return [2 /*return*/, [{ message: "Unable to parse as JSON", code: error_1.ErrorCode.JSON_PARSE_ERROR, level: logger_1.LogLevels.ERROR }]];
                    }
                    return [4 /*yield*/, shcKeyValidator_1.verifyAndImportHealthCardIssuerKey(keySet)];
                case 1:
                    keySetLog = _a.sent();
                    return [2 /*return*/, formatOutput(keySetLog, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING)];
            }
        });
    });
}
function validateQrnumeric(shc, options) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, qr.validate(shc)];
                case 1:
                    log = _a.sent();
                    return [2 /*return*/, formatOutput(log, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING)];
            }
        });
    });
}
function validateHealthcard(json, options) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, healthCard.validate(json)];
                case 1:
                    log = _a.sent();
                    return [2 /*return*/, formatOutput(log, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING)];
            }
        });
    });
}
function validateFhirHealthcard(json, options) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fhirHealthCard.validate(json)];
                case 1:
                    log = _a.sent();
                    return [2 /*return*/, formatOutput(log, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING)];
            }
        });
    });
}
function validateJws(text, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, log;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (options === null || options === void 0 ? void 0 : options.directory);
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, issuerDirectory_1.setTrustedIssuerDirectory(options.directory)];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    _a;
                    return [4 /*yield*/, jws.validate(text)];
                case 3:
                    log = _b.sent();
                    return [2 /*return*/, formatOutput(log, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING)];
            }
        });
    });
}
function validateJwspayload(payload, options) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = jwsPayload.validate(payload);
            return [2 /*return*/, Promise.resolve(formatOutput(log, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING))];
        });
    });
}
function validateFhirBundle(json, options) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            fhirBundle_1.FhirOptions.ValidationProfile = (options === null || options === void 0 ? void 0 : options.profile) || fhirBundle_1.ValidationProfiles.any;
            log = fhirBundle.validate(json);
            return [2 /*return*/, Promise.resolve(formatOutput(log, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING))];
        });
    });
}
function checkTrustedDirectory(url, options) {
    return __awaiter(this, void 0, void 0, function () {
        var log, directory, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    log = new logger_1.default('TrustedDirectory');
                    directory = options === null || options === void 0 ? void 0 : options.directory;
                    _a = directory;
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, issuerDirectory_1.setTrustedIssuerDirectory(directory, log)];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    _a;
                    if (log.log.length) {
                        return [2 /*return*/, Promise.resolve(formatOutput(log, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING))];
                    }
                    issuerDirectory_1.checkTrustedIssuerDirectory(url, log);
                    return [2 /*return*/, Promise.resolve(formatOutput(log, (options === null || options === void 0 ? void 0 : options.logLevel) || logger_1.LogLevels.WARNING))];
            }
        });
    });
}
var error_2 = require("./error");
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return error_2.ErrorCode; } });
var logger_2 = require("./logger");
Object.defineProperty(exports, "LogLevels", { enumerable: true, get: function () { return logger_2.LogLevels; } });
exports.validate = {
    "qrnumeric": validateQrnumeric,
    "healthcard": validateHealthcard,
    "fhirhealthcard": validateFhirHealthcard,
    "jws": validateJws,
    "jwspayload": validateJwspayload,
    "fhirbundle": validateFhirBundle,
    "keyset": validateKeySet,
    "checkTrustedDirectory": checkTrustedDirectory,
};
//# sourceMappingURL=api.js.map