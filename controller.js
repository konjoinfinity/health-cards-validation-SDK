const express = require("express");
const router = express.Router();
const { validate } = require('health-cards-validation-sdk/js/src/api.js')

// Then import src/api.js and call the right validate.<artifact-type> method, where <artifact-type> can be one of qrnumeric, 
// healthcard, fhirhealthcard, jws, jwspayload, fhirbundle, or keyset. The validation results, if any, are returned in 
// Promise-wrapped array. For example you could check a JWS via:


router.post("/", async (req, res) => {
    console.log(req.body.data)
    const results = await validate.qrnumeric(req.body.data)
    console.log(results)
    res.status(200).json({ data: results })
})

// app.post('/signup', async(req, res) => {
//     const { email, firstName } = req.body
//     const user = new User({ email, firstName })
//     const ret = await user.save()
//     res.json(ret)
//   })

module.exports = router;