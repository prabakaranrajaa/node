const config = require('config');
const Transactions = require("../models/transactions");
const queryHelper = require("./queryHelper");
const Block = require("../models/block");
const Account = require("../models/account");
const Contracts = require("../models/contracts");
const smartContracts = require("../models/smart-contracts");
const dbHelper = require('../helpers/dbHelper');
var cron = require('node-cron');

exports.getBlockData = async (socket) => {  
  const query = `select * from block ORDER BY blocknumber DESC LIMIT 10`;
  const queryResult = await dbHelper.executeQuery(query);
  
  let sort = {};
  sort['blockNumber'] = -1;
  //blockRes = await queryHelper.findPaginationData(Block,{},{},sort,10,0);
  //blockRes = await Block.aggregate().sort({ _id: -1 }).skip(0).limit(10);
  if(queryResult.status && queryResult.data.records.length > 0) {   
    socket.emit('getBlocks', {status: true, msg: queryResult.data.records});
  }
  
  
};

exports.getTransactionData = async (socket) => {  
  /*let sort = {};
  sort['blockNumber'] = -1;
  //transactionsRes = await queryHelper.findPaginationData(Transactions,{},{},sort,1,0);
  transactionsRes = await Transactions.aggregate().sort({ _id: -1 }).skip(0).limit(10); 
  if(transactionsRes) {
    socket.emit('getTransactions', {status: true, msg: transactionsRes});
  }*/
  const query = `select * from transaction_details as a, transactions as b where a.txnid = b.id ORDER BY b.blocknumber DESC LIMIT 10`;
  const queryResult = await dbHelper.executeQuery(query);
  if(queryResult.status && queryResult.data.records.length > 0) {   
    socket.emit('getTransactions', {status: true, msg: queryResult.data.records});
  }
};


//cron.schedule('*/5 * * * * *', async () => {
/*  try{
    let sort = {};
    sort['_id'] = 1;
    let contracts = await queryHelper.findPaginationData(smartContracts,{},{},sort,1000);
    if(contracts.status) {
      await contracts.msg.forEach(async (element, index) => {
        let dataObj = {}
        dataObj.name = element.name;
        dataObj.compilerversion = element.compilerVersion;
        dataObj.address = element.address;
        dataObj.abi = element.abi;
        dataObj.sourceCode = element.sourcecode;
        dataObj.contractcreationcode = element.contractCreationCode;
        dataObj.constructorarguments = element.constructorArguments;
        dataObj.deployedbytecode = element.deployedByteCode;
        dataObj.swarmsource = element.swarmSource;
        dataObj.totalsupply = element.totalSupply;
        await dbHelper.insertData(
          dataObj,
          'smartContracts'
      );
      });
    }
  } catch(e){
      console.log('unable to get block data', e)
  }
});*/