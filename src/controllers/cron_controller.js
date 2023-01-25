var cron = require('node-cron');
var getJSON = require('get-json')
const config = require("config");
const Block = require("../models/block");
const Account = require("../models/account");
const Contracts = require("../models/contracts");
const Transactions = require("../models/transactions");
const blockManagement = require("../models/blockManagement");
const queryHelper = require("../helpers/queryHelper");
const perf = require('execution-time')();

const smartContracts = require("../models/smart-contracts");

const path = require('path');
const fs = require('fs');
const solc = require('solc');

//cron.schedule('*/'+config.blockDuration+' * * * * *', async () => {
    /*try{
        let response = await getJSON(config.blockChainURL+'getblock');
        if(response.status) {
            const blockNumber = response.blockNumber;
            blockWiseData(blockNumber);
            queryHelper.setBlockNumber(blockNumber);
        }
    } catch(e){
        console.log('unable to get block data', e)
    }
});*/


//updateSCS();
async function updateSCS(){

    const path = require("path");
    const fs = require("fs");
    const solc = require("solc");
    var solc_version = "v0.5.10+commit.5a6ea5b1"
    var contracts_directory = "./contracts"
    var contract_name = "IWYZ20"
    var contract_filename = "MyContract.sol"
    var is_optimized = 1

    //var input = {}
    const inboxPath = path.resolve(__dirname, 'USDT.sol');
    source = fs.readFileSync(inboxPath, 'utf8');
    let input = {
        language: "Solidity",
        sources: {
            [inboxPath]: {
            content: source,
            },
        },
    
        settings: {
            outputSelection: {
            "*": {
                "*": ["*"],
            },
            },
        },
        };

    //var files = fs.readdirSync(contracts_directory);

    

    solc.loadRemoteVersion(solc_version, function (err, solc_specific) {
        if (!err) {
            console.log('sdds')
            //var output = JSON.parse(solc_specific.compile(JSON.stringify({ sources: input }), is_optimized));
            output = solc_specific.compile(JSON.stringify(input))
            fs.writeFile('test.txt', JSON.stringify(output), { flag: 'a+' }, err => {})
            //var bytecode = output['contracts'][contract_filename + ':' + contract_name]['runtimeBytecode'];
            console.log(output);
        }
    });

    /*const inboxPath = path.resolve(__dirname, 'USDT.sol');
    const source = fs.readFileSync(inboxPath, "utf8");

    let input = {
    language: "Solidity",
    sources: {
        [inboxPath]: {
        content: source,
        },
    },

    settings: {
        outputSelection: {
        "*": {
            "*": ["*"],
        },
        },
    },
    };
    var solc_version = "v0.5.10+commit.5a6ea5b1"
    var output = ''
    solc.loadRemoteVersion(solc_version, function (err, solc_specific) {
        if(!err) {
            output = solc_specific.compile(JSON.stringify(source))
            fs.writeFile('test.txt', JSON.stringify(output), { flag: 'a+' }, err => {})
        }
    });

    //var output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    

    /*module.exports = {
    abi: output.contracts[[inboxPath]]["Inbox"].abi,
    bytecode: output.contracts[[inboxPath]]["Inbox"].evm.bytecode.object,
    };*/
}


//processData();
async function processData(){
    perf.start();
    for(let k = 230177; k < 230505; k++) {
        let BlockRes = await queryHelper.findoneData(Block, { blockNumber: k }, {});
        if(!BlockRes.status){
            console.log(k, BlockRes);
            blockWiseData(k)
        }
    }
}
blockWiseData(436208)
async function blockWiseData(blockNumber){
    
    try{
        let response1 = await getJSON(config.blockChainURL+'getblockbynum/'+blockNumber);
        if(response1.status) {
            let dataBlock = JSON.parse(JSON.stringify(response1.blockDetails));
            delete dataBlock.transactions;
            let blockData = {
                data : dataBlock,
                blockDate : new Date(dataBlock.timestamp*1000),
                blockNumber : blockNumber,
                txnCount : 0,
                producedBy: 'WYZTH',
                blockReward: '0'
            }
            if(response1.blockDetails.transactions.length > 0) {
                blockData.txnCount = response1.blockDetails.transactions.length;
                for(let inc = 0; inc < response1.blockDetails.transactions.length; inc++){
                    let TxnRes = await queryHelper.findoneData(Transactions, { transactionId: response1.blockDetails.transactions[inc] }, {});
                    let dataObj = {
                        transactionId : response1.blockDetails.transactions[inc]
                    }
                    if (!TxnRes.status) {
                        let transactionInfo = await getJSON(config.blockChainURL+'txinfo/'+dataObj.transactionId);
                        if(transactionInfo.status) {
                            dataObj.blockNumber = transactionInfo.Transaction_Details.blockNumber    
                            dataObj.method = 'Transfer';
                            dataObj.currency = 'WYZ';
                            dataObj.amount = (transactionInfo.Transaction_Details.value ? transactionInfo.Transaction_Details.value : '0' );
                            dataObj.owner_address = transactionInfo.Transaction_Details.from;
                            let transactionReceipt = await getJSON(config.blockChainURL+'txrecipt/'+dataObj.transactionId);
                            if(transactionInfo.status) {
                                dataObj.transactionReceipt = transactionReceipt.TransactionRecipt_Details;
                                let transactionTxType = await getJSON(config.blockChainURL+'txtype/'+dataObj.transactionId);
                                if(transactionReceipt.TransactionRecipt_Details.logs.length > 0) {
                                    dataObj.transactionType = 'ERC-20 Token';
                                    dataObj.contract = transactionReceipt.TransactionRecipt_Details.logs[0].address;
                                }  
                                if(transactionTxType.status == 'Contract_creation') {
                                    dataObj.transactionType = 'Contract creation';
                                    dataObj.contract = transactionReceipt.TransactionRecipt_Details.contractAddress;
                                }  

                                let fromAddress = await queryHelper.findoneData(Account, { address: transactionInfo.Transaction_Details.from }, {});
                                if(!fromAddress.status) {
                                    if(transactionReceipt.TransactionRecipt_Details.logs.length > 0) {
                                        await queryHelper.insertData(Account, {address: transactionInfo.Transaction_Details.from, tokens: [{'address': transactionReceipt.TransactionRecipt_Details.logs[0].address}]});
                                    } else {
                                        await queryHelper.insertData(Account, {address: transactionInfo.Transaction_Details.from});
                                    }                                    
                                } else if(transactionReceipt.TransactionRecipt_Details.logs.length > 0) {   
                                    if(!fromAddress.tokens) {
                                        fromAddress.tokens = [];
                                    }           
                                    let contractsAddress = fromAddress.msg.tokens.find( ({ address }) => address == transactionReceipt.TransactionRecipt_Details.logs[0].address );
                                    if(!contractsAddress) {
                                        fromAddress.msg.tokens.push({'address': transactionReceipt.TransactionRecipt_Details.logs[0].address});  
                                        await queryHelper.updateData(Account, 'many', {address: transactionInfo.Transaction_Details.from}, fromAddress.msg);                                         
                                    }      
                                }
                                let tmpToAddress = '';
                                if(transactionReceipt.TransactionRecipt_Details.logs.length > 0) { 
                                    tmpToAddress  = "0x" +transactionReceipt.TransactionRecipt_Details.logs[0].topics[2].substring(26);
                                } else {
                                    tmpToAddress  = transactionInfo.Transaction_Details.to;
                                }

                                dataObj.to_address = tmpToAddress;
                                let toAddress = await queryHelper.findoneData(Account, { address: tmpToAddress }, {});
                                if(!toAddress.status) {
                                    if(transactionReceipt.TransactionRecipt_Details.logs.length > 0) {
                                        await queryHelper.insertData(Account, {address: tmpToAddress, tokens: [{'address': transactionReceipt.TransactionRecipt_Details.logs[0].address}]});
                                    } else {
                                        await queryHelper.insertData(Account, {address: transactionInfo.Transaction_Details.to});
                                    }
                                } else if(transactionReceipt.TransactionRecipt_Details.logs.length > 0) {   
                                    if(!toAddress.tokens) {
                                        toAddress.tokens = [];
                                    }           
                                    let contractsAddress = toAddress.msg.tokens.find( ({ address }) => address == transactionReceipt.TransactionRecipt_Details.logs[0].address );
                                    if(!contractsAddress) {
                                        toAddress.msg.tokens.push({'address': transactionReceipt.TransactionRecipt_Details.logs[0].address});  
                                        await queryHelper.updateData(Account, 'many', {address: tmpToAddress}, toAddress.msg);                                         
                                    }      
                                }
                                updateWYZBalance(transactionInfo.Transaction_Details.from);
                                updateWYZBalance(tmpToAddress);
                                let checkTransactions = await queryHelper.findoneData(Transactions, { transactionId: dataObj.transactionId }, {});
                                if(!checkTransactions.status){
                                    await queryHelper.insertData(Transactions, dataObj);
                                }
                                
                            }
                           
                        } else {
                            return;
                        }
                    } else {
                        await queryHelper.updateData(Transactions, 'many', {transactionId: dataObj.transactionId}, dataObj);
                    }
                }
            }
            let BlockRes = await queryHelper.findoneData(Block, { blockNumber: blockNumber }, {});
            if(!BlockRes.status){
                console.log(blockNumber);
                await queryHelper.insertData(Block, blockData);
            }
        }
    } catch(e){
        console.log('unable to get transaction data',e)
    }
}   
async function updateWYZBalance(customerAddress){   
    let customerDetails = await queryHelper.findoneData(Account, { address: customerAddress }, {});
    if(customerDetails.status) {
        getJSON(config.blockChainURL+'balance/'+customerAddress)
        .then(function(res) {
            if(res) {
                customerDetails.msg.balance  = res.Balance;
                queryHelper.updateData(Account, 'many', {_id: customerDetails.msg._id}, customerDetails.msg);
            }
        }).catch(function(error) {
            console.log(error);
        });
    }    
}
//updateQus();
async function updateQus(){    
    try{
        let skip = 0;
        let limit = 10000;
        let sort = {};
        sort['dateTime'] = -1;
        txnRes = await queryHelper.findPaginationData(Transactions,{},{},sort,limit,skip);
        if(txnRes.status) {
            let check = txnRes.msg;
            check.forEach(element => {
                if(element.transactionReceipt[0].logs.length > 0) {
                    /*let transactionTxType = getJSON(config.blockChainURL+'txtype/'+element.transactionId)
                    .then(function(coinResponse) {
                        if(coinResponse.status == 'Contract_creation') {
                            console.log(element.blockNumber);
                            element.transactionType = 'Contract creation';
                            element.contract = element.transactionReceipt[0].logs[0].address;
                            //queryHelper.updateData(Transactions, 'many', {_id: element._id, blockNumber: element.blockNumber}, element); 
                        }
                    }).catch(function(error) {
                        console.log(error);
                    });*/

                    /*element.transactionType = 'ERC-20 Token';
                    element.contract = element.transactionReceipt[0].logs[0].address;
                    element.to_address = "0x" +element.transactionReceipt[0].logs[0].topics[2].substring(26);*/

                    
                    //queryHelper.updateData(Transactions, 'many', {_id: element._id, blockNumber: element.blockNumber}, element);  
                } else {
                    element.transactionType = 'Internal';
                    queryHelper.updateData(Transactions, 'many', {_id: element._id, blockNumber: element.blockNumber}, element); 
                }                
            });
        }
    } catch(e){
        console.log('unable to get block data', e)
    }
};

cron.schedule('*/60 * * * * *', async () => {
  try{
        let skip = 0;
        let limit = 200;
        let sort = {};
        sort['dateTime'] = -1;
        conRes = await  queryHelper.findPaginationData(Contracts,{},{},sort,limit,skip);
        if(conRes.status) {
            conRes.msg.forEach(function (item) {
                getJSON('https://api.coingecko.com/api/v3/coins/'+item.apiId)
                .then(function(coinResponse) {
                    if(coinResponse) {
                        item.details  = coinResponse;
                        queryHelper.updateData(Contracts, '', {_id: item._id}, item);
                    }
                }).catch(function(error) {
                console.log(error);
                });
            });
        }
    } catch(e){
        console.log('unable to get data from coingecko',e)
    }
});