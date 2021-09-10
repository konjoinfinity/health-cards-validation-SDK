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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var stream_1 = __importDefault(require("stream"));
var util_1 = require("util");
var node_jose_1 = require("node-jose");
var got_1 = __importDefault(require("got"));
var image_1 = require("./image");
var commander_1 = require("commander");
var outPath = 'testdata';
var baseExampleUrl = 'https://spec.smarthealth.cards/examples/';
var exampleCount = 3;
var exampleQrChunkCount = [1, 1, 3]; // number of QR chunks per example
var examplePrefix = 'example-';
var exampleSuffixes = [
    '-a-fhirBundle.json',
    '-b-jws-payload-expanded.json',
    '-c-jws-payload-minified.json',
    '-d-jws.txt',
    '-e-file.smart-health-card',
    '-f-qr-code-numeric-value-X.txt',
    '-g-qr-code-X.svg'
];
var pipeline = util_1.promisify(stream_1.default.pipeline);
function fetchExamples(outdir, force) {
    if (force === void 0) { force = false; }
    return __awaiter(this, void 0, void 0, function () {
        var getExamples;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getExamples = exampleSuffixes.map(function (exampleSuffix) { return __awaiter(_this, void 0, void 0, function () {
                        var i, exampleNumber, exampleFiles, exampleFileBase, j, _i, exampleFiles_1, exampleFile, filePath, exampleUrl, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    i = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(i < exampleCount)) return [3 /*break*/, 8];
                                    exampleNumber = i.toLocaleString('en-US', {
                                        minimumIntegerDigits: 2,
                                        useGrouping: false,
                                    });
                                    exampleFiles = [];
                                    exampleFileBase = examplePrefix + exampleNumber + exampleSuffix;
                                    if (/^-f.+|^-g.+/g.test(exampleSuffix)) {
                                        // we might have multiple QR files
                                        for (j = 0; j < exampleQrChunkCount[i]; j++) {
                                            exampleFiles.push(exampleFileBase.replace('X', j.toString()));
                                        }
                                    }
                                    else {
                                        exampleFiles.push(exampleFileBase);
                                    }
                                    _i = 0, exampleFiles_1 = exampleFiles;
                                    _a.label = 2;
                                case 2:
                                    if (!(_i < exampleFiles_1.length)) return [3 /*break*/, 7];
                                    exampleFile = exampleFiles_1[_i];
                                    filePath = path_1.default.join(outdir, exampleFile);
                                    if (!(force || !fs_1.default.existsSync(filePath))) return [3 /*break*/, 6];
                                    exampleUrl = baseExampleUrl + exampleFile;
                                    console.log('Retrieving ' + exampleUrl);
                                    _a.label = 3;
                                case 3:
                                    _a.trys.push([3, 5, , 6]);
                                    return [4 /*yield*/, pipeline(got_1.default.stream(exampleUrl), fs_1.default.createWriteStream(filePath))];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 5:
                                    err_1 = _a.sent();
                                    console.log('Error retrieving: ' + exampleUrl, err_1.message);
                                    return [3 /*break*/, 6];
                                case 6:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 7:
                                    i++;
                                    return [3 /*break*/, 1];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(getExamples)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var issuerPrivateKeyUrl = 'https://raw.githubusercontent.com/smart-on-fhir/health-cards/main/generate-examples/src/config/issuer.jwks.private.json';
var issuerPublicKeyFileName = 'issuer.jwks.public.json';
function fetchKeys(outdir, force) {
    if (force === void 0) { force = false; }
    return __awaiter(this, void 0, void 0, function () {
        var filePath, issuerPrivateKeySet, _a, _b, isPrivateKey, issuerPublicKeySet;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    filePath = path_1.default.join(outdir, issuerPublicKeyFileName);
                    if (!!fs_1.default.existsSync(filePath)) return [3 /*break*/, 3];
                    // download the private key set, save as string
                    console.log('Retrieving ' + issuerPrivateKeyUrl);
                    _b = (_a = JSON).stringify;
                    return [4 /*yield*/, got_1.default(issuerPrivateKeyUrl).json()];
                case 1:
                    issuerPrivateKeySet = _b.apply(_a, [_c.sent()]);
                    isPrivateKey = false;
                    return [4 /*yield*/, node_jose_1.JWK.asKeyStore(issuerPrivateKeySet)];
                case 2:
                    issuerPublicKeySet = (_c.sent()).toJSON(isPrivateKey);
                    fs_1.default.writeFileSync(filePath, JSON.stringify(issuerPublicKeySet));
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// for each .svg file, generate a png, jpg, and bmp QR image
function generateImagesFromSvg(dir, force) {
    if (force === void 0) { force = false; }
    return __awaiter(this, void 0, void 0, function () {
        var files, i, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = fs_1.default.readdirSync(dir);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < files.length)) return [3 /*break*/, 4];
                    file = path_1.default.join(dir, files[i]);
                    if (!(path_1.default.extname(file) === '.svg')) return [3 /*break*/, 3];
                    // TODO make use of force option
                    return [4 /*yield*/, image_1.svgToQRImage(file)];
                case 2:
                    // TODO make use of force option
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var program = new commander_1.Command();
program.option('-f, --force', 'forces example retrieval, even if already present');
program.parse(process.argv);
var force = program.opts().force || false;
// We have to wrap these calls in an async function for ES5 support
// Typescript error: Top-level 'await' expressions are only allowed when the 'module' option is set to 'esnext'
void (function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchExamples(outPath, force)];
            case 1:
                _a.sent();
                return [4 /*yield*/, fetchKeys(outPath, force)];
            case 2:
                _a.sent();
                return [4 /*yield*/, generateImagesFromSvg(outPath)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=fetch-examples.js.map