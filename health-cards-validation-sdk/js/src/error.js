"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExcludeErrorCodes = exports.ExcludableErrors = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    // misc errors
    ErrorCode[ErrorCode["ERROR"] = 100] = "ERROR";
    ErrorCode[ErrorCode["DATA_FILE_NOT_FOUND"] = 101] = "DATA_FILE_NOT_FOUND";
    ErrorCode[ErrorCode["LOG_PATH_NOT_FOUND"] = 102] = "LOG_PATH_NOT_FOUND";
    ErrorCode[ErrorCode["CRITICAL_DATA_MISSING"] = 103] = "CRITICAL_DATA_MISSING";
    // card errors
    ErrorCode[ErrorCode["SCHEMA_ERROR"] = 104] = "SCHEMA_ERROR";
    ErrorCode[ErrorCode["FHIR_SCHEMA_ERROR"] = 105] = "FHIR_SCHEMA_ERROR";
    ErrorCode[ErrorCode["INFLATION_ERROR"] = 106] = "INFLATION_ERROR";
    ErrorCode[ErrorCode["JWS_HEADER_ERROR"] = 107] = "JWS_HEADER_ERROR";
    ErrorCode[ErrorCode["JWS_VERIFICATION_ERROR"] = 108] = "JWS_VERIFICATION_ERROR";
    ErrorCode[ErrorCode["SIGNATURE_FORMAT_ERROR"] = 109] = "SIGNATURE_FORMAT_ERROR";
    ErrorCode[ErrorCode["QR_DECODE_ERROR"] = 110] = "QR_DECODE_ERROR";
    ErrorCode[ErrorCode["ISSUER_KEY_DOWNLOAD_ERROR"] = 111] = "ISSUER_KEY_DOWNLOAD_ERROR";
    ErrorCode[ErrorCode["ISSUER_KEY_WELLKNOWN_ENDPOINT_CORS"] = 112] = "ISSUER_KEY_WELLKNOWN_ENDPOINT_CORS";
    ErrorCode[ErrorCode["ISSUER_NOT_TRUSTED"] = 113] = "ISSUER_NOT_TRUSTED";
    ErrorCode[ErrorCode["ISSUER_DIRECTORY_NOT_FOUND"] = 114] = "ISSUER_DIRECTORY_NOT_FOUND";
    ErrorCode[ErrorCode["INVALID_ISSUER_URL"] = 115] = "INVALID_ISSUER_URL";
    ErrorCode[ErrorCode["INVALID_QR"] = 116] = "INVALID_QR";
    ErrorCode[ErrorCode["INVALID_NUMERIC_QR"] = 117] = "INVALID_NUMERIC_QR";
    ErrorCode[ErrorCode["INVALID_NUMERIC_QR_HEADER"] = 118] = "INVALID_NUMERIC_QR_HEADER";
    ErrorCode[ErrorCode["MISSING_QR_CHUNK"] = 119] = "MISSING_QR_CHUNK";
    ErrorCode[ErrorCode["UNBALANCED_QR_CHUNKS"] = 120] = "UNBALANCED_QR_CHUNKS";
    ErrorCode[ErrorCode["INVALID_QR_VERSION"] = 121] = "INVALID_QR_VERSION";
    ErrorCode[ErrorCode["UNKNOWN_FILE_DATA"] = 122] = "UNKNOWN_FILE_DATA";
    ErrorCode[ErrorCode["JSON_PARSE_ERROR"] = 123] = "JSON_PARSE_ERROR";
    ErrorCode[ErrorCode["JWS_TOO_LONG"] = 124] = "JWS_TOO_LONG";
    ErrorCode[ErrorCode["INVALID_FILE_EXTENSION"] = 125] = "INVALID_FILE_EXTENSION";
    ErrorCode[ErrorCode["TRAILING_CHARACTERS"] = 126] = "TRAILING_CHARACTERS";
    ErrorCode[ErrorCode["NOT_YET_VALID"] = 127] = "NOT_YET_VALID";
    ErrorCode[ErrorCode["PROFILE_ERROR"] = 128] = "PROFILE_ERROR";
    // key errors
    ErrorCode[ErrorCode["INVALID_KEY_WRONG_KTY"] = 200] = "INVALID_KEY_WRONG_KTY";
    ErrorCode[ErrorCode["INVALID_KEY_WRONG_ALG"] = 201] = "INVALID_KEY_WRONG_ALG";
    ErrorCode[ErrorCode["INVALID_KEY_WRONG_USE"] = 202] = "INVALID_KEY_WRONG_USE";
    ErrorCode[ErrorCode["INVALID_KEY_WRONG_KID"] = 203] = "INVALID_KEY_WRONG_KID";
    ErrorCode[ErrorCode["INVALID_KEY_SCHEMA"] = 204] = "INVALID_KEY_SCHEMA";
    ErrorCode[ErrorCode["INVALID_KEY_PRIVATE"] = 205] = "INVALID_KEY_PRIVATE";
    ErrorCode[ErrorCode["INVALID_KEY_X5C"] = 206] = "INVALID_KEY_X5C";
    ErrorCode[ErrorCode["INVALID_KEY_UNKNOWN"] = 207] = "INVALID_KEY_UNKNOWN";
    // config errors
    ErrorCode[ErrorCode["OPENSSL_NOT_AVAILABLE"] = 300] = "OPENSSL_NOT_AVAILABLE";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
var ExcludableError = /** @class */ (function () {
    function ExcludableError(error, code) {
        this.error = error;
        this.code = code;
    }
    return ExcludableError;
}());
// maps error strings to error codes
// note: we currently only make certain errors excludable (e.g., those common in development)
exports.ExcludableErrors = [
    new ExcludableError('openssl-not-available', [ErrorCode.OPENSSL_NOT_AVAILABLE]),
    new ExcludableError('invalid-issuer-url', [ErrorCode.INVALID_ISSUER_URL]),
    new ExcludableError('invalid-key-x5c', [ErrorCode.INVALID_KEY_X5C]),
    new ExcludableError('invalid-key-wrong-kty', [ErrorCode.INVALID_KEY_WRONG_KTY]),
    new ExcludableError('invalid-key-wrong-alg', [ErrorCode.INVALID_KEY_WRONG_ALG]),
    new ExcludableError('invalid-key-wrong-use', [ErrorCode.INVALID_KEY_WRONG_USE]),
    new ExcludableError('invalid-key-wrong-kid', [ErrorCode.INVALID_KEY_WRONG_KID]),
    new ExcludableError('invalid-key-schema', [ErrorCode.INVALID_KEY_SCHEMA]),
    new ExcludableError('not-yet-valid', [ErrorCode.NOT_YET_VALID]),
    new ExcludableError('fhir-schema-error', [ErrorCode.FHIR_SCHEMA_ERROR]),
    new ExcludableError('issuer-key-download-error', [ErrorCode.ISSUER_KEY_DOWNLOAD_ERROR]),
    new ExcludableError('unbalanced-qr-chunks', [ErrorCode.UNBALANCED_QR_CHUNKS]),
    new ExcludableError('jws-too-long', [ErrorCode.JWS_TOO_LONG]),
    new ExcludableError('invalid-file-extension', [ErrorCode.INVALID_FILE_EXTENSION]),
    new ExcludableError('trailing-characters', [ErrorCode.TRAILING_CHARACTERS]),
    new ExcludableError('issuer-wellknown-endpoint-cors', [ErrorCode.ISSUER_KEY_WELLKNOWN_ENDPOINT_CORS])
];
function getExcludeErrorCodes(errors) {
    var errorCodes = new Set();
    var invalidErrors = new Set();
    for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
        var error = errors_1[_i];
        for (var _a = 0, ExcludableErrors_1 = exports.ExcludableErrors; _a < ExcludableErrors_1.length; _a++) {
            var excludableError = ExcludableErrors_1[_a];
            try {
                if (excludableError.error === error || new RegExp('^' + error.replace('*', '.*') + '$').test(excludableError.error)) {
                    excludableError.code.map(function (e) { return errorCodes.add(e); });
                }
            }
            catch (_b) {
                invalidErrors.add(error);
            }
        }
    }
    if (invalidErrors.size > 0) {
        console.log("Invalid exclusion error strings: ", Array.from(invalidErrors));
    }
    return errorCodes;
}
exports.getExcludeErrorCodes = getExcludeErrorCodes;
//# sourceMappingURL=error.js.map