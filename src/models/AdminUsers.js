const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
  contactNumberSchema,
  addressSchema,
  userSettingsSchema,
  createdSchema,
  IdSchema,
} = require('./common/common');

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 8,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

Schema.methods.generateSetPasswordToken = async function () {
  const adminUser = this;
  const expireTime = new Date();
  const token = jwt.sign(
    { _id: adminUser._id.toString(), expireTime },
    config.get('jwt.secretKey')
  );
  expireTime.setSeconds(expireTime.getSeconds() + 60 * 30);
  adminUser.resetPasswordToken = token;
  adminUser.resetPasswordTokenExpires = expireTime;
  await adminUser.save();

  return token;
};

Schema.statics.findByCredentials = async (email, password) => {
  const adminUser = await AdminUsers.findOne({ email });

  if (!adminUser) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, adminUser.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return adminUser;
};

const AdminUsers = mongoose.model('AdminUsers', Schema, 'AdminUsers');
module.exports = AdminUsers;
