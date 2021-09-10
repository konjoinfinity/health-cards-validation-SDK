"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumeric = exports.walkProperties = exports.propPath = exports.isOpensslAvailable = exports.inflatePayload = exports.loadJSONFromFile = exports.parseJson = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var pako_1 = __importDefault(require("pako"));
var execa_1 = __importDefault(require("execa"));
function parseJson(json) {
    try {
        return JSON.parse(json);
    }
    catch (_a) {
        return undefined;
    }
}
exports.parseJson = parseJson;
function loadJSONFromFile(filePath) {
    // get absolute file path 
    // just to make it easier to figure out why the file is missing
    filePath = path_1.default.resolve(filePath);
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error("File not found : " + filePath);
    }
    var fileContent = fs_1.default.readFileSync(filePath, 'utf8');
    var output;
    // check if the file is valid JSON
    try {
        output = JSON.parse(fileContent);
    }
    catch (_a) {
        throw new Error("File not valid JSON : " + filePath);
    }
    return output;
}
exports.loadJSONFromFile = loadJSONFromFile;
function inflatePayload(verificationResult) {
    // keep typescript happy by extending object with a 'zip' property
    var header = verificationResult.header;
    var payload = verificationResult.payload;
    if (header.zip && header.zip === 'DEF') {
        try {
            payload = Buffer.from(pako_1.default.inflateRaw(payload));
        }
        catch (error) {
            throw new Error("Inflate Failed : " + error.message);
        }
    }
    return payload;
}
exports.inflatePayload = inflatePayload;
function isOpensslAvailable() {
    try {
        var result = execa_1.default.commandSync("openssl version");
        return (result.exitCode == 0);
    }
    catch (err) {
        return false;
    }
}
exports.isOpensslAvailable = isOpensslAvailable;
//
// get an object property using a string path
//
function propPath(object, path) {
    var props = path.split('.');
    var val = object;
    for (var i = 1; i < props.length; i++) {
        val = val[props[i]];
        if (val instanceof Array)
            val = val.length === 0 ? val : val[0];
        if (val === undefined)
            return val;
    }
    return val;
}
exports.propPath = propPath;
//
// walks through an objects properties calling a callback with a path for each.
//
function walkProperties(obj, path, callback) {
    if (obj instanceof Array) {
        for (var i = 0; i < obj.length; i++) {
            var element = obj[i];
            if (element instanceof Object) {
                walkProperties(element, path.slice(0), callback);
            }
        }
        if (obj.length === 0)
            callback(obj, path);
        return;
    }
    callback(obj, path);
    if (!(obj instanceof Object))
        return;
    for (var propName in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, propName)) {
            var prop = obj[propName];
            path.push(propName);
            walkProperties(prop, path.slice(0), callback);
            path.pop();
        }
    }
    return;
}
exports.walkProperties = walkProperties;
//
// verifies a value is a number
//
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
exports.isNumeric = isNumeric;
//# sourceMappingURL=utils.js.map