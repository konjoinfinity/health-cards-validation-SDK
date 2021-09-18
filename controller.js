const { checkDataType } = require("ajv/dist/compile/validate/dataType");
const express = require("express");
const router = express.Router();
const { validate } = require('./health-cards-validation-sdk/js/src/api')

// async function thisQR(shc){
//     return await validate.qrnumeric(shc)
// }

router.post("/", async (req, res) => {
    console.log(req.body.data)
    const results = await validate.qrnumeric(req.body.data)
    console.log(results)
    var validNotValid;
    results.length === 0 ? validNotValid = true : validNotValid = false
    res.status(200).json({ data: validNotValid, message: results })
})

module.exports = router;