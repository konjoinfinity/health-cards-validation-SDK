const express = require("express");
const router = express.Router();
const node = require("node")
const validate = require('health-cards-validation-sdk/js/src/api.js')

// Then import src/api.js and call the right validate.<artifact-type> method, where <artifact-type> can be one of qrnumeric, 
// healthcard, fhirhealthcard, jws, jwspayload, fhirbundle, or keyset. The validation results, if any, are returned in 
// Promise-wrapped array. For example you could check a JWS via:

// 


router.post("/", function (req, res) {
    console.log(req.body)
    const shcData = req.body;
    const results = validate.shc(shcData);
    results.then(console.log)
})

module.exports = router;