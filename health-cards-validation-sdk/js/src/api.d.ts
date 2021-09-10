import { ValidationProfiles } from './fhirBundle';
import { LogLevels } from './logger';
import { ErrorCode } from './error';
interface IOptions {
    logLevel?: LogLevels;
    profile?: ValidationProfiles;
    directory?: string;
}
declare function validateKeySet(text: string, options?: IOptions): Promise<ValidationErrors>;
declare function validateQrnumeric(shc: string[], options?: IOptions): Promise<ValidationErrors>;
declare function validateHealthcard(json: string, options?: IOptions): Promise<ValidationErrors>;
declare function validateFhirHealthcard(json: string, options?: IOptions): Promise<ValidationErrors>;
declare function validateJws(text: string, options?: IOptions): Promise<ValidationErrors>;
declare function validateJwspayload(payload: string, options?: IOptions): Promise<ValidationErrors>;
declare function validateFhirBundle(json: string, options?: IOptions): Promise<ValidationErrors>;
declare function checkTrustedDirectory(url: string, options?: IOptions): Promise<ValidationErrors>;
export { ErrorCode } from './error';
export { LogLevels } from './logger';
export declare type ValidationErrors = {
    message: string;
    code: ErrorCode;
    level: LogLevels;
}[];
export declare const validate: {
    qrnumeric: typeof validateQrnumeric;
    healthcard: typeof validateHealthcard;
    fhirhealthcard: typeof validateFhirHealthcard;
    jws: typeof validateJws;
    jwspayload: typeof validateJwspayload;
    fhirbundle: typeof validateFhirBundle;
    keyset: typeof validateKeySet;
    checkTrustedDirectory: typeof checkTrustedDirectory;
};
export { ValidationProfiles };
