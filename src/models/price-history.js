var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var blockSchema = new Schema({
  token: { type: String, default: '' },
  price: { type: Number, default: 0 },
  dateTime: { type: Date, default: Date.now }
});
module.exports = mongoose.model("priceHistory", blockSchema, "priceHistory");