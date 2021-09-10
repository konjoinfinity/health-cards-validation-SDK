"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.objPathToSchema = exports.validateSchema = void 0;
var error_1 = require("./error");
var fhir_schema_json_1 = __importDefault(require("../schema/fhir-schema.json"));
var ajv_1 = __importDefault(require("ajv"));
var schemaCache = {};
function validateSchema(schema, data, log, pathPrefix) {
    if (pathPrefix === void 0) { pathPrefix = ''; }
    // by default, the validator will stop at the first failure. 'allErrors' allows it to keep going.
    var schemaId = schema["$id"] || schema["$ref"];
    var isFhirSchema = schemaId.startsWith(fhir_schema_json_1.default.$id);
    try {
        if (!schemaCache[schemaId]) {
            var ajv = new ajv_1.default({ strict: false, allErrors: true });
            if (schema.$ref) {
                schemaCache[schemaId] = ajv.addSchema(fhir_schema_json_1.default).compile(schema);
            }
            else {
                schemaCache[schemaId] = ajv.compile(schema);
            }
        }
        var validate = schemaCache[schemaId];
        if (validate(data)) {
            return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        var errors_1 = validate.errors
            .map(function (err) {
            // reformat the schema errors into something more readable:
            err.instancePath = pathPrefix + err.instancePath;
            switch (err.keyword) {
                // · Schema: {"instancePath":"","schemaPath":"#/required","keyword":"required","params":{"missingProperty":"resourceType"},"message":"must have required property 'resourceType'"}
                case "required":
                    return "Schema: " + err.instancePath + " requires property " + err.params.missingProperty;
                // · Schema: {"instancePath":"","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"resourceType1"},"message":"must NOT have additional properties"}
                case "additionalProperties":
                    return "Schema: " + err.instancePath + " additional property '" + err.params.additionalProperty + "' not allowed";
                //  Schema: {"instancePath":"/birthDate","schemaPath":"#/definitions/date/pattern","keyword":"pattern",
                // "params":{"pattern":"^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$"},
                // "message":"must match pattern \"^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$\""}
                case "pattern":
                    return "Schema: " + err.instancePath + " must match pattern : '" + err.params.pattern + "'.";
                // · Schema: {"instancePath":"","schemaPath":"#/oneOf","keyword":"oneOf","params":{"passingSchemas":null},"message":"must match exactly one schema in oneOf"}
                case "oneOf":
                    return "Schema: " + err.instancePath + " property must must match exactly one schema in oneOf";
                default:
                    return "Schema: " + err.instancePath + " error : " + err.message;
            }
        });
        // remove the duplicates (can be many if property part of oneOf[])
        errors_1 = errors_1
            .filter(function (err, index) { return errors_1.indexOf(err) === index; });
        errors_1.forEach(function (ve) {
            log.error(ve, isFhirSchema ? error_1.ErrorCode.FHIR_SCHEMA_ERROR : error_1.ErrorCode.SCHEMA_ERROR);
        });
        return false;
    }
    catch (err) {
        var missingRef = err.missingRef;
        if (missingRef) {
            var property = err.missingRef.split('/').pop();
            log.error("Schema: " + (pathPrefix + property) + " additional property '" + property + "' not allowed");
        }
        else {
            log.error('Schema: ' + err.message, isFhirSchema ? error_1.ErrorCode.FHIR_SCHEMA_ERROR : error_1.ErrorCode.SCHEMA_ERROR);
        }
        return false;
    }
}
exports.validateSchema = validateSchema;
// from a path, follow the schema to figure out a 'type'
function objPathToSchema(path) {
    var schema = fhir_schema_json_1.default;
    var properties = path.split('.');
    var p = schema.definitions[properties[0]];
    if (p == null)
        return 'unknown';
    var t = properties[0];
    for (var i = 1; i < properties.length; i++) {
        if (p.properties) {
            p = p.properties[properties[i]];
            // this property is not valid according to the schema
            if (p == null) {
                t = "unknown";
                break;
            }
            // directly has a ref, then it is that type
            if (p.$ref) {
                t = p.$ref.slice(p.$ref.lastIndexOf('/') + 1);
                p = schema.definitions[t];
                continue;
            }
            // has and items prop of ref, then it is an array of that type
            if (p.items && '$ref' in p.items) {
                t = p.items.$ref.slice(p.items.$ref.lastIndexOf('/') + 1);
                p = schema.definitions[t];
                continue;
            }
            // has and items prop of ref, then it is an array of that type
            if (p.enum) {
                t = "enum";
                continue;
            }
        }
        if (p.const) {
            t = 'const';
            continue;
        }
        if (p.type) {
            t = p.type;
            continue;
        }
        throw new Error('Should not get here.');
    }
    return t;
}
exports.objPathToSchema = objPathToSchema;
//# sourceMappingURL=schema.js.map