var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var blockSchema = new Schema({
    name: { type: String, default: '' },
    compilerVersion: { type: String, default: '' }, 
    address: { type: String, default: '' },
    abi: { type: Object, default: '' },
    sourceCode: { type: String, default: '' },
    contractCreationCode: { type: String, default: '' },
    constructorArguments: { type: String, default: '' },
    deployedByteCode: { type: String, default: '' },
    swarmSource: { type: String, default: '' },
    totalSupply: { type: Number, default: '' }, 
    dateTime: { type: Date, default: Date.now },
});
module.exports = mongoose.model("smartContracts", blockSchema, "smartContracts");