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
/* Validate SMART Health Card artifacts */
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var commander_1 = require("commander");
var validator = __importStar(require("./validate"));
var logger_1 = __importDefault(require("./logger"));
var file_1 = require("./file");
var error_1 = require("./error");
var utils = __importStar(require("./utils"));
var package_json_1 = __importDefault(require("../package.json"));
var fhirBundle_1 = require("./fhirBundle");
var versions = __importStar(require("./check-for-update"));
var semver_1 = __importDefault(require("semver"));
var jws_compact_1 = require("./jws-compact");
var colors_1 = __importDefault(require("colors"));
var issuerDirectory_1 = require("./issuerDirectory");
/**
 *  Defines the program
 *  see https://www.npmjs.com/package/commander for documentation
 *  -h/--help auto-generated
 */
var loglevelChoices = ['debug', 'info', 'warning', 'error', 'fatal'];
var artifactTypes = ['fhirbundle', 'jwspayload', 'jws', 'healthcard', 'fhirhealthcard', 'qrnumeric', 'qr', 'jwkset'];
var program = new commander_1.Command();
program.version(package_json_1.default.version, '-v, --version', 'display specification and tool version');
program.requiredOption('-p, --path <path>', 'path of the file(s) to validate. Can be repeated for the qr and qrnumeric types, to provide multiple file chunks', function (p, paths) { return paths.concat([p]); }, []);
program.addOption(new commander_1.Option('-t, --type <type>', 'type of file to validate').choices(artifactTypes));
program.addOption(new commander_1.Option('-l, --loglevel <loglevel>', 'set the minimum log level').choices(loglevelChoices).default('warning'));
program.addOption(new commander_1.Option('-P, --profile <profile>', 'vaccination profile to validate').choices(Object.keys(fhirBundle_1.ValidationProfiles).filter(function (x) { return Number.isNaN(Number(x)); })).default('any'));
program.option('-d, --directory <directory>', 'trusted issuer directory to validate against');
program.option('-o, --logout <path>', 'output path for log (if not specified log will be printed on console)');
program.option('-f, --fhirout <path>', 'output path for the extracted FHIR bundle');
program.option('-k, --jwkset <key>', 'path to trusted issuer key set');
program.option('-e, --exclude <error>', 'error to exclude, can be repeated, can use a * wildcard. Valid options:' +
    error_1.ExcludableErrors.map(function (e) { return " \"" + e.error + "\""; }).join(), function (e, errors) { return errors.concat([e]); }, []);
program.parse(process.argv);
function exit(message, exitCode) {
    if (exitCode === void 0) { exitCode = 0; }
    process.exitCode = exitCode;
    console.log(message);
}
/**
 * Processes the program options and launches validation
 */
function processOptions(options) {
    return __awaiter(this, void 0, void 0, function () {
        var vLatestSDK, vLatestSpec, level, logDir, logDir, fileData, i, path_2, _a, _b, error_2, keys, output, keys, output, output;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log(colors_1.default.dim("SMART Health Card Validation SDK v" + package_json_1.default.version) + '\n');
                    vLatestSDK = versions.latestSdkVersion();
                    vLatestSpec = versions.latestSpecVersion();
                    level = loglevelChoices.indexOf(options.loglevel);
                    // verify that the directory of the logfile exists, if provided
                    if (options.logout) {
                        logDir = path_1.default.dirname(path_1.default.resolve(options.logout));
                        if (!fs_1.default.existsSync(logDir)) {
                            return [2 /*return*/, exit('Log file directory does not exist : ' + logDir, error_1.ErrorCode.LOG_PATH_NOT_FOUND)];
                        }
                    }
                    // set the log exclusions
                    if (options.exclude) {
                        logger_1.default.Exclusions = error_1.getExcludeErrorCodes(options.exclude);
                    }
                    // set global options
                    jws_compact_1.JwsValidationOptions.skipJwksDownload = !!options.jwkset;
                    // verify that the directory of the fhir output file exists, if provided
                    if (options.fhirout) {
                        logDir = path_1.default.dirname(path_1.default.resolve(options.fhirout));
                        if (!fs_1.default.existsSync(logDir)) {
                            return [2 /*return*/, exit('FHIR output file directory does not exist : ' + logDir, error_1.ErrorCode.LOG_PATH_NOT_FOUND)];
                        }
                        fhirBundle_1.FhirOptions.LogOutputPath = options.fhirout;
                    }
                    // set the validation profile
                    fhirBundle_1.FhirOptions.ValidationProfile =
                        options.profile ?
                            fhirBundle_1.ValidationProfiles[options.profile] :
                            fhirBundle_1.FhirOptions.ValidationProfile = fhirBundle_1.ValidationProfiles['any'];
                    // requires both --path and --type properties
                    if (options.path.length === 0 || !options.type) {
                        console.log("Invalid option, missing '--path' or '--type'");
                        console.log(options);
                        program.help();
                        return [2 /*return*/];
                    }
                    // only 'qr' and 'qrnumeric' --type supports multiple --path arguments
                    if (options.path.length > 1 && !(options.type === 'qr') && !(options.type === 'qrnumeric')) {
                        return [2 /*return*/, exit("Only the 'qr' and 'qrnumeric' types can have multiple --path options")];
                    }
                    if (!options.directory) return [3 /*break*/, 2];
                    return [4 /*yield*/, issuerDirectory_1.setTrustedIssuerDirectory(options.directory)];
                case 1:
                    _c.sent();
                    _c.label = 2;
                case 2:
                    fileData = [];
                    i = 0;
                    _c.label = 3;
                case 3:
                    if (!(i < options.path.length)) return [3 /*break*/, 8];
                    path_2 = options.path[i];
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    _b = (_a = fileData).push;
                    return [4 /*yield*/, file_1.getFileData(path_2)];
                case 5:
                    _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _c.sent();
                    return [2 /*return*/, exit(error_2.message, error_1.ErrorCode.DATA_FILE_NOT_FOUND)];
                case 7:
                    i++;
                    return [3 /*break*/, 3];
                case 8:
                    // cannot provide a key file to both --path and --jwkset
                    if (options.jwkset && options.type === 'jwkset') {
                        return [2 /*return*/, exit("Cannot pass a key file to both --path and --jwkset")];
                    }
                    if (!options.jwkset) return [3 /*break*/, 10];
                    keys = void 0;
                    try {
                        keys = utils.loadJSONFromFile(options.jwkset);
                    }
                    catch (error) {
                        return [2 /*return*/, exit(error.message, error_1.ErrorCode.DATA_FILE_NOT_FOUND)];
                    }
                    return [4 /*yield*/, validator.validateKey(keys)];
                case 9:
                    output = _c.sent();
                    process.exitCode = output.exitCode;
                    // if a logfile is specified, append to the specified logfile
                    options.logout ?
                        output.toFile(options.logout, options, true) :
                        console.log(output.toString(level));
                    _c.label = 10;
                case 10:
                    if (!(options.type === 'jwkset')) return [3 /*break*/, 12];
                    keys = JSON.parse(fileData[0].buffer.toString('utf-8'));
                    return [4 /*yield*/, validator.validateKey(keys)];
                case 11:
                    output = _c.sent();
                    process.exitCode = output.exitCode;
                    // if a logfile is specified, append to the specified logfile
                    options.logout ?
                        output.toFile(options.logout, options, true) :
                        console.log(output.toString(level));
                    _c.label = 12;
                case 12:
                    if (!(options.type !== 'jwkset')) return [3 /*break*/, 14];
                    return [4 /*yield*/, validator.validateCard(fileData, options)];
                case 13:
                    output = _c.sent();
                    process.exitCode = output.exitCode;
                    // if a logfile is specified, append to the specified logfile
                    options.logout ?
                        output.toFile(options.logout, options, true) :
                        console.log(output.toString(level));
                    _c.label = 14;
                case 14: 
                // check if we are running the latest version of the SDK
                return [4 /*yield*/, vLatestSDK.then(function (v) {
                        if (!v) {
                            console.log("Can't determine the latest SDK version. Make sure you have the latest version.");
                        }
                        else if (semver_1.default.gt(v, package_json_1.default.version)) {
                            console.log("NOTE: You are not using the latest SDK version. Current: v" + package_json_1.default.version + ", latest: v" + v + "\n" +
                                "You can update by running 'npm run update-validator'.");
                        }
                    })];
                case 15:
                    // check if we are running the latest version of the SDK
                    _c.sent();
                    // check if the SDK is behind the spec
                    return [4 /*yield*/, vLatestSpec.then(function (v) {
                            if (!v) {
                                console.log("Can't determine the latest spec version.");
                            }
                            else if (semver_1.default.gt(v, package_json_1.default.version.substr(0, 'x.y.z'.length))) { // ignore prerelease tag
                                console.log("NOTE: the SDK v" + package_json_1.default.version + " is not validating the latest version of the spec: v" + v);
                            }
                        })];
                case 16:
                    // check if the SDK is behind the spec
                    _c.sent();
                    console.log("\nValidation completed");
                    return [2 /*return*/];
            }
        });
    });
}
// start the program
// es5 compat requires await not be at the top level
void (function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, processOptions(program.opts())];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=shc-validator.js.map