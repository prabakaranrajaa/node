var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var blockManagementSchema = new Schema({
  from: { type: Number, default: 0 },
  to: { type: Number, default: 0 },
  status: { type: Number, default: 0 }
});
module.exports = mongoose.model("blockManagement", blockManagementSchema, "blockManagement");