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
exports.validate = exports.schema = exports.JwsValidationOptions = void 0;
var schema_1 = require("./schema");
var error_1 = require("./error");
var jws_schema_json_1 = __importDefault(require("../schema/jws-schema.json"));
var jwsPayload = __importStar(require("./jws-payload"));
var keys = __importStar(require("./keys"));
var pako_1 = __importDefault(require("pako"));
var got_1 = __importDefault(require("got"));
var node_jose_1 = __importDefault(require("node-jose"));
var logger_1 = __importStar(require("./logger"));
var shcKeyValidator_1 = require("./shcKeyValidator");
var utils_1 = require("./utils");
var issuerDirectory_1 = require("./issuerDirectory");
exports.JwsValidationOptions = {
    skipJwksDownload: false,
    jwksDownloadTimeOut: 5000
};
exports.schema = jws_schema_json_1.default;
var MAX_JWS_SINGLE_CHUNK_LENGTH = 1195;
function validate(jws, index) {
    if (index === void 0) { index = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var log, parts, rawPayload, headerBytes, errString, headerJson, headerKeys, sigBytes, rStart, rBytes, sStart, sBytes, newSig, b64DecodedPayloadBuffer, b64DecodedPayloadString, inflatedPayload, payloadLog, payload, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    log = new logger_1.default((index ? '[' + index + '] ' : '') + 'JWS-compact');
                    if (jws.trim() !== jws) {
                        log.warn("JWS has leading or trailing spaces", error_1.ErrorCode.TRAILING_CHARACTERS);
                        jws = jws.trim();
                    }
                    if (jws.length > MAX_JWS_SINGLE_CHUNK_LENGTH) {
                        log.warn("JWS is longer than " + MAX_JWS_SINGLE_CHUNK_LENGTH + " characters, and will result in split QR codes", error_1.ErrorCode.JWS_TOO_LONG);
                    }
                    if (!/[0-9a-zA-Z_-]+\.[0-9a-zA-Z_-]+\.[0-9a-zA-Z_-]+/g.test(jws)) {
                        return [2 /*return*/, log.fatal('Failed to parse JWS-compact data as \'base64url.base64url.base64url\' string.', error_1.ErrorCode.JSON_PARSE_ERROR)];
                    }
                    // failures will be recorded in the log. we can continue processing.
                    schema_1.validateSchema(jws_schema_json_1.default, jws, log);
                    parts = jws.split('.');
                    rawPayload = parts[1];
                    try {
                        headerBytes = Buffer.from(parts[0], 'base64');
                        log.debug('JWS.header = ' + headerBytes.toString());
                    }
                    catch (err) {
                        errString = err;
                    }
                    finally {
                        if (!headerBytes) {
                            log.error(["Error base64-decoding the JWS header.",
                                errString].join('\n'), error_1.ErrorCode.JWS_VERIFICATION_ERROR);
                        }
                    }
                    if (headerBytes) {
                        headerJson = utils_1.parseJson(headerBytes.toString());
                        if (headerJson == null) {
                            log.error(["Can't parse JWS header as JSON.", errString].join(''), error_1.ErrorCode.JWS_HEADER_ERROR);
                        }
                        else {
                            headerKeys = Object.keys(headerJson);
                            if (!headerKeys.includes('alg')) {
                                log.error("JWS header missing 'alg' property.", error_1.ErrorCode.JWS_HEADER_ERROR);
                            }
                            else if (headerJson['alg'] !== 'ES256') {
                                log.error("Wrong value for JWS header property 'alg' property; expected: \"ES256\", actual: \"" + headerJson['alg'] + "\".", error_1.ErrorCode.JWS_HEADER_ERROR);
                            }
                            if (!headerKeys.includes('zip')) {
                                log.error("JWS header missing 'zip' property.", error_1.ErrorCode.JWS_HEADER_ERROR);
                            }
                            else if (headerJson['zip'] !== 'DEF') {
                                log.error("Wrong value for JWS header property 'zip' property; expected: \"DEF\", actual: \"" + headerJson['zip'] + "\".", error_1.ErrorCode.JWS_HEADER_ERROR);
                            }
                            if (!headerKeys.includes('kid')) {
                                log.error("JWS header missing 'kid' property.", error_1.ErrorCode.JWS_HEADER_ERROR);
                            }
                            // the value of the kid will be used in the crypto validation of the signature to select the issuer's public key
                        }
                    }
                    try {
                        sigBytes = Buffer.from(parts[2], 'base64');
                        log.debug('JWS.signature = ' + sigBytes.toString('hex'));
                    }
                    catch (err) {
                        log.error([
                            "Error base64-decoding the JWS signature.",
                            err
                        ].join('\n'), error_1.ErrorCode.JWS_VERIFICATION_ERROR);
                    }
                    if (sigBytes && sigBytes.length > 64 && sigBytes[0] === 0x30 && sigBytes[2] === 0x02) {
                        log.error("Signature appears to be in DER encoded form. Signature is expected to be 64-byte r||s concatenated form.\n" +
                            "See https://tools.ietf.org/html/rfc7515#appendix-A.3 for expected ES256 signature form.", error_1.ErrorCode.SIGNATURE_FORMAT_ERROR);
                        rStart = 4 + (sigBytes[3] - 32);
                        rBytes = sigBytes.slice(rStart, rStart + 32);
                        sStart = sigBytes.length - 32;
                        sBytes = sigBytes.slice(sStart);
                        newSig = Buffer.concat([rBytes, sBytes]).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                        parts[2] = newSig;
                        log.debug("jws-signature converted from DER form to r||s form: " + newSig);
                        jws = parts.join('.');
                    }
                    else if (sigBytes && sigBytes.length !== 64) {
                        log.error("Signature is " + sigBytes.length.toString() + "-bytes. Signature is expected to be 64-bytes", error_1.ErrorCode.SIGNATURE_FORMAT_ERROR);
                    }
                    try {
                        b64DecodedPayloadBuffer = Buffer.from(rawPayload, 'base64');
                    }
                    catch (err) {
                        log.error([
                            "Error base64-decoding the JWS payload.",
                            err
                        ].join('\n'), error_1.ErrorCode.JWS_VERIFICATION_ERROR);
                    }
                    if (b64DecodedPayloadBuffer) {
                        try {
                            inflatedPayload = pako_1.default.inflateRaw(b64DecodedPayloadBuffer, { to: 'string' });
                            log.info('JWS payload inflated');
                        }
                        catch (err) {
                            // try normal inflate
                            try {
                                inflatedPayload = pako_1.default.inflate(b64DecodedPayloadBuffer, { to: 'string' });
                                log.error("Error inflating JWS payload. Compression should use raw DEFLATE (without wrapper header and adler32 crc)", error_1.ErrorCode.INFLATION_ERROR);
                            }
                            catch (err) {
                                log.error(["Error inflating JWS payload. Did you use raw DEFLATE compression?",
                                    err].join('\n'), error_1.ErrorCode.INFLATION_ERROR);
                                // inflating failed, let's try to parse the base64-decoded string directly
                                b64DecodedPayloadString = b64DecodedPayloadBuffer.toString('utf-8');
                            }
                        }
                    }
                    payloadLog = jwsPayload.validate(inflatedPayload || b64DecodedPayloadString || rawPayload);
                    log.child.push(payloadLog);
                    // if we got a fatal error, quit here
                    if (payloadLog.get(logger_1.LogLevels.FATAL).length) {
                        return [2 /*return*/, log];
                    }
                    payload = utils_1.parseJson(inflatedPayload || b64DecodedPayloadString || rawPayload);
                    // if we did not get a payload back, it failed to be parsed and we cannot extract the key url
                    // so we can stop.
                    // the jws-payload child will contain the parse errors.
                    // The payload validation may have a Fatal error
                    if (!payload) {
                        return [2 /*return*/, log];
                    }
                    if (!payload.iss) return [3 /*break*/, 6];
                    if (!(typeof payload.iss === 'string')) return [3 /*break*/, 4];
                    if (payload.iss.slice(0, 8) !== 'https://') {
                        log.error("Issuer URL SHALL use https", error_1.ErrorCode.INVALID_ISSUER_URL);
                    }
                    if (payload.iss.slice(-1) === '/') {
                        log.error("Issuer URL SHALL NOT include a trailing /", error_1.ErrorCode.INVALID_ISSUER_URL);
                    }
                    if (!!exports.JwsValidationOptions.skipJwksDownload) return [3 /*break*/, 2];
                    return [4 /*yield*/, downloadAndImportKey(payload.iss, log)];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    log.info("skipping issuer JWK set download");
                    _b.label = 3;
                case 3:
                    // check if the iss URL is part of a trust framework
                    if (issuerDirectory_1.TrustedIssuerDirectory.directoryURL) {
                        issuerDirectory_1.checkTrustedIssuerDirectory(payload.iss, log);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    log.error("JWS payload 'iss' should be a string, not a " + typeof payload.iss);
                    _b.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    // continue, since we might have the key we need in the global keystore
                    log.error("Can't find 'iss' entry in JWS payload", error_1.ErrorCode.SCHEMA_ERROR);
                    _b.label = 7;
                case 7:
                    _a = headerJson;
                    if (!_a) return [3 /*break*/, 9];
                    return [4 /*yield*/, verifyJws(jws, headerJson['kid'], log)];
                case 8:
                    _a = (_b.sent());
                    _b.label = 9;
                case 9:
                    if (_a) {
                        log.info("JWS signature verified");
                    }
                    return [2 /*return*/, log];
            }
        });
    });
}
exports.validate = validate;
function downloadAndImportKey(issuerURL, log) {
    return __awaiter(this, void 0, void 0, function () {
        var jwkURL, requestedOrigin, response, acaoHeader, keySet, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jwkURL = issuerURL + '/.well-known/jwks.json';
                    log.info("Retrieving issuer key from " + jwkURL);
                    requestedOrigin = 'https://example.org';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, got_1.default(jwkURL, { headers: { Origin: requestedOrigin }, timeout: exports.JwsValidationOptions.jwksDownloadTimeOut })];
                case 2:
                    response = _a.sent();
                    acaoHeader = response.headers['access-control-allow-origin'];
                    if (!acaoHeader) {
                        log.error("Issuer key endpoint does not contain a 'access-control-allow-origin' header for Cross-Origin Resource Sharing (CORS)", error_1.ErrorCode.ISSUER_KEY_WELLKNOWN_ENDPOINT_CORS);
                    }
                    else if (acaoHeader !== '*' && acaoHeader !== requestedOrigin) {
                        log.error("Issuer key endpoint's 'access-control-allow-origin' header " + acaoHeader + " does not match the requested origin " + requestedOrigin + ", for Cross-Origin Resource Sharing (CORS)", error_1.ErrorCode.ISSUER_KEY_WELLKNOWN_ENDPOINT_CORS);
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    keySet = utils_1.parseJson(response.body);
                    if (!keySet) {
                        throw "Failed to parse JSON KeySet schema";
                    }
                    log.debug("Downloaded issuer key(s) : ");
                    return [4 /*yield*/, shcKeyValidator_1.verifyAndImportHealthCardIssuerKey(keySet, log, issuerURL)];
                case 4:
                    _a.sent();
                    return [2 /*return*/, keySet];
                case 5:
                    err_1 = _a.sent();
                    log.error("Can't parse downloaded issuer JWK set: " + err_1.toString(), error_1.ErrorCode.ISSUER_KEY_DOWNLOAD_ERROR);
                    return [2 /*return*/, undefined];
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    log.error("Failed to download issuer JWK set: " + err_2.toString(), error_1.ErrorCode.ISSUER_KEY_DOWNLOAD_ERROR);
                    return [2 /*return*/, undefined];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function verifyJws(jws, kid, log) {
    return __awaiter(this, void 0, void 0, function () {
        var verifier, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    verifier = node_jose_1.default.JWS.createVerify(keys.store);
                    if (kid && !keys.store.get(kid)) {
                        log.error("JWS verification failed: can't find key with 'kid' = " + kid + " in issuer set", error_1.ErrorCode.JWS_VERIFICATION_ERROR);
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, verifier.verify(jws)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    error_2 = _a.sent();
                    // The error message is always 'no key found', regardless if a key is missing or
                    // if the signature was tempered with. Don't return the node-jose error message.
                    log.error('JWS verification failed', error_1.ErrorCode.JWS_VERIFICATION_ERROR);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=jws-compact.js.map