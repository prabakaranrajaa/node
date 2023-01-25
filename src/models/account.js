var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var accountSchema = new Schema({
  address: { type: String, default: '' },
  balance: { type: Number, default: 0},
  tokens: [
    {
      address: { type: String, default: '' },
      balance: { type: Number, default: 0},
    }
  ],
  dateTime: { type: Date, default: Date.now }
});
module.exports = mongoose.model("account", accountSchema, "account");