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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.schema = void 0;
var utils = __importStar(require("./utils"));
var schema_1 = require("./schema");
var error_1 = require("./error");
var smart_health_card_vc_schema_json_1 = __importDefault(require("../schema/smart-health-card-vc-schema.json"));
var fhirBundle = __importStar(require("./fhirBundle"));
var logger_1 = __importDefault(require("./logger"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var fhirBundle_1 = require("./fhirBundle");
exports.schema = smart_health_card_vc_schema_json_1.default;
function validate(jwsPayloadText) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var log = new logger_1.default('JWS.payload');
    var supportedTypes = {
        healthCard: 'https://smarthealth.cards#health-card',
        immunization: 'https://smarthealth.cards#immunization',
        laboratory: 'https://smarthealth.cards#laboratory',
        covid19: 'https://smarthealth.cards#covid19',
        vc: 'VerifiableCredential'
    };
    if (jwsPayloadText.trim() !== jwsPayloadText) {
        log.warn("JWS payload has leading or trailing spaces", error_1.ErrorCode.TRAILING_CHARACTERS);
        jwsPayloadText = jwsPayloadText.trim();
    }
    var jwsPayload = utils.parseJson(jwsPayloadText);
    console.log(jwsPayload)
    if (!jwsPayload || typeof jwsPayload !== 'object') {
        return log.fatal("Failed to parse JWS.payload data as JSON.", error_1.ErrorCode.JSON_PARSE_ERROR);
    }
    log.debug("JWS Payload Contents:");
    log.debug(json_beautify_1.default(jwsPayload, null, 3, 100));
    console.log(json_beautify_1.default(jwsPayload, null, 3, 100));
    // failures will be recorded in the log. we can continue processing.
    schema_1.validateSchema(smart_health_card_vc_schema_json_1.default, jwsPayload, log);
    // validate issuance date, if available - the schema check above will flag if missing/invalid
    if (utils.isNumeric(jwsPayload.nbf)) {
        var nbf = new Date();
        nbf.setTime(jwsPayload.nbf * 1000); // convert seconds to milliseconds
        var now = new Date();
        if (nbf > now) {
            if (jwsPayload.nbf > new Date(2021, 1, 1).getTime()) {
                // we will assume the nbf was encoded in milliseconds, and we will return an error
                var dateParsedInMilliseconds = new Date();
                dateParsedInMilliseconds.setTime(jwsPayload.nbf);
                log.error("Health card is not yet valid, nbf=" + jwsPayload.nbf + " (" + nbf.toUTCString() + ").\n" +
                    "nbf should be encoded in seconds since 1970-01-01T00:00:00Z UTC.\n" +
                    ("Did you encode the date in milliseconds, which would give the date: " + dateParsedInMilliseconds.toUTCString() + "?"), error_1.ErrorCode.NOT_YET_VALID);
            }
            else {
                log.warn("Health card is not yet valid, nbf=" + jwsPayload.nbf + " (" + nbf.toUTCString() + ").", error_1.ErrorCode.NOT_YET_VALID);
            }
        }
    }
    if (jwsPayload.vc && Object.keys(jwsPayload.vc).includes("@context")) {
        log.warn("JWS.payload.vc shouldn't have a @context property", error_1.ErrorCode.SCHEMA_ERROR);
    }
    if (!((_b = (_a = jwsPayload === null || jwsPayload === void 0 ? void 0 : jwsPayload.vc) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.includes(supportedTypes.healthCard))) {
        log.error("JWS.payload.vc.type SHALL contain '" + supportedTypes.healthCard + "'", error_1.ErrorCode.SCHEMA_ERROR);
    }
    // to continue validation, we must have a FHIR bundle string to validate
    if (!((_d = (_c = jwsPayload === null || jwsPayload === void 0 ? void 0 : jwsPayload.vc) === null || _c === void 0 ? void 0 : _c.credentialSubject) === null || _d === void 0 ? void 0 : _d.fhirBundle)) {
        // The schema check above will list the expected properties/type
        return log.fatal("JWS.payload.vc.credentialSubject.fhirBundle{} required to continue.", error_1.ErrorCode.CRITICAL_DATA_MISSING);
    }
    log.info("JWS Payload validated");
    var fhirBundleJson = jwsPayload.vc.credentialSubject.fhirBundle;
    console.log(fhirBundleJson)
    var fhirBundleText = JSON.stringify(fhirBundleJson);
    console.log(fhirBundleText)
    log.child.push((fhirBundle.validate(fhirBundleText)));
    // does the FHIR bundle contain an immunization?
    var hasImmunization = (_e = fhirBundleJson === null || fhirBundleJson === void 0 ? void 0 : fhirBundleJson.entry) === null || _e === void 0 ? void 0 : _e.some(function (entry) { var _a; return ((_a = entry === null || entry === void 0 ? void 0 : entry.resource) === null || _a === void 0 ? void 0 : _a.resourceType) === 'Immunization'; });
    // does the FHIR bundle contain a covid immunization?
    var hasCovidImmunization = (_f = fhirBundleJson === null || fhirBundleJson === void 0 ? void 0 : fhirBundleJson.entry) === null || _f === void 0 ? void 0 : _f.some(function (entry) {
        var _a, _b, _c, _d;
        return entry.resource.resourceType === 'Immunization' &&
            (fhirBundle_1.cdcCovidCvxCodes.includes((_d = (_c = (_b = (_a = entry === null || entry === void 0 ? void 0 : entry.resource) === null || _a === void 0 ? void 0 : _a.vaccineCode) === null || _b === void 0 ? void 0 : _b.coding) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.code));
    });
    // does the FHIR bundle contain a covid lab observation?
    // TODO: support more general labs
    // http://build.fhir.org/ig/dvci/vaccine-credential-ig/branches/main/StructureDefinition-covid19-laboratory-result-observation.html
    var hasCovidObservation = (_g = fhirBundleJson === null || fhirBundleJson === void 0 ? void 0 : fhirBundleJson.entry) === null || _g === void 0 ? void 0 : _g.some(function (entry) {
        var _a, _b, _c, _d;
        return entry.resource.resourceType === 'Observation' &&
            (fhirBundle_1.loincCovidTestCodes.includes((_d = (_c = (_b = (_a = entry === null || entry === void 0 ? void 0 : entry.resource) === null || _a === void 0 ? void 0 : _a.code) === null || _b === void 0 ? void 0 : _b.coding) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.code));
    });
    // check for health card VC types (https://spec.smarthealth.cards/vocabulary/)
    var hasImmunizationType = (_j = (_h = jwsPayload === null || jwsPayload === void 0 ? void 0 : jwsPayload.vc) === null || _h === void 0 ? void 0 : _h.type) === null || _j === void 0 ? void 0 : _j.includes(supportedTypes.immunization);
    var hasLaboratoryType = (_l = (_k = jwsPayload === null || jwsPayload === void 0 ? void 0 : jwsPayload.vc) === null || _k === void 0 ? void 0 : _k.type) === null || _l === void 0 ? void 0 : _l.includes(supportedTypes.laboratory);
    var hasCovidType = (_o = (_m = jwsPayload === null || jwsPayload === void 0 ? void 0 : jwsPayload.vc) === null || _m === void 0 ? void 0 : _m.type) === null || _o === void 0 ? void 0 : _o.includes(supportedTypes.covid19);
    var hasVerifiableCredential = (_q = (_p = jwsPayload === null || jwsPayload === void 0 ? void 0 : jwsPayload.vc) === null || _p === void 0 ? void 0 : _p.type) === null || _q === void 0 ? void 0 : _q.includes(supportedTypes.vc);
    if (hasImmunization && !hasImmunizationType) {
        log.warn("JWS.payload.vc.type SHOULD contain '" + supportedTypes.immunization + "'", error_1.ErrorCode.SCHEMA_ERROR);
    }
    else if (!hasImmunization && hasImmunizationType) {
        log.warn("JWS.payload.vc.type SHOULD NOT contain '" + supportedTypes.immunization + "', no immunization resources found", error_1.ErrorCode.SCHEMA_ERROR);
    }
    if (hasCovidObservation && !hasLaboratoryType) {
        log.warn("JWS.payload.vc.type SHOULD contain '" + supportedTypes.laboratory + "'", error_1.ErrorCode.SCHEMA_ERROR);
    }
    if ((hasCovidImmunization || hasCovidObservation) && !hasCovidType) {
        log.warn("JWS.payload.vc.type SHOULD contain '" + supportedTypes.covid19 + "'", error_1.ErrorCode.SCHEMA_ERROR);
    }
    else if (!(hasCovidImmunization || hasCovidObservation) && hasCovidType) {
        log.warn("JWS.payload.vc.type SHOULD NOT contain '" + supportedTypes.covid19 + "', no covid immunization or observation found", error_1.ErrorCode.SCHEMA_ERROR);
    }
    if (hasVerifiableCredential) {
        log.warn("JWS.payload.vc.type : '" + supportedTypes.vc + "' is not required and may be omitted to conserve space", error_1.ErrorCode.SCHEMA_ERROR);
    }
    ((_r = jwsPayload === null || jwsPayload === void 0 ? void 0 : jwsPayload.vc) === null || _r === void 0 ? void 0 : _r.type) && ((_s = jwsPayload === null || jwsPayload === void 0 ? void 0 : jwsPayload.vc) === null || _s === void 0 ? void 0 : _s.type.forEach(function (t) {
        if (!Object.values(supportedTypes).includes(t)) {
            log.warn("JWS.payload.vc.type : '" + t + "' is an unknown Verifiable Credential (VC) type (see: https://spec.smarthealth.cards/vocabulary/)", error_1.ErrorCode.SCHEMA_ERROR);
        }
    }));
    return log;
}
exports.validate = validate;
//# sourceMappingURL=jws-payload.js.map