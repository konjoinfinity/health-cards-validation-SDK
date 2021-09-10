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
exports.validate = exports.schema = void 0;
var utils = __importStar(require("./utils"));
var schema_1 = require("./schema");
var error_1 = require("./error");
var smart_health_card_schema_json_1 = __importDefault(require("../schema/smart-health-card-schema.json"));
var jws = __importStar(require("./jws-compact"));
var logger_1 = __importDefault(require("./logger"));
exports.schema = smart_health_card_schema_json_1.default;
function validate(healthCardText) {
    return __awaiter(this, void 0, void 0, function () {
        var log, healthCard, vc, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    log = new logger_1.default('SMART Health Card');
                    if (healthCardText.trim() !== healthCardText) {
                        log.warn("Health Card has leading or trailing spaces", error_1.ErrorCode.TRAILING_CHARACTERS);
                        healthCardText = healthCardText.trim();
                    }
                    healthCard = utils.parseJson(healthCardText);
                    if (healthCard == undefined) {
                        return [2 /*return*/, log.fatal("Failed to parse HealthCard data as JSON.", error_1.ErrorCode.JSON_PARSE_ERROR)];
                    }
                    // failures will be recorded in the log. we can continue processing.
                    schema_1.validateSchema(smart_health_card_schema_json_1.default, healthCard, log);
                    vc = healthCard.verifiableCredential;
                    if (!vc ||
                        !(vc instanceof Array) ||
                        vc.length === 0 ||
                        vc.find(function (e) { typeof e !== 'string'; })) {
                        // The schema check above will list the expected properties/type
                        return [2 /*return*/, log.fatal("HealthCard.verifiableCredential[jws-compact] required to continue.", error_1.ErrorCode.CRITICAL_DATA_MISSING)];
                    }
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < vc.length)) return [3 /*break*/, 4];
                    _b = (_a = log.child).push;
                    return [4 /*yield*/, jws.validate(vc[i], vc.length > 1 ? i.toString() : '')];
                case 2:
                    _b.apply(_a, [(_c.sent())]);
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, log];
            }
        });
    });
}
exports.validate = validate;
//# sourceMappingURL=healthCard.js.map