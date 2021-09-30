"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
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
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
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
exports.validate = void 0;
var error_1 = require("./error");
var jws = __importStar(require("./jws-compact"));
var logger_1 = __importDefault(require("./logger"));
var MAX_QR_CHUNK_LENGTH = 1191;
function validate(qr) {
    return __awaiter(this, void 0, void 0, function () {
        var log, jwsString, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    log = new logger_1.default(qr.length > 1 ?
                        'QR numeric (' + qr.length.toString() + ')' :
                        'QR numeric');
                    jwsString = shcChunksToJws(qr, log);
                    _a = jwsString;
                    if (!_a) return [3 /*break*/, 2];
                    _c = (_b = log.child).push;
                    return [4 /*yield*/, jws.validate(jwsString)];
                case 1:
                    _a = (_c.apply(_b, [(_d.sent())]));
                    _d.label = 2;
                case 2:
                    _a;
                    return [2 /*return*/, log];
            }
        });
    });
}
exports.validate = validate;
function shcChunksToJws(shc, log) {
    var chunkCount = shc.length;
    var jwsChunks = new Array(chunkCount);
    for (var _i = 0, shc_1 = shc; _i < shc_1.length; _i++) {
        var shcChunk = shc_1[_i];
        if (shcChunk.trim() !== shcChunk) {
            log.warn("Numeric QR has leading or trailing spaces", error_1.ErrorCode.TRAILING_CHARACTERS);
            shcChunk = shcChunk.trim();
        }
        var chunkResult = shcToJws(shcChunk, log, chunkCount);
        if (!chunkResult)
            return undefined; // move on to next chunk
        var chunkIndex = chunkResult.chunkIndex;
        if (chunkResult.result.length > MAX_QR_CHUNK_LENGTH) {
            log.error("QR chunk " + chunkIndex + " is larger than " + MAX_QR_CHUNK_LENGTH + " bytes", error_1.ErrorCode.INVALID_NUMERIC_QR);
        }
        if (jwsChunks[chunkIndex - 1]) {
            // we have a chunk index collision
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            log.fatal("we have two chunks with index " + chunkIndex, error_1.ErrorCode.INVALID_NUMERIC_QR_HEADER);
            return undefined;
        }
        else {
            jwsChunks[chunkIndex - 1] = chunkResult.result;
        }
    }
    // make sure we have all chunks we expect
    for (var i = 0; i < chunkCount; i++) {
        if (!jwsChunks[i]) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            log.fatal('missing QR chunk ' + i, error_1.ErrorCode.MISSING_QR_CHUNK);
            return undefined;
        }
    }
    if (shc.length > 1)
        log.info('All shc parts decoded');
    var jws = jwsChunks.join('');
    if (chunkCount > 1 && jws.length <= MAX_QR_CHUNK_LENGTH) {
        log.warn("JWS of size " + jws.length + " (<= " + MAX_QR_CHUNK_LENGTH + ") didn't need to be split in " + chunkCount + " chunks", error_1.ErrorCode.INVALID_QR);
    }
    // check if chunk sizes are balanced
    var expectedChunkSize = Math.floor(jws.length / chunkCount);
    var balancedSizeBuffer = Math.ceil(expectedChunkSize * (0.5 / 100)); // give some leeway to what we call "balanced", 0.5% away from expected size
    if (jwsChunks.map(function (jwsChunk) { return jwsChunk.length; })
        .reduce(function (unbalanced, length) { return unbalanced || length < expectedChunkSize - balancedSizeBuffer || length > expectedChunkSize + balancedSizeBuffer; }, false)) {
        log.warn("QR chunk sizes are unbalanced: " + jwsChunks.map(function (jwsChunk) { return jwsChunk.length.toString(); }).join(), error_1.ErrorCode.UNBALANCED_QR_CHUNKS);
    }
    log.debug('JWS = ' + jws);
    return jws;
}
function shcToJws(shc, log, chunkCount) {
    if (chunkCount === void 0) { chunkCount = 1; }
    var chunked = chunkCount > 1;
    var qrHeader = 'shc:/';
    var positiveIntRegExp = '[1-9][0-9]*';
    var chunkIndex = 1;
    // check numeric QR header
    var isChunkedHeader = new RegExp("^" + qrHeader + positiveIntRegExp + "/" + chunkCount + "/.*$").test(shc);
    if (chunked) {
        if (!isChunkedHeader) {
            // should have been a valid chunked header, check if we are missing one
            var hasBadChunkCount = new RegExp("^" + qrHeader + positiveIntRegExp + "/[1-9][0-9]*/.*$").test(shc);
            var found = shc.match(new RegExp("^" + qrHeader + positiveIntRegExp + "/(?<expectedChunkCount2>[1-9][0-9]*)/.*$")); // FIXME!!!!!
            if (found)
                console.log(found);
            if (hasBadChunkCount) {
                var expectedChunkCount = parseInt(shc.substring(7, 8));
                log.fatal("Missing QR code chunk: received " + chunkCount + ", expected " + expectedChunkCount, error_1.ErrorCode.MISSING_QR_CHUNK);
                return undefined;
            }
        }
    }
    else {
        if (isChunkedHeader) {
            log.warn("Single-chunk numeric QR code should have a header " + qrHeader + ", not " + qrHeader + "1/1/", error_1.ErrorCode.INVALID_NUMERIC_QR_HEADER);
            chunked = true; // interpret the code as chunked even though it shouldn't
        }
    }
    if (!new RegExp(chunked ? "^" + qrHeader + positiveIntRegExp + "/" + chunkCount + "/.*$" : "^" + qrHeader + ".*$", 'g').test(shc)) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        var expectedHeader = chunked ? "" + qrHeader + positiveIntRegExp + "/" + positiveIntRegExp + "/" : "" + qrHeader;
        log.error("Invalid numeric QR header: expected " + expectedHeader, error_1.ErrorCode.INVALID_NUMERIC_QR_HEADER);
        return undefined;
    }
    // check numeric QR encoding
    if (!new RegExp(chunked ? "^" + qrHeader + positiveIntRegExp + "/" + chunkCount + "/[0-9]+$" : "^" + qrHeader + "[0-9]+$", 'g').test(shc)) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        var expectedBody = chunked ? "" + qrHeader + positiveIntRegExp + "/" + positiveIntRegExp + "/[0-9]+" : qrHeader + "[0-9]+";
        log.fatal("Invalid numeric QR: expected " + expectedBody, error_1.ErrorCode.INVALID_NUMERIC_QR);
        return undefined;
    }
    // get the chunk index
    if (chunked) {
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        var found = shc.match(new RegExp("^shc:/(?<chunkIndex>" + positiveIntRegExp + ")"));
        chunkIndex = (found && found.groups && found.groups['chunkIndex']) ? parseInt(found.groups['chunkIndex']) : -1;
        if (chunkIndex < 1 || chunkIndex > chunkCount) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            log.fatal("Invalid QR chunk index: " + chunkIndex, error_1.ErrorCode.INVALID_NUMERIC_QR_HEADER);
            return undefined;
        }
    }
    var bodyIndex = shc.lastIndexOf('/') + 1;
    var b64Offset = '-'.charCodeAt(0);
    var digitPairs = shc.substring(bodyIndex).match(/(\d\d?)/g);
    if (digitPairs == null || digitPairs[digitPairs.length - 1].length == 1) {
        log.fatal("Invalid numeric QR code, can't parse digit pairs. Numeric values should have even length.\n" +
            "Make sure no leading 0 are deleted from the encoding.", error_1.ErrorCode.INVALID_NUMERIC_QR);
        return undefined;
    }
    // since source of numeric encoding is base64url-encoded data (A-Z, a-z, 0-9, -, _, =), the lowest
    // expected value is 0 (ascii(-) - 45) and the biggest one is 77 (ascii(z) - 45), check that each pair
    // is no larger than 77
    if (Math.max.apply(Math, digitPairs.map(function (d) { return Number.parseInt(d); })) > 77) {
        log.fatal("Invalid numeric QR code, one digit pair is bigger than the max value 77 (encoding of 'z')." +
            "Make sure you followed the encoding rules.", error_1.ErrorCode.INVALID_NUMERIC_QR);
        return undefined;
    }
    // breaks string array of digit pairs into array of numbers: 'shc:/123456...' = [12,34,56,...]
    var jws = digitPairs
        // for each number in array, add an offset and convert to a char in the base64 range
        .map(function (c) { return String.fromCharCode(Number.parseInt(c) + b64Offset); })
        // merge the array into a single base64 string
        .join('');
    log.info(shc.slice(0, shc.lastIndexOf('/')) + '/... decoded');
    log.debug(shc.slice(0, shc.lastIndexOf('/')) + '/... = ' + jws);
    console.log(jws)
    console.log(chunkIndex)
    return { result: jws, chunkIndex: chunkIndex };
}
//# sourceMappingURL=qr.js.map