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
var jszip_1 = __importDefault(require("jszip"));
var got_1 = __importDefault(require("got"));
var fullSchemaLink = 'https://hl7.org/fhir/R4/fhir.schema.json.zip';
//
// Unzip the full FHIR schema
//
function getFullSchema() {
    return __awaiter(this, void 0, void 0, function () {
        var zip, zipPath, outPath, zipFileName, zipBuffer, zipArchive, zipFileData, fileContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    zip = new jszip_1.default();
                    zipPath = "./schema/fhir.schema.json.zip";
                    outPath = './schema/fhir-schema-full.json';
                    zipFileName = "fhir.schema.json";
                    return [4 /*yield*/, got_1.default(fullSchemaLink).buffer().catch(function (err) {
                            console.log('Error downloading ' + fullSchemaLink + ' : ' + err.message);
                            process.exit(1);
                        })];
                case 1:
                    zipBuffer = _a.sent();
                    return [4 /*yield*/, zip.loadAsync(zipBuffer)];
                case 2:
                    zipArchive = _a.sent();
                    zipFileData = zipArchive.file(zipFileName);
                    if (!zipFileData)
                        throw new Error(zipFileName + " not found in zip file : " + zipPath);
                    return [4 /*yield*/, zipFileData.async('string')];
                case 3:
                    fileContent = _a.sent();
                    fs_1.default.writeFileSync(outPath, fileContent);
                    return [2 /*return*/, JSON.parse(fileContent)];
            }
        });
    });
}
//
// Creates a smaller FHIR sub-schema from a list of FHIR Resources
// The new schema will contain the Resources and any child definitions required by those Resources.
//
function pruneSchema(resources /*, fullFhirSchema?: Schema*/) {
    return __awaiter(this, void 0, void 0, function () {
        var fullFhirSchema, newSchema, definitionNames, oneOf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getFullSchema()];
                case 1:
                    fullFhirSchema = _a.sent();
                    newSchema = {
                        $schema: "http://json-schema.org/draft-07/schema#",
                        $id: "https://smarthealth.cards/schema/fhir-schema.json",
                        oneOf: [{
                                $ref: "#/definitions/Bundle"
                            }],
                        definitions: {
                            ResourceList: {
                                oneOf: []
                            }
                        }
                    };
                    definitionNames = [];
                    oneOf = newSchema.definitions.ResourceList.oneOf || [];
                    // for each required resource, find all the child definitions
                    // definitionNames will fill with all the required child-definitions
                    resources.forEach(function (resource) { return findChildRefs(fullFhirSchema, resource, definitionNames); });
                    definitionNames.sort();
                    definitionNames.forEach(function (name) {
                        var def = fullFhirSchema.definitions[name];
                        newSchema.definitions[name] = def;
                        // If this def is a Resource type, add a $ref to the oneOf collection
                        if (def.properties && def.properties.resourceType && def.properties.resourceType.const) {
                            oneOf.push({ "$ref": "#/definitions/" + def.properties.resourceType.const });
                        }
                    });
                    // Schema validation of the Bundle.entries will happen separately.  We'll replace the ResourceList type
                    // with a generic object to prevent further validation here.
                    // The reason is that if the entry items have bad schema, we will get dozens of errors as the bad-schema object
                    // fails to match any of the possible Resources. So instead, we validate the entries individually against
                    // the resource type specified in its resourceType field.
                    newSchema.definitions['Bundle_Entry'].properties.resource = { "type": "object" };
                    return [2 /*return*/, newSchema];
            }
        });
    });
}
function findChildRefs(schema, definitionName, definitionList, indent) {
    if (indent === void 0) { indent = ""; }
    // Special case, do nothing as we are in the process of building this list
    if (definitionName === 'ResourceList')
        return;
    // do nothing is this is a known def
    if (definitionList.includes(definitionName))
        return;
    console.log(indent + definitionName);
    // add the definition
    var definition = schema.definitions[definitionName];
    delete definition.description;
    definitionList.push(definitionName);
    // recurse the defs properties
    for (var key in definition.properties) {
        // Extension properties begin with '_' - remove them unless extensions are required
        if (key.substring(0, 1) === '_') {
            delete definition.properties[key];
            continue;
        }
        var prop = definition.properties[key];
        // remove description field to save some space
        delete prop.description;
        if (prop["$ref"]) {
            var ref = prop["$ref"].slice(prop["$ref"].lastIndexOf('/') + 1);
            definitionList.includes(ref) || findChildRefs(schema, ref, definitionList, indent + "    ");
            continue;
        }
        if (prop.items && '$ref' in prop.items) {
            var ref = prop.items.$ref.slice(prop.items["$ref"].lastIndexOf('/') + 1);
            // remove Extension properties to further reduce the schema size
            // comment this out is Extensions are required
            if (ref === 'Extension') {
                delete definition.properties[key];
                continue;
            }
            definitionList.includes(ref) || findChildRefs(schema, ref, definitionList, indent + "    ");
            continue;
        }
    }
    return;
}
void pruneSchema([
    "Bundle",
    "Patient",
    "DiagnosticReport",
    "Observation",
    "Immunization",
    "Location",
    "Organization",
    "Condition",
    "Encounter",
    "AllergyIntolerance",
    "MedicationRequest",
    "Medication",
    "Specimen"
]).then(function (schema) {
    fs_1.default.writeFileSync('./schema/fhir-schema.json', JSON.stringify(schema, null, 2));
});
//# sourceMappingURL=prune-fhir-schema.js.map