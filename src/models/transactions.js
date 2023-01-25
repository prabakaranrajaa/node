var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var transactionsSchema = new Schema({
  transactionId: { type: String, default: '' },
  transactionDate: { type: Date, default: Date.now },
  transactionReceipt: [],
  transactionInfo: [],
  data: { type: Object, default: {} },
  blockNumber: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  owner_address: { type: String, default: '' },
  to_address: { type: String, default: '' },
  method: { type: String, default: '' },
  currency: { type: String, default: '' },
  status: { type: String, default: 'Unconfirmed' },
  dateTime: { type: Date, default: Date.now },
  transactionType: { type: String, default: 'Internal'},
  contract: { type: String, default: ''},
});
module.exports = mongoose.model("transactions", transactionsSchema, "transactions");