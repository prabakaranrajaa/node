var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var blockSchema = new Schema({
    name: { type: String, default: '' },  
    address: { type: String, default: '' },
    balance: { type: Number, default: '' },
    TRXCount: { type: Number, default: '' },
    creationTime: { type: Date, default: Date.now },
    validationTime: { type: Date, default: Date.now },
    apiId: { type: String, default: '' },
    decimal: { type: Number, default: '' },
    swapUrl: {type: String, default:''},
    tradeUrl: {type: String, default:''},
    details: []
});
module.exports = mongoose.model("contracts", blockSchema, "contracts");