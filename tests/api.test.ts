import * as api from '../src/api';
import fs from 'fs';
import path from 'path';
import { ErrorCode, LogLevels } from '../src/api';

const testdataDir = './testdata/';

interface IOptions {
    profile?: api.ValidationProfiles,
    directory?: string
}

// wrap testcard with a function that returns a function - now we don't need all 'async ()=> await' for every test case
function validateApi(
    filePath: string[] | string,
    type: string,
    expected: (number | null | undefined | ErrorCode[])[] = [/*ERROR+FATAL*/0, /*WARNING*/0,/*INFO*/null,/*DEBUG*/null,/*FATAL*/null],
    options?: IOptions) {

    return async () => {
        await _validateApi(filePath, type, expected, options);
    }
}

async function _validateApi(filePath: string[] | string, type: string, expected: (number | null | undefined | ErrorCode[])[], options?: IOptions): Promise<void> {

    let data: string[] = [];
    let url = '';

    if (typeof filePath === 'string') {
        url = filePath;
    } else {
        data = filePath.map(p => fs.readFileSync(path.join(testdataDir, p)).toString('utf-8'));
    }

    let p: Promise<api.ValidationErrors>;

    switch (type) {

        case 'qrnumeric':
            p = api.validate.qrnumeric(data, options);
            break;
        case 'healthcard':
            p = api.validate.healthcard(data[0], options);
            break;
        case 'fhirhealthcard':
            p = api.validate.fhirhealthcard(data[0], options);
            break;
        case 'jws':
            p = api.validate.jws(data[0], options);
            break;
        case 'jwspayload':
            p = api.validate.jwspayload(data[0], options);
            break;
        case 'fhirbundle':
            p = api.validate.fhirbundle(data[0], options);
            break;
        case 'keyset':
            p = api.validate.keyset(data[0], options);
            break;
        case 'trusteddirectory':
            p = api.validate.checkTrustedDirectory(url, options);
            break;
        default:
            throw new Error(`Unknown validation type: ${type}`);
    }

    let log = await p;

    log.length !== 0 && console.log(JSON.stringify(log));

    // skip the no-openssl warning
    log = log.filter(e => e.code !== api.ErrorCode.OPENSSL_NOT_AVAILABLE);


    // partition the errors by level [error[], warning[], info[], debug[], fatal[]]
    const errors = [
        log.filter(i => i.level >= LogLevels.ERROR),
        log.filter(i => i.level === LogLevels.WARNING),
        log.filter(i => i.level === LogLevels.INFO),
        log.filter(i => i.level === LogLevels.DEBUG),
        log.filter(i => i.level === LogLevels.FATAL)
    ];

    // if only 'errors' are specified warning will not get a default 0, so we'll set it here.
    if (expected.length === 1) expected[1] = 0;
    expected.length = 5;

    for (let i = 0; i < errors.length; i++) {
        const exp = expected[i];
        const err = errors[i];

        if (Number.isInteger(exp)) {
            expect(err.length).toBe(exp);
        }

        if (exp instanceof Array) {
            // then number of expected errors should equal the number of actual errors
            expect(err).toHaveLength(exp.length);
            for (let j = 0; j < err.length; j++) {
                // -1 if expected error code not found
                expect(exp.indexOf(err[j].code)).toBeGreaterThanOrEqual(0);
            }
        }
    }
}

//
// This api works differently than the command-line tool. Errors are not bubbled-up from child artifacts.
// For example, when validating a health-card, the contained jws string is not validated, just
// the surrounding health-card. The jws content would need to be validated with an additional call.
//

const EC = ErrorCode;

test('fhirbundle', validateApi(['example-00-a-fhirBundle.json'], 'fhirbundle'));

test('jwspayload', validateApi(['example-00-b-jws-payload-expanded.json'], 'jwspayload'));

test('jws-', validateApi(['example-00-d-jws.txt'], 'jws'));

test('healthcard', validateApi(['example-00-e-file.smart-health-card'], 'healthcard'));

test('qrnumeric', validateApi(['example-00-f-qr-code-numeric-value-0.txt'], 'qrnumeric'));

test('fhirhealthcard', validateApi(['test-example-00-fhirhealthcard.json'], 'fhirhealthcard'));

test('keyset', validateApi(['valid_keys.json'], 'keyset'));


test('fhirbundle-with-usa-profile', validateApi(
    ['test-example-00-a-fhirBundle-profile-usa.json'],
    'fhirbundle',
    [[EC.PROFILE_ERROR, EC.PROFILE_ERROR, EC.PROFILE_ERROR, EC.PROFILE_ERROR, EC.PROFILE_ERROR]],
    { profile: api.ValidationProfiles['usa-covid19-immunization'] }));

test('fhirbundle: bad meta with extra key', validateApi(['test-example-00-a-fhirBundle-bad_meta_extra_key.json'], 'fhirbundle', [0, [EC.FHIR_SCHEMA_ERROR]]));

test('jws: der encoded signature r-negative', validateApi(['test-example-00-d-jws-der-signature-r-neg.txt'], 'jws', [[EC.SIGNATURE_FORMAT_ERROR]]));


test('jwspayload: valid 02 JWS payload expanded', validateApi(['test-example-00-b-jws-payload-expanded-trailing_chars.json'], 'jwspayload', [0, [EC.TRAILING_CHARACTERS]]));


test('jws: no deflate', validateApi(['test-example-00-d-jws-no_deflate.txt'], 'jws', [[EC.INFLATION_ERROR, EC.JWS_HEADER_ERROR], [EC.JWS_TOO_LONG]]));


test('qrnumeric: invalid QR header', validateApi(['test-example-00-f-qr-code-numeric-value-0-wrong_qr_header.txt'], 'qrnumeric', [[EC.INVALID_NUMERIC_QR_HEADER]]));


test('healthcard: health card w/ trailing chars', validateApi(['test-example-00-e-file-trailing_chars.smart-health-card'], 'healthcard', [0, [EC.TRAILING_CHARACTERS]]));


test('jws: issuer in trusted directory ref by name', validateApi(['example-00-d-jws.txt'], 'jws', [0], { directory: 'test' }));


test('jws: issuer in trusted directory ref by URL', validateApi(['example-00-d-jws.txt'], 'jws', [0], { directory: 'https://raw.githubusercontent.com/smart-on-fhir/health-cards-validation-SDK/main/testdata/test-issuers.json' }));


test('jws: issuer not in trusted directory', validateApi(['example-00-d-jws.txt'], 'jws', [[EC.ISSUER_NOT_TRUSTED]], { directory: 'VCI' }));


test('jws: invalid directory', validateApi('https://spec.smarthealth.cards/examples/issuer', 'trusteddirectory', [[EC.ISSUER_DIRECTORY_NOT_FOUND]], { directory: 'foo' }));


test('jws: valid directory', validateApi('https://spec.smarthealth.cards/examples/issuer', 'trusteddirectory', [0], { directory: 'test' }));
