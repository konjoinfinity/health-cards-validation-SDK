"use strict";
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
exports.clearTrustedIssuerDirectory = exports.setTrustedIssuerDirectory = exports.checkTrustedIssuerDirectory = exports.TrustedIssuerDirectory = exports.KnownIssuerDirectories = void 0;
var got_1 = __importDefault(require("got"));
var error_1 = require("./error");
var utils_1 = require("./utils");
exports.KnownIssuerDirectories = [
    {
        name: 'VCI',
        URL: 'https://raw.githubusercontent.com/the-commons-project/vci-directory/main/vci-issuers.json'
    },
    {
        name: 'test',
        URL: 'https://raw.githubusercontent.com/smart-on-fhir/health-cards-validation-SDK/main/testdata/test-issuers.json'
    }
];
var TrustedIssuerDirectory = /** @class */ (function () {
    function TrustedIssuerDirectory() {
    }
    return TrustedIssuerDirectory;
}());
exports.TrustedIssuerDirectory = TrustedIssuerDirectory;
function checkTrustedIssuerDirectory(iss, log) {
    var _a;
    if (TrustedIssuerDirectory.issuers) {
        // extract the VCI issuer friendly name; we assume there are no duplicated URLs in the list
        var issName = (_a = TrustedIssuerDirectory.issuers) === null || _a === void 0 ? void 0 : _a.participating_issuers.filter(function (issuer) { return issuer.iss === iss; }).map(function (issuer) { return issuer.name; })[0];
        if (issName) {
            log.debug("Issuer found in " + TrustedIssuerDirectory.name + " directory; name: " + issName);
        }
        else {
            log.error("Issuer not part of the " + TrustedIssuerDirectory.directoryName + " directory", error_1.ErrorCode.ISSUER_NOT_TRUSTED);
        }
    }
    else {
        // trusted issuers directory not available
        log.error("Error validating against the trusted issuers directory: directory not set");
    }
}
exports.checkTrustedIssuerDirectory = checkTrustedIssuerDirectory;
function setTrustedIssuerDirectory(directory, log) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var response, err_1, msg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (TrustedIssuerDirectory.directoryName === directory || TrustedIssuerDirectory.directoryURL === directory) {
                        // already set
                        return [2 /*return*/];
                    }
                    clearTrustedIssuerDirectory();
                    exports.KnownIssuerDirectories.forEach(function (d) {
                        if (d.name === directory || d.URL === directory) {
                            // found a match
                            TrustedIssuerDirectory.directoryName = d.name;
                            TrustedIssuerDirectory.directoryURL = d.URL;
                            console.log("Using \"" + d.name + "\" trusted issuers directory from: " + d.URL);
                        }
                    });
                    if (!TrustedIssuerDirectory.directoryName) {
                        // we didn't find a known issuers directory by name, let's assume we were provided with a URL
                        TrustedIssuerDirectory.directoryName = 'custom';
                        TrustedIssuerDirectory.directoryURL = directory;
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, got_1.default(TrustedIssuerDirectory.directoryURL, { timeout: 5000 })];
                case 2:
                    response = _b.sent();
                    TrustedIssuerDirectory.issuers = utils_1.parseJson(response.body);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    msg = "Error downloading the trusted issuer directory: " + ((_a = err_1) === null || _a === void 0 ? void 0 : _a.message);
                    log && log.error(msg, error_1.ErrorCode.ISSUER_DIRECTORY_NOT_FOUND);
                    console.log(msg);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.setTrustedIssuerDirectory = setTrustedIssuerDirectory;
function clearTrustedIssuerDirectory() {
    TrustedIssuerDirectory.directoryName = '';
    TrustedIssuerDirectory.directoryURL = '';
    TrustedIssuerDirectory.issuers = undefined;
}
exports.clearTrustedIssuerDirectory = clearTrustedIssuerDirectory;
//# sourceMappingURL=issuerDirectory.js.map