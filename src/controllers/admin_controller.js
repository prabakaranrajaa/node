const config = require('config');
const queryHelper = require("../helpers/queryHelper");
const Transactions = require("../models/transactions");
const Block = require("../models/block");
const Account = require("../models/account");
const Contracts = require("../models/contracts");
const bcrypt = require('bcryptjs');
var getJSON = require('get-json')

exports.loginAdminUser = async (req, res) => {
    try {
      const adminUser = await AdminUsers.findByCredentials(
        req.body.email,
        req.body.password
      );
  
      if (adminUser.enable2FA) {
        res.send({
          status: true,
          message: 'Please Verify 2FA',
          data: { adminUser },
        });
      } else {
        const token = jwt.sign(
          { _id: adminUser._id.toString() },
          config.get('jwt.secretKey')
        );
  
        const adminUserToken = new AdminUserActivities({
          userType: 'Administrator',
          userId: adminUser._id,
          token,
        });
        await adminUserToken.save();
        res.send({
          status: true,
          message: 'Logged In Successfully',
          data: { adminUser, token },
        });
        req.activeUser = adminUser;
        req.activeUser.userType = 'Admin';
        await insertAuditLogs('Administrator', 'Log-In', req, res);
      }
    } catch (e) {
      consoleLog(e);
      res.status(400).send({
        status: false,
        message: 'Invalid User Name OR Password',
      });
    }
  };