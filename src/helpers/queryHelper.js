exports.findoneData = async (collection, where, gets) => {
  try {
    const findone = await collection.findOne({ $query: where, $orderby: { _id: -1 } }, gets).collation( { locale: 'en', strength: 2 } );
    if (!findone) {
      return { status: false, msg: 'record not found!' };
    }
    return { status: true, msg: findone };
  } catch (e) {
    return { status: false, msg: e.message };
  }
};

exports.findData = async (collection, where, gets, sorts, limits) => {
  try {
    const sorlen = Object.keys(sorts).length;
    if (sorlen != 0 && limits != 0) {
      const resData = await collection.find(where, gets).sort(sorts).limit(limits);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else if (sorlen != 0) {
      const resData = await collection.find(where, gets).sort(sorts);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else if (limits != 0) {
      const resData = await collection.find(where, gets).limit(limits);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else {
      const resData = await collection.find(where, gets);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    }
  } catch (e) {
    return { status: false, msg: e.message };
  }
};
exports.findPaginationData = async (collection, where, gets, sorts, limits, skip) => {
  try {
    const sorlen = Object.keys(sorts).length;
    if (sorlen != 0 && limits != 0) {
      const resData = await collection.find(where, gets).sort(sorts).skip(skip).limit(limits);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else if (sorlen != 0) {
      const resData = await collection.find(where, gets).sort(sorts).skip(skip);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else if (limits != 0) {
      const resData = await collection.find(where, gets).skip(skip).limit(limits);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else {
      const resData = await collection.find(where, gets).skip(skip);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    }
  } catch (e) {
    return { status: false, msg: e.message };
  }
};
exports.findPaginationDataSample = async (collection, where, gets, sorts, limits, skip) => {
  try {
    const sorlen = Object.keys(sorts).length;
    if (sorlen != 0 && limits != 0) {
      const resData = await collection.find(where, gets).collation( { locale: 'en', strength: 2 } ).sort(sorts).skip(skip).limit(limits);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else if (sorlen != 0) {
      const resData = await collection.find(where, gets).collation( { locale: 'en', strength: 2 } ).sort(sorts).skip(skip);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else if (limits != 0) {
      const resData = await collection.find(where, gets).collation( { locale: 'en', strength: 2 } ).skip(skip).limit(limits);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    } else {
      const resData = await collection.find(where, gets).collation( { locale: 'en', strength: 2 } ).skip(skip);
      if (!resData) {
        return { status: false, msg: 'record not found!' };
      }
      return { status: true, msg: resData };
    }
  } catch (e) {
    return { status: false, msg: e.message };
  }
};
exports.insertData = async (collection, values) => {
  try {
    const inslen = Object.keys(values).length;
    if (inslen != 0) {
      const insData = await collection.create(values);
      if (!insData) {
        return { status: false, msg: 'not inserted' };
      }
      return { status: true, msg: insData };
    } else {
      return { status: false, msg: 'not inserted' };
    }
  } catch (e) {
    return { status: false, msg: e.message };
  }
};
exports.updateData = async (collection, updatetype, where, values) => {
  try {
    if (updatetype === "many") {
      const updatedata = await collection.updateMany(where, { $set: values });
      if (!updatedata) {
        return { status: false, msg: 'not updated' };
      }
      return { status: true, msg: updatedata };
    } else if (updatetype === "element") {
      const updatedata = await collection.updateMany(where, values);
      if (!updatedata) {
        return { status: false, msg: 'not updated' };
      }
      return { status: true, msg: updatedata };
    } else {
      const updatedata = await collection.updateOne(where, { $set: values });
      if (!updatedata) {
        return { status: false, msg: 'not updated' };
      }
      return { status: true, msg: updatedata };
    }
  } catch (e) {
    return { status: false, msg: e.message };
  }
};
exports.DeleteOne = async (collection, where) => {
  try {
    const delData = await collection.deleteOne(where);
    if (!delData) {
      return { status: false, msg: 'not deleted' };
    }
    return { status: true, msg: delData };
  } catch (e) {
    return { status: false, msg: e.message };
  }
};
exports.DeleteMany = async (collection, where) => {
  try {
    const delData = await collection.deleteMany(where);
    if (!delData) {
      return { status: false, msg: 'not deleted' };
    }
    return { status: true, msg: delData };
  } catch (e) {
    return { status: false, msg: e.message };
  }
};
let blockNumber = 0
exports.setBlockNumber = function (block) {
  blockNumber = block;
}
exports.getBlockNumber = function () {
  return blockNumber;
}