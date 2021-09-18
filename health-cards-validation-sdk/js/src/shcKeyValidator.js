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
exports.verifyAndImportHealthCardIssuerKey = void 0;
var logger_1 = __importDefault(require("./logger"));
var node_jose_1 = __importDefault(require("node-jose"));
var error_1 = require("./error");
var schema_1 = require("./schema");
var keyset_schema_json_1 = __importDefault(require("../schema/keyset-schema.json"));
var keys_1 = require("./keys");
var execa_1 = __importDefault(require("execa"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var uuid_1 = require("uuid");
var utils_1 = require("./utils");
var x509_1 = require("@fidm/x509");
// directory where to write cert files for openssl validation
var tmpDir = 'tmp';
// PEM and ASN.1 DER constants
var PEM_CERT_HEADER = '-----BEGIN CERTIFICATE-----';
var PEM_CERT_FOOTER = '-----END CERTIFICATE-----';
var PEM_CERT_FILE_EXT = '.pem';
var EC_P256_ASN1_PUBLIC_KEY_HEADER_HEX = "3059301306072a8648ce3d020106082a8648ce3d030107034200";
var EC_COMPRESSED_KEY_HEX = "04";
// PEM format for P-256 (prime256v1) public key (as used by issuer keys in SMART Health Cards)
// -----BEGIN PUBLIC KEY-----
// <-- multi-line base64 encoding of ASN.1:
//   [0..25]: header for P-256 curve (26 bytes)
//   [26]: 0x04 (uncompressed public key)
//   [27..58]: x (32 bytes)
//   [59..90]: y (32 bytes)
// -->
// -----END PUBLIC KEY-----
// PEM to DER encoding
// Drop the first and last lines (BEGIN/END markers), concatenate the others, base64-decode
var PEMtoDER = function (pem) { return Buffer.from(pem.slice(1, -2).join(), "base64"); };
// validate a JWK certificate chain (x5c value)
function validateX5c(x5c, log) {
    // we use OpenSSL to validate the certificate chain, first check if present
    if (!utils_1.isOpensslAvailable()) {
        log.warn('OpenSSL not available to validate the X.509 certificate chain; skipping validation', error_1.ErrorCode.OPENSSL_NOT_AVAILABLE);
        return;
    }
    if (!fs_1.default.existsSync(tmpDir)) {
        fs_1.default.mkdirSync(tmpDir);
    }
    // extract each cert in the x5c array, save to PEM-encoded temp file (already base64, so just need to wrap with file header/footer)
    var tmpFileName = uuid_1.v4();
    var rootCaArg = '';
    var caArg = '';
    var issuerCert = '';
    var certFiles = x5c.map(function (cert, index, certs) {
        var certFileName = path_1.default.join(tmpDir, tmpFileName + '-' + index.toString() + PEM_CERT_FILE_EXT);
        if (index === 0) {
            // first cert in the x5c array is the leaf, issuer cert
            issuerCert = ' ' + certFileName;
        }
        else if (index + 1 === certs.length) {
            // last cert in the x5c array is the root CA cert
            rootCaArg = '-CAfile ' + certFileName;
        }
        else {
            // all other certs in the x5c array are intermediate certs
            caArg += ' -untrusted ' + certFileName;
        }
        // break the base64 string into lines of 64 characters (PEM format)
        var certLines = cert.match(/(.{1,64})/g);
        if (!certLines || certLines.length == 0) {
            throw 'x5c[' + index.toString() + '] in issuer JWK set is not properly formatted';
        }
        // add the PEM header/footer
        certLines.unshift(PEM_CERT_HEADER);
        certLines.push(PEM_CERT_FOOTER);
        // write the PEM cert to file for openssl validation
        fs_1.default.writeFileSync(certFileName, certLines.join('\n'));
        return certFileName;
    });
    try {
        //
        // validate the chain with OpenSSL (should work with v1.0.2, v1.1.1, and libressl v3.x)
        //
        var opensslVerifyCommand = "openssl verify " + rootCaArg + caArg + issuerCert;
        log.debug('Calling openssl for x5c validation: ' + opensslVerifyCommand);
        var result = execa_1.default.commandSync(opensslVerifyCommand);
        if (result.exitCode != 0) {
            log.debug(result.stderr);
            throw 'OpenSSL returned an error: exit code ' + result.exitCode.toString();
        }
        //
        // extract issuer cert fields
        //
        var logX5CError = function (field) { return log.error("Can't parse " + field + " in the issuer's cert (in x5c JWK value)", error_1.ErrorCode.INVALID_KEY_X5C); };
        var cert = x509_1.Certificate.fromPEM(Buffer.from(PEM_CERT_HEADER + '\n' + x5c[0] + '\n' + PEM_CERT_FOOTER));
        var sanExt = cert.getExtension('subjectAltName');
        var subjectAltName = '';
        // TODO (what if there are more than one SAN? return all of them, make sure the issuer URL is one of them?)
        if (!sanExt || !sanExt['altNames'] || !sanExt['altNames'][0]) {
            logX5CError('subject alternative name');
        }
        else {
            var subjectAltNameExt = sanExt['altNames'][0];
            if (!subjectAltNameExt['uri'] || !subjectAltNameExt['tag']) {
                logX5CError('subject alternative name');
            }
            else {
                if (subjectAltNameExt['tag'] != '6') { // URI
                    var getTagName = function (tag) {
                        // per RFC 5280
                        switch (tag) {
                            case '0': return 'otherName';
                            case '1': return 'rfc822Name';
                            case '2': return 'dNSName';
                            case '3': return 'x400Address';
                            case '4': return 'directoryName';
                            case '5': return 'ediPartyName';
                            case '6': return 'uniformResourceIdentifier';
                            case '7': return 'iPAddress';
                            case '8': return 'registeredID';
                            default: return 'unknown';
                        }
                    };
                    log.error("Invalid subject alternative name prefix. Expected: 6 (URI). Actual: " + subjectAltNameExt['tag'] + " (" + getTagName(subjectAltNameExt['tag']) + ")", error_1.ErrorCode.INVALID_KEY_X5C);
                }
                subjectAltName = subjectAltNameExt['uri'];
            }
        }
        if (!cert.publicKeyRaw)
            logX5CError('public key');
        if (!cert.validFrom)
            logX5CError('validFrom');
        if (!cert.validTo)
            logX5CError('validTo');
        return {
            x: cert.publicKeyRaw ? node_jose_1.default.util.base64url.encode(cert.publicKeyRaw.slice(27, 59)) : '',
            y: cert.publicKeyRaw ? node_jose_1.default.util.base64url.encode(cert.publicKeyRaw.slice(59, 91)) : '',
            notBefore: cert.validFrom ? cert.validFrom : undefined,
            notAfter: cert.validTo ? cert.validTo : undefined,
            subjectAltName: subjectAltName
        };
    }
    catch (err) {
        log.error('Error validating x5c certificates: ' + err.toString(), error_1.ErrorCode.INVALID_KEY_X5C);
    }
    finally {
        certFiles.map(function (file) {
            fs_1.default.unlinkSync(file);
        });
    }
}
function verifyAndImportHealthCardIssuerKey(keySet, log, expectedSubjectAltName) {
    if (log === void 0) { log = new logger_1.default('Validate Key-Set'); }
    if (expectedSubjectAltName === void 0) { expectedSubjectAltName = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, i, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // check that keySet is valid
                    if (!(keySet instanceof Object) || !keySet.keys || !(keySet.keys instanceof Array)) {
                        return [2 /*return*/, log.fatal("keySet not valid. Expect {keys : JWK.Key[]}", error_1.ErrorCode.INVALID_KEY_SCHEMA)];
                    }
                    // failures will be recorded in the log. we can continue processing.
                    schema_1.validateSchema(keyset_schema_json_1.default, keySet, log);
                    _loop_1 = function (i) {
                        var key, keyName, ecPubKey, certFields_1, checkKeyValue, now, error_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    key = keySet.keys[i];
                                    keyName = 'key[' + (key.kid || i.toString()) + ']';
                                    log.info('Validating key : ' + keyName);
                                    log.debug("Key " + i.toString() + ":");
                                    log.debug(JSON.stringify(key, null, 3));
                                    // check for private key material (as to happen before the following store.add, because the returned
                                    // value will be the corresponding public key)
                                    // Note: this is RSA/ECDSA specific, but ok since ECDSA is mandated
                                    if (key.d) {
                                        log.error(keyName + ': ' + "key contains private key material.", error_1.ErrorCode.INVALID_KEY_PRIVATE);
                                    }
                                    ecPubKey = key;
                                    if (ecPubKey.x5c) {
                                        certFields_1 = validateX5c(ecPubKey.x5c, log);
                                        if (certFields_1) {
                                            checkKeyValue = function (v) {
                                                if (ecPubKey[v]) {
                                                    if (certFields_1[v] !== ecPubKey[v]) {
                                                        log.error("JWK public key value " + v + " doesn't match the certificate's public key", error_1.ErrorCode.INVALID_KEY_X5C);
                                                    }
                                                }
                                                else {
                                                    log.error("JWK missing elliptic curve public key value " + v, error_1.ErrorCode.INVALID_KEY_SCHEMA);
                                                }
                                            };
                                            checkKeyValue('x');
                                            checkKeyValue('y');
                                            if (expectedSubjectAltName && certFields_1.subjectAltName && certFields_1.subjectAltName !== expectedSubjectAltName) {
                                                log.error("Subject Alternative Name extension in the issuer's cert (in x5c JWK value) doesn't match issuer URL.\n" +
                                                    ("Expected: " + expectedSubjectAltName + ". Actual: " + certFields_1.subjectAltName.substring(4)), error_1.ErrorCode.INVALID_KEY_X5C);
                                            }
                                            now = new Date();
                                            if (certFields_1.notBefore && now < certFields_1.notBefore) {
                                                log.warn('issuer certificate (in x5c JWK value) is not yet valid', error_1.ErrorCode.INVALID_KEY_X5C);
                                            }
                                            if (certFields_1.notAfter && now > certFields_1.notAfter) {
                                                log.warn('issuer certificate (in x5c JWK value) is expired', error_1.ErrorCode.INVALID_KEY_X5C);
                                            }
                                        }
                                    }
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, keys_1.store.add(key)];
                                case 2:
                                    key = _b.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_2 = _b.sent();
                                    return [2 /*return*/, { value: log.error('Error adding key to keyStore : ' + error_2.message, error_1.ErrorCode.INVALID_KEY_UNKNOWN) }];
                                case 4:
                                    if (!!key.kid) return [3 /*break*/, 5];
                                    log.error(keyName + ': ' + "'kid' missing in issuer key", error_1.ErrorCode.INVALID_KEY_SCHEMA);
                                    return [3 /*break*/, 7];
                                case 5: return [4 /*yield*/, key.thumbprint('SHA-256')
                                        .then(function (tpDigest) {
                                        var thumbprint = node_jose_1.default.util.base64url.encode(tpDigest);
                                        if (key.kid !== thumbprint) {
                                            log.error(keyName + ': ' + "'kid' does not match thumbprint in issuer key. expected: "
                                                + thumbprint + ", actual: " + key.kid, error_1.ErrorCode.INVALID_KEY_WRONG_KID);
                                        }
                                    })
                                        .catch(function (err) {
                                        log.error(keyName + ': ' + "Failed to calculate issuer key thumbprint : " + err.message, error_1.ErrorCode.INVALID_KEY_UNKNOWN);
                                    })];
                                case 6:
                                    _b.sent();
                                    _b.label = 7;
                                case 7:
                                    // check that key type is 'EC'
                                    if (!key.kty) {
                                        log.error(keyName + ': ' + "'kty' missing in issuer key", error_1.ErrorCode.INVALID_KEY_SCHEMA);
                                    }
                                    else if (key.kty !== 'EC') {
                                        log.error(keyName + ': ' + "wrong key type in issuer key. expected: 'EC', actual: " + key.kty, error_1.ErrorCode.INVALID_KEY_WRONG_KTY);
                                    }
                                    // check that EC curve is 'ES256'
                                    if (!key.alg) {
                                        log.error(keyName + ': ' + "'alg' missing in issuer key", error_1.ErrorCode.INVALID_KEY_SCHEMA);
                                    }
                                    else if (key.alg !== 'ES256') {
                                        log.warn(keyName + ': ' + "wrong algorithm in issuer key. expected: 'ES256', actual: " + key.alg, error_1.ErrorCode.INVALID_KEY_WRONG_ALG);
                                    }
                                    // check that usage is 'sig'
                                    if (!key.use) {
                                        log.error(keyName + ': ' + "'use' missing in issuer key", error_1.ErrorCode.INVALID_KEY_SCHEMA);
                                    }
                                    else if (key.use !== 'sig') {
                                        log.warn(keyName + ': ' + "wrong usage in issuer key. expected: 'sig', actual: " + key.use, error_1.ErrorCode.INVALID_KEY_WRONG_USE);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < keySet.keys.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, log];
            }
        });
    });
}
exports.verifyAndImportHealthCardIssuerKey = verifyAndImportHealthCardIssuerKey;
//# sourceMappingURL=shcKeyValidator.js.map