const wrapAsync = require("../ultils/wrapAsync");
const CircSupply = require("../models/circSupply");

module.exports.renderCircApi = wrapAsync(async (req, res, next) => {
    const circSupply = await CircSupply.findOne({});
    res.json(circSupply.circSupply);
})

module.exports.renderEditCirc = wrapAsync(async (req, res, next) => {
    const circSupply = await CircSupply.findOne({});
    res.render("api/editCircSupply", { circSupply });
})

module.exports.editCirc = wrapAsync(async (req, res, next) => {
    console.log(req.body)
    await CircSupply.findOneAndUpdate({}, req.body);
    res.redirect("/api/circulating-supply");
})