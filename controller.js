const express = require("express");
const router = express.Router();



router.post("/", function (req, res) {
    console.log(req.body)
    // Song.find({}).then(song => res.json(song));
})

module.exports = router;