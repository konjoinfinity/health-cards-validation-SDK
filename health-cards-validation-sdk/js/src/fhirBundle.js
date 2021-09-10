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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.FhirOptions = exports.ValidationProfiles = exports.loincCovidTestCodes = exports.cdcCovidCvxCodes = void 0;
var utils = __importStar(require("./utils"));
var schema_1 = require("./schema");
var fs_1 = __importDefault(require("fs"));
var error_1 = require("./error");
var fhir_schema_json_1 = __importDefault(require("../schema/fhir-schema.json"));
var immunization_dm_json_1 = __importDefault(require("../schema/immunization-dm.json"));
var patient_dm_json_1 = __importDefault(require("../schema/patient-dm.json"));
var logger_1 = __importDefault(require("./logger"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var utils_1 = require("./utils");
// Subset of the CDC covid vaccine codes (https://www.cdc.gov/vaccines/programs/iis/COVID-19-related-codes.html),
// currently pre-authorized in the US (https://www.cdc.gov/vaccines/covid-19/info-by-product/index.html)
exports.cdcCovidCvxCodes = ["207", "208", "212"];
// LOINC covid test codes (https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1114.9/expansion)
exports.loincCovidTestCodes = ["50548-7", "68993-5", "82159-5", "94306-8", "94307-6", "94308-4", "94309-2", "94500-6", "94502-2", "94503-0", "94504-8", "94507-1", "94508-9", "94531-1", "94533-7", "94534-5", "94547-7", "94558-4", "94559-2", "94562-6", "94563-4", "94564-2", "94565-9", "94640-0", "94661-6", "94756-4", "94757-2", "94758-0", "94759-8", "94760-6", "94761-4", "94762-2", "94764-8", "94845-5", "95209-3", "95406-5", "95409-9", "95416-4", "95423-0", "95424-8", "95425-5", "95542-7", "95608-6", "95609-4"];
var ValidationProfiles;
(function (ValidationProfiles) {
    ValidationProfiles[ValidationProfiles["any"] = 0] = "any";
    ValidationProfiles[ValidationProfiles["usa-covid19-immunization"] = 1] = "usa-covid19-immunization";
})(ValidationProfiles = exports.ValidationProfiles || (exports.ValidationProfiles = {}));
var FhirOptions = /** @class */ (function () {
    function FhirOptions() {
    }
    FhirOptions.LogOutputPath = '';
    FhirOptions.ValidationProfile = ValidationProfiles.any;
    return FhirOptions;
}());
exports.FhirOptions = FhirOptions;
function validate(fhirBundleText) {
    var log = new logger_1.default('FhirBundle');
    var profile = FhirOptions.ValidationProfile;
    if (fhirBundleText.trim() !== fhirBundleText) {
        log.warn("FHIR bundle has leading or trailing spaces", error_1.ErrorCode.TRAILING_CHARACTERS);
        fhirBundleText = fhirBundleText.trim();
    }
    var fhirBundle = utils.parseJson(fhirBundleText);
    if (fhirBundle === undefined) {
        return log.fatal("Failed to parse FhirBundle data as JSON.", error_1.ErrorCode.JSON_PARSE_ERROR);
    }
    if (FhirOptions.LogOutputPath) {
        fs_1.default.writeFileSync(FhirOptions.LogOutputPath, fhirBundleText); // should we instead print out the output of beautify
    }
    // failures will be recorded in the log
    if (!schema_1.validateSchema(fhir_schema_json_1.default, fhirBundle, log))
        return log;
    // to continue validation, we must have a list of resources in .entry[]
    if (!fhirBundle.entry ||
        !(fhirBundle.entry instanceof Array) ||
        fhirBundle.entry.length === 0) {
        // The schema check above will list the expected properties/type
        return log.fatal("FhirBundle.entry[] required to continue.", error_1.ErrorCode.CRITICAL_DATA_MISSING);
    }
    var _loop_1 = function (i) {
        var entry = fhirBundle.entry[i];
        var resource = entry.resource;
        if (resource == null) {
            log.error("Schema: entry[" + i.toString() + "].resource missing");
            return "continue";
        }
        if (!resource.resourceType) {
            log.error("Schema: entry[" + i.toString() + "].resource.resourceType missing");
            return "continue";
        }
        if (!fhir_schema_json_1.default.definitions[resource.resourceType]) {
            log.error("Schema: entry[" + i.toString() + "].resource.resourceType '" + resource.resourceType + "' unknown");
            return "continue";
        }
        schema_1.validateSchema({ $ref: 'https://smarthealth.cards/schema/fhir-schema.json#/definitions/' + resource.resourceType }, resource, log, ['', 'entry', i.toString(), resource.resourceType].join('/'));
        if (resource.id) {
            log.warn("Bundle.entry[" + i.toString() + "].resource[" + resource.resourceType + "] should not include .id elements", error_1.ErrorCode.FHIR_SCHEMA_ERROR);
        }
        if (resource.meta) {
            // resource.meta.security allowed as special case, however, no other properties may be included on .meta
            if (!resource.meta.security || Object.keys(resource.meta).length > 1) {
                log.warn("Bundle.entry[" + i.toString() + "].resource[" + resource.resourceType + "].meta should only include .security property with an array of identity assurance codes", error_1.ErrorCode.FHIR_SCHEMA_ERROR);
            }
        }
        if (resource.text) {
            log.warn("Bundle.entry[" + i.toString() + "].resource[" + resource.resourceType + "] should not include .text elements", error_1.ErrorCode.FHIR_SCHEMA_ERROR);
        }
        // walks the property tree of this resource object
        // the callback receives the child property and it's path 
        // objPathToSchema() maps a schema property to a property path
        // currently, oneOf types will break this system
        utils_1.walkProperties(entry.resource, [entry.resource.resourceType], function (o, path) {
            var propType = schema_1.objPathToSchema(path.join('.'));
            if (propType === 'CodeableConcept' && o['text']) {
                log.warn('fhirBundle.entry[' + i.toString() + ']' + ".resource." + path.join('.') + " (CodeableConcept) should not include .text elements", error_1.ErrorCode.FHIR_SCHEMA_ERROR);
            }
            if (propType === 'Coding' && o['display']) {
                log.warn('fhirBundle.entry[' + i.toString() + ']' + ".resource." + path.join('.') + " (Coding) should not include .display elements", error_1.ErrorCode.FHIR_SCHEMA_ERROR);
            }
            if (propType === 'Reference' && o['reference'] && !/[^:]+:\d+/.test(o['reference'])) {
                log.warn('fhirBundle.entry[' + i.toString() + ']' + ".resource." + path.join('.') + " (Reference) should be short resource-scheme URIs (e.g., {“patient”: {“reference”: “resource:0”}})", error_1.ErrorCode.SCHEMA_ERROR);
            }
            if ( // warn on empty string, empty object, empty array
            (o instanceof Array && o.length === 0) ||
                (typeof o === 'string' && o === '') ||
                (o instanceof Object && Object.keys(o).length === 0)) {
                log.error('fhirBundle.entry[' + i.toString() + ']' + ".resource." + path.join('.') + " is empty. Empty elements are invalid.", error_1.ErrorCode.FHIR_SCHEMA_ERROR);
            }
        });
        // with Bundle.entry.fullUrl populated with short resource-scheme URIs (e.g., {"fullUrl": "resource:0})
        if ((typeof entry.fullUrl !== 'string') || !/resource:\d+/.test(entry.fullUrl)) {
            log.warn('fhirBundle.entry.fullUrl should be short resource-scheme URIs (e.g., {“fullUrl”: “resource:0}"', error_1.ErrorCode.FHIR_SCHEMA_ERROR);
        }
    };
    //
    // Validate each resource of .entry[]
    //
    for (var i = 0; i < fhirBundle.entry.length; i++) {
        _loop_1(i);
    }
    if (profile === ValidationProfiles['usa-covid19-immunization']) {
        log.info("applying profile : usa-covid19-immunization");
        ValidationProfilesFunctions['usa-covid19-immunization'](fhirBundle.entry, log);
    }
    log.info("FHIR bundle validated");
    log.debug("FHIR Bundle Contents:");
    log.debug(json_beautify_1.default(fhirBundle, null, 3, 100));
    return log;
}
exports.validate = validate;
var ValidationProfilesFunctions = {
    "any": function (entries) {
        return true || entries;
    },
    "usa-covid19-immunization": function (entries, log) {
        var profileName = 'usa-covid19-immunization';
        var patients = entries.filter(function (entry) { return entry.resource.resourceType === 'Patient'; });
        if (patients.length !== 1) {
            log.error("Profile : " + profileName + " : requires exactly 1 " + 'Patient' + " resource. Actual : " + patients.length.toString(), error_1.ErrorCode.PROFILE_ERROR);
        }
        var immunizations = entries.filter(function (entry) { return entry.resource.resourceType === 'Immunization'; });
        if (immunizations.length === 0) {
            log.error("Profile : " + profileName + " : requires 1 or more Immunization resources. Actual : " + immunizations.length.toString(), error_1.ErrorCode.PROFILE_ERROR);
        }
        var expectedResources = ["Patient", "Immunization"];
        entries.forEach(function (entry, index) {
            var _a, _b, _c;
            if (!expectedResources.includes(entry.resource.resourceType)) {
                log.error("Profile : " + profileName + " : resourceType: " + entry.resource.resourceType + " is not allowed.", error_1.ErrorCode.PROFILE_ERROR);
                expectedResources.push(entry.resource.resourceType); // prevent duplicate errors
                return;
            }
            if (entry.resource.resourceType === "Immunization") {
                // verify that valid covid vaccine codes are used
                var code = (_c = (_b = (_a = entry.resource) === null || _a === void 0 ? void 0 : _a.vaccineCode) === null || _b === void 0 ? void 0 : _b.coding[0]) === null || _c === void 0 ? void 0 : _c.code;
                if (code && !exports.cdcCovidCvxCodes.includes(code)) {
                    log.error("Profile : " + profileName + " : Immunization.vaccineCode.code requires valid COVID-19 code (" + exports.cdcCovidCvxCodes.join(',') + ").", error_1.ErrorCode.PROFILE_ERROR);
                }
                // check for properties that are forbidden by the dm-profiles
                immunization_dm_json_1.default.forEach(function (constraint) {
                    utils_1.propPath(entry.resource, constraint.path) &&
                        log.error("Profile : " + profileName + " : entry[" + index.toString() + "].resource." + constraint.path + " should not be present.", error_1.ErrorCode.PROFILE_ERROR);
                });
            }
            if (entry.resource.resourceType === "Patient") {
                // check for properties that are forbidden by the dm-profiles
                patient_dm_json_1.default.forEach(function (constraint) {
                    utils_1.propPath(entry.resource, constraint.path) &&
                        log.error("Profile : " + profileName + " : entry[" + index.toString() + "].resource." + constraint.path + " should not be present.", error_1.ErrorCode.PROFILE_ERROR);
                });
            }
        });
        return true;
    }
};
//# sourceMappingURL=fhirBundle.js.map