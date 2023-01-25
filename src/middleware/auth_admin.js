const jwt = require('jsonwebtoken');
const config = require('config');
const AdminUsers = require('../models/AdminUsers');
const AdminUserActivities = require('../models/AdminUserActivities');
const { consoleLog } = require('../helpers/CommonHelper');
const auth_admin = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, config.get('jwt.secretKey'));
    const adminUser = await AdminUsers.findOne({
      _id: decoded._id,
    });

    if (!adminUser) {
      throw new Error('Invalid Token');
    }

    const userToken = await AdminUserActivities.findOne({
      userId: adminUser._id,
      token: token,
    });

    if (!userToken) {
      throw new Error('Invalid DB Token');
    }

    req.token = token;
    req.activeUser = adminUser;
    req.activeUserInfo = {};
    req.activeUserInfo.createdByName = req.activeUser.name;
    req.activeUserInfo.createdByType = req.activeUser.userType;
    req.activeUserInfo.createdById = req.activeUser._id;
    req.activeUserInfo.updatedByName = req.activeUser.name;
    req.activeUserInfo.updatedByType = req.activeUser.userType;
    req.activeUserInfo.updatedById = req.activeUser._id;
    next();
  } catch (e) {
    consoleLog(e);
    res.status(401).send({ error: 'Please Authenticate' });
  }
};

module.exports = auth_admin;
