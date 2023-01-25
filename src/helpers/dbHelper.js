const commonHelper = require('../helpers/commonHelper');
const Pool = require('../database/pg');
const fs = require('fs');
const config = require('config');

exports.executeQuery = async (query) => {
  try {
    commonHelper.consoleLog(query);
    result = await Pool.query(query);
    if (result) {
      return {
        status: true,
        message: 'Query Executed Successfully',
        data: { records: result.rows ? result.rows : [] },
      };
    } else {
      return { status: false, message: 'Query Failed to Execute' };
    }
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};

exports.getOneData = async (selectionArr, tableName, where) => {
  try {
    if ((!tableName, !where)) {
      return { status: false, message: 'Invalid Arguments' };
    }
    let query = 'SELECT ';
    if (selectionArr.length == 0) {
      query += '*';
    }
    query += ` FROM ${tableName} `;
    if (where) {
      query += ` WHERE ${where} `;
    }

    result = await this.executeQuery(query);

    return {
      status: result.status,
      data: { record: result.status ? result.data.records[0] : [] },
    };
  } catch (e) {
    commonHelper.consoleLog(query);
    console.log(e);
    return { status: false, message: e };
  }
};

exports.getData = async (selectionArr, tableName, where, req, res) => {
  try {
    let query = 'SELECT ';
    if (selectionArr.length == 0) {
      query += '*';
    } else {
      selectionArr.forEach((element, index) => {
        query += element;
        if (index > 0) {
          query += ', ';
        }
      });
    }
    query += ', count(*) OVER() AS totallength';
    query += ` FROM ${tableName}`;
    if (where) {
      query += ` WHERE ${where}`;
    }
    if (req.query) {
      if (req.query.sort && req.query.order) {
        query += ` ORDER BY ${req.query.sort} ${req.query.order}`;
      }

      if (req.query.pagesize && req.query.page) {
        query += ` LIMIT ${req.query.pagesize} OFFSET (${req.query.page} - 1) *  ${req.query.pagesize}`;
      }
    }
    result = this.executeQuery(query);
    return result;
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};

exports.getRecords = async (selectionArr, tableName, where, req, res) => {
  try {
    let query = 'SELECT ';
    if (selectionArr.length == 0) {
      query += '*';
    } else {
      selectionArr.forEach((element, index) => {
        query += element;
        if (index > 0) {
          query += ', ';
        }
      });
    }
    query += ', count(*) OVER() AS totallength';
    query += ` FROM ${tableName}`;
    if (where) {
      query += ` WHERE ${where}`;
    }
    if (req.query) {
      if (req.query.sort && req.query.order) {
        query += ` ORDER BY ${req.query.sort} ${req.query.order}`;
      }

      if (req.query.pagesize && req.query.page) {
        query += ` LIMIT ${req.query.pagesize} OFFSET (${req.query.page} - 1) *  ${req.query.pagesize}`;
      }
    }
    result = await this.executeQuery(query);
    return result.status && result.data.records ? result.data.records : [];
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};

exports.insertData = async (dataArr, tableName) => {
  try {
    let query = `INSERT INTO ${tableName} (`;
    // const fields = dataArr.keys();
    // const values = dataArr.values();

    for (const [key, value] of Object.entries(dataArr)) {
      query += `${key},`;
    }

    query = query.replace(/,*$/, '');
    query += `) VALUES (`;
    let count = 1;
    let valuesArr = [];
    for (const [key, value] of Object.entries(dataArr)) {
      query += `$${count++},`;
      valuesArr.push(value);
    }
    query = query.replace(/,*$/, '');
    query += `) RETURNING *;`;

    result = await Pool.query(query, valuesArr);
    if (result.rows && result.rows.length > 0) {
      return {
        status: true,
        message: 'Record Insert Successfully',
        data: { record: result.rows[0] },
      };
    } else {
      return {
        status: false,
        message: 'Failed to Insert',
      };
    }
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};

exports.patchData = async (dataArr, tableName, whereArr, req, res) => {
  try {
    if (req.activeRole && !req.activeRole.user_type) {
      dataArr.updated_log = {
        updatedTime: new Date(),
        updatedById: req.activeUser
          ? req.activeUser.id
          : 'o0o0oooo-o0o0-0000-o000-0oooo000o0o2',
        updatedByType: req.activeUser
          ? req.activeUser.activeRole.user_role
          : 'Administrator',
        updatedByName: req.activeUser
          ? req.activeUser.full_name
          : config.get('adminUser.name'),
      };
    } else {
      dataArr.updated_log = {
        updatedTime: new Date(),
        updatedById: req.activeUser
          ? req.activeUser.id
          : 'o0o0oooo-o0o0-0000-o000-0oooo000o0o2',
        createdByType:
          req.activeUser && req.activeUser.activeRole
            ? req.activeUser.activeRole.user_type
            : 'App_USER',
        updatedByName: req.activeUser
          ? req.activeUser.full_name
          : 'App_User_Name',
      };
    }
    let query = `UPDATE ${tableName} SET `;
    let count = 1;
    let valuesArr = [];
    for (const [key, value] of Object.entries(dataArr)) {
      query += `${key} = $${count++},`;
      valuesArr.push(value);
    }
    query = query.replace(/,*$/, '');

    query += ` WHERE `;
    whereArr.forEach((element, index) => {
      if (index !== 0) {
        query += ' AND ';
      }
      query += `${element.key} = $${count++}`;
      valuesArr.push(element.value);
    });
    query += ` RETURNING *;`;
    console.log(query);
    result = await Pool.query(query, valuesArr);

    if (result.rows && result.rows.length > 0) {
      return {
        status: true,
        message: 'Record Updated Successfully',
        data: { record: result.rows[0] },
      };
    } else {
      return {
        status: false,
        message: 'Failed to Update Record',
      };
    }
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};

exports.getPaginationString = async (req, res) => {
  let paginationString = ``;
  if (req.query) {
    if (req.query.sort && req.query.order) {
      paginationString += ` ORDER BY ${req.query.sort} ${req.query.order}`;
    } else {
      paginationString += ` ORDER BY id DESC`;
    }

    if (req.query.pagesize && req.query.page) {
      paginationString += ` LIMIT ${req.query.pagesize} OFFSET (${req.query.page} - 1) *  ${req.query.pagesize}`;
    }
  }
  return paginationString;
};

exports.getInfoById = async (tableName, id) => {
  try {
    const query = `SELECT * FROM ${tableName} WHERE id = '${id}'`;
    const result = await this.executeQuery(query);

    return result.status ? result.data.records[0] : null;
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};

exports.getCount = async (tableName, whereArr) => {
  try {
    let query = `SELECT COUNT(*) count FROM ${tableName} `;
    if (whereArr.length > 0) {
      query += ` WHERE `;
      whereArr.forEach((element, index) => {
        if (index !== 0) {
          query += ' AND ';
        }
        query += `${element.key} = '${element.value}'`;
      });
    }
    result = await this.executeQuery(query);
    if (result.status && result.data.records) {
      return result.data.records[0].count;
    }
    return 0;
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};

exports.getRecordInfo = async (tableName, whereArr, req, res) => {
  try {
    let query = `SELECT * FROM ${tableName} `;
    if (whereArr.length > 0) {
      query += ` WHERE `;
      whereArr.forEach((element, index) => {
        if (index !== 0) {
          query += ' AND ';
        }
        query += `${element.key} = '${element.value}'`;
      });
    }
    result = await this.executeQuery(query);
    if (result.status && result.data.records) {
      return result.data.records[0];
    }
    return false;
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};

exports.deleteData = async (tableName, whereArr, req, res) => {
  try {
    let query = `DELETE FROM ${tableName} `;
    if (whereArr.length > 0) {
      query += ` WHERE `;
      whereArr.forEach((element, index) => {
        if (index !== 0) {
          query += ' AND ';
        }
        query += `${element.key} = '${element.value}'`;
      });
    }
    result = await this.executeQuery(query);
    return result;
  } catch (e) {
    console.log(e);
    return { status: false, message: e };
  }
};
