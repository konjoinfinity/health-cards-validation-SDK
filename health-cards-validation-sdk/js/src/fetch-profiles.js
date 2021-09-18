"use strict";
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
var got_1 = __importDefault(require("got"));
var patient_profile_dm_url = 'http://build.fhir.org/ig/dvci/vaccine-credential-ig/branches/main/StructureDefinition-vaccination-credential-patient-dm.json';
var immunization_profile_dm_url = 'http://build.fhir.org/ig/dvci/vaccine-credential-ig/branches/main/StructureDefinition-vaccination-credential-immunization-dm.json';
function fetchProfile(url, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var profileJson, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, got_1.default(url).json()];
                case 1:
                    profileJson = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    // if we didn't get a profile, just return and the existing one will get used
                    console.warn("could not download profile from : " + url);
                    console.warn("existing profile will be used : " + fileName);
                    return [2 /*return*/];
                case 3:
                    // keep just the paths of the 0..0 properties
                    fs_1.default.writeFileSync(fileName, JSON.stringify(profileJson.snapshot.element
                        .filter(function (e) { return e.min === 0 && parseInt(e.max) === 0; })
                        .map(function (e) { return { "path": e.path }; }), null, 4));
                    return [2 /*return*/];
            }
        });
    });
}
void (function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchProfile(patient_profile_dm_url, './schema/patient-dm.json')];
            case 1:
                _a.sent();
                return [4 /*yield*/, fetchProfile(immunization_profile_dm_url, './schema/immunization-dm.json')];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=fetch-profiles.js.map