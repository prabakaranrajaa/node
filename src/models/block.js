var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var blockSchema = new Schema({
  blockNumber: { type: Number, default: '' },
  txnCount: { type: Number, default: 0 },
  transferCount: { type: Number, default: 0 },
  blockDate: { type: Date, default: Date.now },
  data: { type: Object, default: {} },
  producedBy: { type: String, default: 'WYTH' },
  blockReward: { type: String, default: '0' },
  dateTime: { type: Date, default: Date.now }
});
module.exports = mongoose.model("block", blockSchema, "block");