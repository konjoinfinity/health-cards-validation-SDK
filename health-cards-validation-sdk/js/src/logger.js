"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevels = exports.LogItem = void 0;
var fs_1 = __importDefault(require("fs"));
var error_1 = require("./error");
var colors_1 = __importDefault(require("colors"));
var LogItem = /** @class */ (function () {
    function LogItem(message, code, logLevel) {
        if (code === void 0) { code = 0; }
        if (logLevel === void 0) { logLevel = LogLevels.INFO; }
        this.message = message;
        this.code = code;
        this.logLevel = logLevel;
    }
    return LogItem;
}());
exports.LogItem = LogItem;
var LogLevels;
(function (LogLevels) {
    // Print out everything
    LogLevels[LogLevels["DEBUG"] = 0] = "DEBUG";
    // Print out informational messages
    LogLevels[LogLevels["INFO"] = 1] = "INFO";
    // Only print out warnings
    LogLevels[LogLevels["WARNING"] = 2] = "WARNING";
    // Only print out errors
    LogLevels[LogLevels["ERROR"] = 3] = "ERROR";
    // Only print out fatal errors, where processing can't continue
    LogLevels[LogLevels["FATAL"] = 4] = "FATAL";
})(LogLevels = exports.LogLevels || (exports.LogLevels = {}));
// eslint-disable-next-line no-var
var Log = /** @class */ (function () {
    function Log(title) {
        if (title === void 0) { title = ''; }
        this.title = title;
        this.child = [];
        this.log = [];
        this._exitCode = 0;
    }
    Object.defineProperty(Log.prototype, "exitCode", {
        get: function () {
            var _this = this;
            this.child.forEach(function (c) {
                // set this exit code to the child if it's currently 0
                _this._exitCode = _this._exitCode || c.exitCode;
            });
            return this._exitCode;
        },
        enumerable: false,
        configurable: true
    });
    Log.prototype.debug = function (message) {
        this.log.push(new LogItem(message, 0, LogLevels.DEBUG));
        return this;
    };
    Log.prototype.info = function (message) {
        this.log.push(new LogItem(message, 0, LogLevels.INFO));
        return this;
    };
    Log.prototype.warn = function (message, code) {
        if (code === void 0) { code = error_1.ErrorCode.ERROR; }
        if (code == null || code <= 0) {
            throw new Error("Non-zero error code required.");
        }
        if (!Log.Exclusions.has(code)) {
            this.log.push(new LogItem(message, code, LogLevels.WARNING));
        }
        return this;
    };
    Log.prototype.error = function (message, code) {
        if (code === void 0) { code = error_1.ErrorCode.ERROR; }
        if (code == null || code <= 0) {
            throw new Error("Non-zero error code required.");
        }
        if (!Log.Exclusions.has(code)) {
            this.log.push(new LogItem(message, code, LogLevels.ERROR));
        }
        return this;
    };
    Log.prototype.fatal = function (message, code) {
        if (code === void 0) { code = error_1.ErrorCode.ERROR; }
        if (code == null || code <= 0) {
            throw new Error("Non-zero error code required.");
        }
        if (this._exitCode !== 0) {
            throw new Error("Exit code overwritten. Should only have one fatal error.");
        }
        this._exitCode = code;
        this.log.push(new LogItem(message, code, LogLevels.FATAL));
        return this;
    };
    Log.prototype.get = function (level) {
        return this.log.filter(function (item) {
            return item.logLevel === level;
        });
    };
    // collects errors from all children into a single collection; specify level to filter >= level
    Log.prototype.flatten = function (level) {
        var _this = this;
        if (level === void 0) { level = LogLevels.DEBUG; }
        var items = this.log
            .filter(function (item) {
            return item.logLevel >= level;
        })
            .map(function (e) {
            return { title: _this.title, message: e.message, code: e.code, level: e.logLevel };
        });
        this.child.forEach(function (c) { return items = items.concat(c.flatten(level)); });
        return items;
    };
    Log.prototype.toString = function (level) {
        if (level === void 0) { level = LogLevels.INFO; }
        return formatOutput(this, level).join('\n');
    };
    Log.prototype.toFile = function (path, options, append) {
        if (append === void 0) { append = true; }
        return toFile(this, path, options, append);
    };
    // static exclusion list, because each Log object is constructed in different files
    Log.Exclusions = new Set();
    return Log;
}());
exports.default = Log;
function list(title, items, color) {
    var results = items.length ? [color(title)] : [];
    items.forEach(function (e) {
        var lines = e.message.split('\n');
        lines.forEach(function (l, i) { return results.push(color((i === 0 ? '  · ' : '    ') + l)); });
    });
    return results;
}
function formatOutput(outputTree, level) {
    var results = [];
    switch (level) {
        case LogLevels.DEBUG:
            results.push(list("Debug", outputTree.get(LogLevels.DEBUG), colors_1.default.gray));
        // eslint-disable-next-line no-fallthrough
        case LogLevels.INFO:
            results.push(list("Info", outputTree.get(LogLevels.INFO), colors_1.default.white.dim));
        // eslint-disable-next-line no-fallthrough
        case LogLevels.WARNING:
            results.push(list("Warning", outputTree.get(LogLevels.WARNING), colors_1.default.yellow));
        // eslint-disable-next-line no-fallthrough
        case LogLevels.ERROR:
            results.push(list("Error", outputTree.get(LogLevels.ERROR), colors_1.default.red));
        // eslint-disable-next-line no-fallthrough
        case LogLevels.FATAL:
            results.push(list("Fatal", outputTree.get(LogLevels.FATAL), colors_1.default.red.inverse));
    }
    // remove empty entries
    results = results.filter(function (r) { return r.length; });
    outputTree.child.forEach(function (c) { return results.push(formatOutput(c, level)); });
    return [colors_1.default.bold(outputTree.title)].concat(results.map(function (r, i) {
        var lastChild = (i === results.length - 1);
        return [lines[0]].concat(r.map(function (s, j) {
            if (j === 0 && lastChild) {
                return lines[1] + s;
            }
            if (j === 0) {
                return lines[2] + s;
            }
            if (lastChild) {
                return lines[3] + s;
            }
            return lines[0] + s;
        }));
    }).flat());
}
var indentL = '   ';
var indentR = '  ';
var lines = [
    colors_1.default.dim(indentL + '│' + indentR),
    colors_1.default.dim(indentL + '└─' + indentR.slice(0, indentR.length - 1)),
    colors_1.default.dim(indentL + '├─' + indentR.slice(0, indentR.length - 1)),
    colors_1.default.dim(indentL + ' ' + indentR)
];
function toFile(log, logPath, options, append) {
    if (append === void 0) { append = true; }
    var fileContents = [];
    // if append, read the entire file and parse as JSON
    // append the current log
    // overwrite the existing file with everything
    if (append && fs_1.default.existsSync(logPath)) {
        fileContents = JSON.parse(fs_1.default.readFileSync(logPath).toString('utf-8'));
    }
    // TypeScript really does not want to let you index enums by string
    var level = LogLevels[options.loglevel.toLocaleUpperCase()];
    fileContents.push({
        "time": new Date().toString(),
        "options": options,
        "log": log.flatten(level)
    });
    fs_1.default.writeFileSync(logPath, JSON.stringify(fileContents, null, 4) + '\n');
}
//# sourceMappingURL=logger.js.map