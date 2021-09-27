const { checkDataType } = require("ajv/dist/compile/validate/dataType");
const express = require("express");
const router = express.Router();
const { validate } = require('./health-cards-validation-sdk/js/src/api')
const axios = require('axios');
const url = 'https://api.probit.com/api/exchange/v1/ticker?market_ids=BITG-USDT,BITG-BTC';
const options = { headers: { Accept: 'application/json' } };


router.post("/", async (req, res) => {
    console.log(req.body.data)
    const results = await validate.qrnumeric([req.body.data])
    console.log(results)
    var validNotValid;
    results.length === 0 ? validNotValid = true : validNotValid = false
    res.status(200).json({ data: validNotValid, message: results })
        .catch(err => console.error('error:' + err));
})

router.get("/bitg", async (req, res) => {
    var price = 0
    await axios.get(url, options)
        .then(json => price = json.data.data[0].last)
    res.status(200).json({ data: price })
})

module.exports = router;