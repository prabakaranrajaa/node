const jwt = require('jsonwebtoken');
const config = require('config');
const AppUsers = require('../models/AppUsers');
const AppUserActivities = require('../models/AppUserActivities');
const { consoleLog } = require('../helpers/CommonHelper');

const auth_app = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, config.get('jwt.secretKey'));
    const appUser = await AppUsers.findOne({
      _id: decoded._id,
    });

    if (!appUser) {
      throw new Error('Invalid User');
    }

    const userToken = await AppUserActivities.findOne({
      userId: appUser._id,
      token: token,
    });

    if (!userToken) {
      throw new Error('Invalid Token');
    }

    const activeUserRole = req.header('ActiveUserRole');
    if (!activeUserRole) {
      return res.status(401).send({ message: 'Invalid User Role' });
    }

    const userRoleInfo = await appUser.userRole.find(
      (x) => x.userType === activeUserRole
    );

    if (!userRoleInfo) {
      consoleLog('Invalid User Role');
      throw new Error();
    }

    req.token = token;
    req.activeUser = appUser;
    req.activeUserRoleInfo = userRoleInfo;
    req.activeUserInfo = {};
    req.activeUserInfo.createdByName = req.activeUser.name;
    req.activeUserInfo.createdByType = userRoleInfo.userType;
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

module.exports = auth_app;
