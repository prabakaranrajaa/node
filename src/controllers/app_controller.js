const config = require('config');
const queryHelper = require("../helpers/queryHelper");
const Transactions = require("../models/transactions");
const Block = require("../models/block");
const Account = require("../models/account");
const Contracts = require("../models/contracts");
const smartContracts = require("../models/smart-contracts");
const priceHistory = require("../models/price-history");
const path = require('path');
const fs = require('fs');
const solc = require('solc');
const dbHelper = require('../helpers/dbHelper');
var getJSON = require('get-json')


const web3 = require('web3');
const LogsDecoder = require('logs-decoder'); // NodeJS
const { db } = require('../models/transactions');
const { query } = require('express');
const logsDecoder = LogsDecoder.create();
web3js = new web3(new web3.providers.HttpProvider('https://app-mainnet1.wyzthchain.org/')); //mainnet      

exports.getCurrentBlock = async (req, res) => {
    //response1 = await getJSON(config.blockChainURL+'getblock');
    //let blocks = await Block.find({}).sort({ blockNumber: -1 }).limit(1);
    let block = await dbHelper.executeQuery(`select * from block ORDER BY blocknumber LIMIT 1`)
    let blocks = {}
    blocks.msg = block.data.records[0];
    if (block.status) {
        let response1 = {
            "status": true,
            "blockNumber": blocks.msg.blockNumber
        }
        /*const count = await Account.countDocuments({});
        const contractsCount = await Contracts.countDocuments({});
        let contract = await queryHelper.findoneData(Contracts, { name: "Bitcoin" }, {});*/
        const count = await dbHelper.getCount('account', []);
        const contractsCount = await dbHelper.getCount('contracts', []);
        let contract = await dbHelper.getOneData([],'contracts', "name = 'Bitcoin'"); 
        response1.userCount = count;
        response1.contractsCount = contractsCount;
        response1.btc = contract;

        //response1.price ={status: true, message: {USDT_WYZTH: 22}};
        res.json(response1);
    }
}

exports.getDashboardData = async (req, res) => {
    let response1 = {}
    const count = await dbHelper.getCount('account', []);
    const contractsCount = await dbHelper.getCount('contracts', []);
    //const count = await Account.countDocuments({});
    //const contractsCount = await Contracts.countDocuments({});
    response1.userCount = count;
    response1.contractsCount = contractsCount;
    res.json(response1);

}

exports.getCurBlock = async (req, res) => {
    let response1 = '';
    await getJSON(config.blockChainURL + 'getblock').then(function (coinResponse) {
        response1 = coinResponse;
    }).catch(function (error) {
        response1.price = { status: true, message: { USDT_WYZTH: 22 } };
    });
    //const count = await Account.countDocuments({});
    //const contractsCount = await Contracts.countDocuments({});
    //let contract = await queryHelper.findoneData(Contracts, { name: "Bitcoin" }, {});
    const count = await dbHelper.getCount('account', []);
    const contractsCount = await dbHelper.getCount('contracts', []);
    let contract = await dbHelper.getOneData([],'contracts', "name = 'Bitcoin'"); 
    response1.userCount = count;
    response1.contractsCount = contractsCount;
    response1.btc = contract;

    //response1.price ={status: true, message: {USDT_WYZTH: 22}};
    res.json(response1);

}

exports.getWyzthPrice = async (req, res) => {
    let response1 = '';
    let price = await getJSON('https://childapi.wyzthswap.org/common/getPrice?pair=USDT_WYZTH')
    res.json(price);

}

exports.getBlocks = async (req, res) => {
    try {
        let skip = 0;

        if (req.body.page != 1) {
            skip = req.body.page * req.body.perPage;
        }
        let limit = req.body.perPage;
        let sortDir = req.body.sortDir
        let sortField = req.body.sortField
        //let countQuery = await dbHelper.getCount('block', []);
        //const counts = countQuery
        let countQuery = `select reltuples as count from row_counts where relname = 'block'`;
        const counts = await dbHelper.executeQuery(countQuery);
        let blockRes = { status: false, msg: [] };
        let count = 0

        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            let blocks = await dbHelper.executeQuery(`select * from block ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`)
            blockRes.msg = blocks.data.records;
            count = counts.data.records[0].count
        }
        res.status(200).json({ status: true, getBlockTblDetails: blockRes.msg, count: count, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
};

exports.getTransactionsTest = async (req, res) => {
    try {
        //let countQuery = `select count(*) from transactions`;
        let countQuery = `select reltuples as count from row_counts where relname = 'transactions'`;
        const counts = await dbHelper.executeQuery(countQuery);
        let txnRes = { status: false, msg: [] };
        let count = 0;
        let skip = 0;
        skip = 1 * 50;
        let limit = 50;
        let sortField = 'blocknumber'
        let sortDir = 'desc'

        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            let transactions = await dbHelper.executeQuery(`select * from transaction_details as a, transactions as b where a.txnid = b.id ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            txnRes.msg = transactions.data.records;
            count = counts.data.records[0].count;
        }
        res.json({ status: true, getTransactionTblDetails: txnRes.msg, count: count, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        console.log(e)
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTransactions = async (req, res) => {
    try {

        let skip = 0;
        if (req.body.page != 1) {
            skip = req.body.page * req.body.perPage;
        }

        let limit = req.body.perPage;
        let sortDir = req.body.sortDir
        let sortField = req.body.sortField

        let countQuery = `select reltuples as count from row_counts where relname = 'transactions'`;
        const counts = await dbHelper.executeQuery(countQuery);

        let txnRes = { status: false, msg: [] };
        let count = 0;

        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            let transactions = await dbHelper.executeQuery(`select * from transaction_details as a, transactions as b where a.txnid = b.id ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            txnRes.msg = transactions.data.records;
            count = counts.data.records[0].count;
        }
        res.json({ status: true, getTransactionTblDetails: txnRes.msg, count: count, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        console.log(e)
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTransactionsReports = async (req, res) => {
    try {
        let result = [];
        let resultDate = [];
        for (let i = 14; i > 0; i--) {
            let traRes = {};
            let dates = {};
            var date = new Date();
            var endDate = new Date();
            date.setDate(date.getDate() - i);
            endDate.setDate(endDate.getDate() - (i - 1));

            let day = ("0" + date.getDate()).slice(-2);
            let month = ("0" + (date.getMonth() + 1)).slice(-2);
            let year = date.getFullYear();

            let dayEnd = ("0" + endDate.getDate()).slice(-2);
            let monthEnd = ("0" + (endDate.getMonth() + 1)).slice(-2);
            let yearEnd = endDate.getFullYear();
            let counts = await dbHelper.executeQuery("select count(*) as count from transactions where DATE(transactiondate) = '"+year +'-' + month+'-' +day+"'");
            
            //console.log(year + '-' + month + '-' + day, yearEnd + '-' + monthEnd + '-' + dayEnd)
            /*let counts = await Transactions.aggregate([
                {
                    $match: {
                        dateTime: {
                            $gte: new Date(year + '-' + month + '-' + day),
                            $lt: new Date(yearEnd + '-' + monthEnd + '-' + dayEnd)
                        }
                    }
                },
                { $group: { _id: null, count: { $sum: 1 } } },
                { $sort: { _id: -1 } },
            ]);*/
            //let counts = await dbHelper.executeQuery("select count(*) as count from transactions where DATE(transactiondate) in ('2022-12-31', '2023-01-01', '2023-01-02', '2023-01-03') GROUP BY DATE(transactiondate);");
            if (counts.data && counts.data.records[0].count.length > 0) {
                result.push(parseInt(counts.data.records[0].count));
                resultDate.push(month + '/' + day);
            }
            if (i == 1) {
                res.json({ status: true, data: result, xAxs: resultDate });
            }
        }

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.txlist = async (req, res) => {
    try {

        if (!req.query.module || !req.query.module == 'account') {
            res.json({ status: false, message: 'Please Enter valid module.' });
        } else if (!req.query.address) {
            res.json({ status: false, message: 'Please Enter valid address.' });
        } else if (!req.query.startblock) {
            res.json({ status: false, message: 'Please Enter valid startblock.' });
        } else if (!req.query.endblock) {
            res.json({ status: false, message: 'Please Enter valid endblock.' });
        } else if (req.query.startblock > req.query.endblock) {
            res.json({ status: false, message: 'endblock must grater that startblock.' });
        } else if (!req.query.offset || req.query.offset > 201 || req.query.offset < 1) {
            res.json({ status: false, message: 'endblock must grater that offset' });
        }
        let sort = {};
        if (req.query.sort == 'asc') {
            sort['blockNumber'] = 1;
        } else {
            sort['blockNumber'] = -1;
        }

        let dateQur = {};
        if (req.query.transactionDate) {
            var today = new Date();
            var fromDay = new Date(req.query.transactionDate);
            dateQur = {
                'transactionDate': {
                    $gte: fromDay,
                    $lt: today
                }
            }
        }

        let contractQur = {};
        if (req.query.contract) {
            contractQur = {
                'contract': req.query.contract
            }
        } else {
            contractQur = {};
        }

        let skip = (req.query.page == 1 ? 0 : (req.query.page * req.query.offset));

        let limit = parseInt(req.query.offset);

        where = {
            $and: [
                {
                    $or: [
                        { 'owner_address': req.query.address },
                        { 'to_address': req.query.address },
                    ]
                },
                {
                    'blockNumber': {
                        $gte: parseInt(req.query.startblock),
                        $lt: parseInt(req.query.endblock)
                    }
                },
                contractQur,
                dateQur
            ]

        }

        let counts = await Transactions.aggregate([
            { $match: where },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]).collation({ locale: 'en', strength: 2 });
        let txnRes = { status: false, msg: [] };
        let count = 0;
        let result = [];
        let flag = 0;
        if (counts.length > 0 && counts[0].count) {
            txnRes = await queryHelper.findPaginationData(Transactions, where, {}, sort, limit, skip);
            let i = 0;
            if (txnRes.status) {
                await txnRes.msg.forEach(async (element, index) => {
                    let blocks = await queryHelper.findoneData(Block, { blockNumber: element.blockNumber }, {});
                    //let transactionInfo = await getJSON(config.blockChainURL+'txinfo/'+element.transactionId)
                    if (blocks.status) {
                        let traRes = {};
                        traRes.blockNumber = element.blockNumber;
                        traRes.timeStamp = element.transactionDate;
                        traRes.hash = element.transactionId;
                        traRes.nonce = blocks.msg.data.nonce;
                        traRes.blockHash = blocks.msg.data.hash;
                        traRes.transactionIndex = 1;
                        traRes.from = element.owner_address;
                        traRes.to = element.to_address;
                        if (element.transactionReceipt[0].logs.length > 0 && !element.amount) {
                            let tmpAmount = "0x" + element.transactionReceipt[0].logs[0].data.substring(26);
                            traRes.value = parseInt(tmpAmount, 16);
                        } else {
                            traRes.value = element.amount;
                        }
                        traRes.gas = element.transactionInfo[0].gas;
                        traRes.gasPrice = element.transactionInfo[0].gasPrice;
                        traRes.input = element.transactionInfo[0].input;
                        traRes.contractAddress = element.contract;
                        traRes.cumulativeGasUsed = element.transactionReceipt[0].cumulativeGasUsed;
                        traRes.gasUsed = element.transactionReceipt[0].gasUsed;
                        traRes.confirmations = '20';
                        traRes.method = element.method;
                        result.push(traRes)
                    }

                    if (blocks.status) {
                        i++;
                    }
                    if (i == txnRes.msg.length) {
                        res.json({ status: true, data: result });
                    }

                });
            } else {
                flag = 1;
            }
            count = counts[0].count;
        } else {
            flag = 1;
        }
        if (flag == 1) {
            res.json({ status: true, data: result });
        }

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTxReceiptStatus = async (req, res) => {
    try {
        if (!req.query.txhash) {
            res.json({ status: false, message: 'Invalid Address.' });
        } else {
            //const txn = `select * from transaction_details as a inner join transactions as b on a.txnid = b.id where transactionid = '${req.query.txhash}'`
            const txn = `select * from transactions where transactionid = '${req.query.txhash}'`
            const txnRes = await dbHelper.executeQuery(txn)
            let results = {};
            if (txnRes.status) {
                results = {
                    status: true,
                    message: "OK",
                    result: {
                        status: txnRes.data.records[0].status
                    }
                }
            } else {
                results = {
                    status: false,
                    message: "Invalid Address.",
                    result: {
                        status: false
                    }
                }
            }
            res.json(results);
        }

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}
exports.getTransactionList = async (element) => {
    //const blocks = await queryHelper.findoneData(Block, { blockNumber: element.blockNumber }, {});
    const blocks = await dbHelper.getOneData([],'block', "blocknumber = '"+element.blockNumber+"'"); 
    let transactionInfo = await getJSON(config.blockChainURL + 'txinfo/' + element.transactionId)
        .then(function (resp) {
            if (resp) {
                let traRes = {};
                traRes.blockNumber = element.blockNumber;
                traRes.timeStamp = transactionDate;
                traRes.hash = element.transactionId;
                traRes.nonce = blocks.data.nonce;
                traRes.blockHash = blocks.data.hash;
                traRes.transactionIndex = 1;
                traRes.from = element.owner_address;
                traRes.to = element.to_address;
                traRes.value = element.amount;
                traRes.gas = resp.Transaction_Details.gas;
                traRes.gasPrice = resp.Transaction_Details.gasPrice;
                traRes.input = resp.Transaction_Details.input;
                traRes.contractAddress = element.contract;
                traRes.cumulativeGasUsed = element.transactionReceipt[0].cumulativeGasUsed;
                traRes.gasUsed = element.transactionReceipt[0].gasUsed;
                traRes.confirmations = '20';
                return traRes;
            }
        }).catch(function (error) {
            return false;
        });
}

exports.getCustomerTransactions = async (req, res) => {
    try {
        let skip = 0;
        if (req.body.page != 1) {
            skip = req.body.page * req.body.perPage;
        }
        req.body.page = req.body.page + 1;

        let limit = req.body.perPage;
        let sort = {};
        if (req.body.sortField != '') {
            if (req.body.sortDir == 'asc') {
                sort[req.body.sortField] = 1;
            } else {
                sort[req.body.sortField] = -1;
            }
        }
        let where = '';
        if (req.body.match.transactionType) {
            if (req.body.match.transactionType == 'ERC-20 Token') {
                /*where = {
                    'transactionType': { $ne: 'Internal' },
                    $or: [
                        { 'owner_address': req.body.customerId },
                        { 'to_address': req.body.customerId },
                        { 'contract': req.body.customerId },
                    ]
                }*/
                where = " a.transactiontype != 'Internal' AND ( a.owner_address = '"+req.body.customerId+"' OR a.to_address = '"+req.body.customerId+"' OR a.contract = '"+req.body.customerId+"')";
            } else {
                /*where = {
                    transactionType: req.body.match.transactionType,
                    $or: [
                        { 'owner_address': req.body.customerId },
                        { 'to_address': req.body.customerId },
                        { 'contract': req.body.customerId },
                    ]
                }*/
                where = " a.transactiontype = '"+req.body.match.transactionType+"' AND ( a.owner_address = '"+req.body.customerId+"' OR a.to_address = '"+req.body.customerId+"' OR a.contract = '"+req.body.customerId+"')";
            }

        } else {
            /*where = {
                $or: [
                    { 'owner_address': req.body.customerId },
                    { 'to_address': req.body.customerId },
                    { 'contract': req.body.customerId },
                ]
            }*/
            where = " (a.owner_address = '"+req.body.customerId+"' OR a.to_address = '"+req.body.customerId+"' OR a.contract = '"+req.body.customerId+"')";
        }

        /*let counts = await Transactions.aggregate([
            { $match: where },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]).collation({ locale: 'en', strength: 2 });*/
        let countQuery = `select count(*) from transactions as a where ${where}`;
        const counts = await dbHelper.executeQuery(countQuery);
        let txnRes = { status: false, msg: [] };
        let count = 0;
        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            let transactions = await dbHelper.executeQuery(`select * from transaction_details as b, transactions as a where ${where} and b.txnid = a.id ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            txnRes.msg = transactions.data.records;
            count = counts.data.records[0].count;
        }
        
        /*if (counts.length > 0 && counts[0].count) {
            txnRes = await queryHelper.findPaginationData(Transactions, where, {}, sort, limit, skip);
            //txnRes = await queryHelper.findData(Transactions,{},{},sort,100);
            count = counts[0].count;
        }*/
        res.json({ status: true, getTransactionTblDetails: txnRes.msg, count: count, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}
exports.getAccountHolder = async (req, res) => {
    try {
        let skip = 0;
        if (req.body.page != 1) {
            skip = req.body.page * req.body.perPage;
        }
        req.body.page = req.body.page + 1;

        /*let limit = req.body.perPage;
        let sort = {};
        if (req.body.sortField != '') {
            if (req.body.sortDir == 'asc') {
                sort[req.body.sortField] = 1;
            } else {
                sort[req.body.sortField] = -1;
            }
        }*/

        let limit = req.body.perPage;
        let sortDir = req.body.sortDir
        let sortField = req.body.sortField
        let where = '';
        where = {
            'tokens': { $elemMatch: { address: req.params.hash } }
        }

        /*let counts = await Account.aggregate([
            { $match: where },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]).collation({ locale: 'en', strength: 2 });*/
        let counts = await dbHelper.getCount('user_tokens', {'token': req.params.hash});

        /*let txsCounts = await Transactions.aggregate([
            { $match: { 'contract': req.params.hash } },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]).collation({ locale: 'en', strength: 2 });*/
        let txsCounts = await dbHelper.getCount('transactions', {'contract': req.params.hash});
        let txnRes = { status: false, msg: [] };
        let count = 0;
        if (counts > 0) {
            //txnRes = await queryHelper.findPaginationData(Account, where, {}, sort, limit, skip);
            let transactions = await dbHelper.executeQuery(`select * from user_tokens where token = '${req.params.hash}' ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            if(transactions.data && transactions.data.records) {
                txnRes.msg = transactions.data.records;
            }            
            count = counts;
        }
        res.json({ status: true, data: txnRes.msg, count: count, txsCount: (counts.length > 0 ? txsCounts : 0) });

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getAccountTokenList = async (req, res) => {
    try {
        let txnRes = { status: true, msg: [] };
        //let result = await queryHelper.findoneData(Account, { address: req.params.hash }, {});
        let transactions = await dbHelper.executeQuery(`select * from user_tokens where address = '${req.params.hash}' ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            txnRes.msg = transactions.data.records;
        res.json(txnRes);

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTopAccount = async (req, res) => {
    try {
        let skip = 0;
        if (req.body.page != 1) {
            skip = req.body.page * req.body.perPage;
        }
        /*req.body.page = req.body.page + 1;

        let limit = req.body.perPage;
        let sort = {};
        if (req.body.sortField != '') {
            if (req.body.sortDir == 'asc') {
                sort[req.body.sortField] = 1;
            } else {
                sort[req.body.sortField] = -1;
            }
        }
        let where = {};

        let counts = await Account.aggregate([
            { $match: where },
            { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: { $multiply: ["$balance"] } } } },
            { $project: { _id: 0 } }
        ]).collation({ locale: 'en', strength: 2 });
        let txnRes = { status: false, msg: [] };
        let count = 0;
        totalBalance = 0;
        if (counts.length > 0 && counts[0].count) {
            txnRes = await queryHelper.findPaginationData(Account, where, {}, sort, limit, skip);
            //txnRes = await queryHelper.findData(Transactions,{},{},sort,100);
            count = counts[0].count;
            totalBalance = counts[0].totalAmount;
        }*/
        let limit = req.body.perPage;
        let sortDir = req.body.sortDir
        let sortField = req.body.sortField

        let countQuery = `select count(*) as count, sum(balance) as totalAmount from account`;
        const counts = await dbHelper.executeQuery(countQuery);
        console.log(counts)
        let txnRes = { status: false, msg: [] };
        let count = 0;
        let totalBalance = 0;
        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            let transactions = await dbHelper.executeQuery(`select * from account ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            txnRes.msg = transactions.data.records;
            count = counts.data.records[0].count;
            totalBalance = counts.data.records[0].totalAmount;
            res.json({ status: true, data: txnRes.msg, count: count, totalBalance: totalBalance });
        }
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}
exports.getTransactionByHash = async (req, res) => {
    try {
        let hashRes = { status: true, msg: [] };
        let hash = req.params.hash
        const getTxn = `select * from transaction_details as a, transactions as b where a.txnid = b.id and b.transactionid = '${hash}'`;
        txn = await dbHelper.executeQuery(getTxn);
        if (txn.data.records[0]) {
            hashRes.msg = txn.data.records[0];
        }
        res.json({ status: hashRes.status, getTransactionTblDetails: hashRes.msg, currentBlock: queryHelper.getBlockNumber(), data: { status: true, Transaction_Details: hashRes.msg.transactioninfo } });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTokenBalance = async (req, res) => {
    try {
        let response1 = await getJSON(config.blockChainURL + 'balanceOf/' + req.params.tokenAddress + '/' + req.params.address);
        //let contract = await queryHelper.findoneData(Contracts, { address: req.params.tokenAddress }, {});
        let contract = `select * from Contracts where address = '${req.params.tokenAddress}'`;
        txn = await dbHelper.executeQuery(getTxn);
        if (response1.status && contract.status && contract.data.records[0]) {
            response1.tokenDetails = contract.data.records[0];
            res.json(response1);
        }

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getCustomerTokens = async (req, res) => {
    try {
        const customerTokens = await queryHelper.findoneData(address, { transactionId: req.body.customerId }, {});
        if (customerTokens.status && customerTokens.msg.tokens) {
            let customerContract = [];
            customerTokens.msg.tokens.forEach(element => {
                getJSON(config.blockChainURL + 'tokenName/' + element.address)
                    .then(function (coinResponse) {

                    });
            })
        }
        res.json({ status: txnRes.status, getTransactionTblDetails: txnRes.msg, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getBlockTblById = async (req, res) => {
    try {
        let blockRes = { status: true, msg: [] };
        let id = parseInt(req.params.block);
        const getBlk = `select * from block where blocknumber = '${id}'`;
        block = await dbHelper.executeQuery(getBlk);
        if (block.data.records[0]) {
            blockRes.msg = block.data.records[0];
        }
        res.json({ status: blockRes.status, getBlockTblDetails: blockRes.msg, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTransactionByAddrHash = async (req, res) => {
    try {
        let skip = 0;
        let limit = 2;
        let sortDir = 'asc'
        let sortField = 'owner_address'
        let hash = req.params.hash
        const countQuery = `select count(*) from transaction_details as a inner join transactions as b on a.txnid = b.id where b.owner_address = '${hash}' or b.to_address = '${hash}'`
        const counts = await dbHelper.executeQuery(countQuery);
        let count = 0;
        let txnRes = { status: false, msg: [] };

        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            const transactions = await dbHelper.executeQuery(`select * from transaction_details as a inner join transactions as b on a.txnid = b.id where b.owner_address = '${hash}' or b.to_address = '${hash}' ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip} `);
            txnRes.msg = transactions.data.records;
            count = counts.data.records[0].count;
        }
        res.json({ status: true, getTransactionTblDetails: txnRes.msg, count: count, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        console.log(e)
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTransactionSummary = async (req, res) => {
    try {
        let response = await getJSON(config.blockChainURL + 'getCurrentBlock');
        if (response.status) {
            responseData = {
                status: true,
                getTransactionDetails: [
                    {
                        latestBlockNumber: response.getCurrentBlock.block_header.raw_data.number,
                        totalaccounts: '200',
                        currentMaxTPS: '47/748',
                        totalNodes: 5,
                        TotalWYZFrozen: '10,000',
                        contracts: '30',
                        tokens: '30',
                        blocksAddedYesterday: '7200',
                        marketCap: '12,168,591,981.187',
                        volume: '4,057,271,714.933',
                        cummulativeBlocks: response.getCurrentBlock.block_header.raw_data.number,
                        newBlockRevenue: '14,400',
                        cummulativeBlockRevenue: response.getCurrentBlock.block_header.raw_data.number * 2,
                    },
                ],
            }
            res.json(responseData);
        }

    } catch (e) {
        console.log('unable to get block data')
    }
}

exports.getContracts = async (req, res) => {
    try {
        let skip = 0;
        let limit = 200
        let sortDir = 'asc'
        let sortField = 'name'


        let countQuery = `select count(*) from contracts`;
        const counts = await dbHelper.executeQuery(countQuery);
        let contractRes = { status: false, msg: [] };
        let count = 0;

        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            let getContracts = await dbHelper.executeQuery(`select * from contracts ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            contractRes.msg = getContracts.data.records;
            count = counts.data.records[0].count;
        }
        res.json({ status: true, getContracts: contractRes.msg, count: count });    
        //res.json({ status: true, getContractDetails: contractRes.msg, count: count, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        console.log(e)
        res.status(400).json({ status: false, message: e.message });
    }
}
// 

exports.getContractsSummary = async (req, res) => {
    try {
        let skip = 0;
        let limit = 200
        let sortDir = 'asc'
        let sortField = 'name'

        let countQuery = `select count(*) from contracts`;
        const counts = await dbHelper.executeQuery(countQuery);
        let contractRes = { status: false, msg: [] };
        let count = 0;

        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            let getContracts = await dbHelper.executeQuery(`select * from contracts ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            contractRes.msg = getContracts.data.records;
            count = counts.data.records[0].count;
        }
        res.json({ status: true, getContractDetails: contractRes.msg, count: count, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        console.log(e)
        res.status(400).json({ status: false, message: e.message });
    }

}

exports.getBTCDetails = async (req, res) => {
    try {
        let price = await getJSON('https://childapi.wyzthswap.org/common/getPrice?pair=USDT_WYZTH');
        const txnRes = await queryHelper.findoneData(Contracts, { name: 'Bitcoin' }, {});
        if (price.status && txnRes.status) {
            res.json({ status: true, data: { 'BTC': txnRes.msg.details[0].tickers[0].converted_last.usd, 'WYZTH': price.message.USDT_WYZTH } });
        }


    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }

}

exports.getCoinDetails = async (req, res) => {
    try {
        // const txnRes = await queryHelper.findoneData(Contracts, { address: req.params.hash }, {});
        let coinRes = { status: true, msg: [] };
        let hash = req.params.hash
        const getCoin = `select * from contracts where address = '${hash}'`;
        coin = await dbHelper.executeQuery(getCoin);
        if (coin.data.records[0]) {
            coinRes.msg = coin.data.records[0];
        }

        res.json({ status: coinRes.status, getCoinDetails: coinRes.msg, currentBlock: queryHelper.getBlockNumber() });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getSearchDetails = async (req, res) => {
    try {
        /*const blockRes = await queryHelper.findoneData(Block, { blockNumber: +req.params.hash }, {});
        const txnRes = await queryHelper.findoneData(Transactions, { transactionId: req.params.hash }, {});
        const scRes = await queryHelper.findoneData(smartContracts, { address: req.params.hash }, {});
        const tokenRes = await queryHelper.findoneData(Contracts, { address: req.params.hash }, {});
        const customerRes = await queryHelper.findoneData(Transactions, {
            $or: [
                { 'owner_address': req.params.hash },
                { 'to_address': req.params.hash },
            ]
        },{});*/
        const blockRes = await dbHelper.getOneData([],'block', " blocknumber = '"+req.params.hash+"'");
        const txnRes = await dbHelper.getOneData([], 'transactions', " transactionid = '"+req.params.hash+"'");
        const scRes = await dbHelper.getOneData([], 'smartcontracts', " address = '"+req.params.hash +"'");
        const tokenRes = await dbHelper.getOneData([], 'contracts', " address = '"+req.params.hash+"'");
        const customerRes = await dbHelper.getOneData([], 'transactions', "owner_address = '"+req.params.hash+"' OR to_address = '"+req.params.hash+"'")
        res.json({ status: true, data: { block: blockRes, transaction: txnRes, customer: customerRes, smartContract: scRes, tokens: tokenRes } });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getAccountBalance = async (req, res) => {
    try {
        getJSON(config.blockChainURL + 'balance/' + req.params.hash)
            .then(function (coinResponse) {
                res.json({ status: true, balance: coinResponse.Balance });
            }).catch(function (error) {
                res.status(400).json({ status: false, message: error });
            });

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getSmartContracts = async (req, res) => {
    try {
        let hashRes = { status: true, msg: [] };
        let hash = req.params.hash
        const getTxn = `select * from smartcontracts where address = '${hash}'`;
        txn = await dbHelper.executeQuery(getTxn);
        if (txn.data.records[0]) {
            hashRes.msg = txn.data.records[0];
        }
        res.json({ status: result.status, data: hashRes.msg });
        //res.json({ status: hashRes.status, getTokenDetails: hashRes.msg, currentBlock: queryHelper.getBlockNumber(), data: { status: true, Transaction_Details: hashRes.msg.transactioninfo } });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getSmartContractsList = async (req, res) => {
    try {
        let skip = 0;
        if (req.body.page != 1) {
            skip = req.body.page * req.body.perPage;
        }

        let limit = req.body.perPage;
        let sortDir = req.body.sortDir
        let sortField = req.body.sortField
        if (sortField == "") {
            sortField = "name"
        }

        let countQuery = `select count(*) from smartcontracts`;
        const counts = await dbHelper.executeQuery(countQuery);

        let smartRes = { status: false, msg: [] };
        let count = 0;

        if (counts.status && counts.data.records.length > 0 && counts.data.records[0].count) {
            let smartcontracts = await dbHelper.executeQuery(`select * from smartcontracts ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
            smartRes.msg = smartcontracts.data.records;
            count = counts.data.records[0].count;
        }
        res.json({ status: true, data: smartRes.msg, count: count });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.contractCompiler = async (req, res) => {
    try {
        let checkAddress = await getJSON(config.blockChainURL + 'getcode/' + req.body.contractAddress);
        let checkLocalAddress = await queryHelper.findoneData(Transactions, { contract: req.body.contractAddress, transactionType: 'Contract creation' }, {});
        if (checkAddress.status && checkAddress.getcode && checkLocalAddress.status) {
            let checkSmartContracts = await queryHelper.findoneData(smartContracts, { address: req.body.contractAddress }, {});
            if (!checkSmartContracts.status) {
                let transactionInfo = await getJSON(config.blockChainURL + 'txinfo/' + checkLocalAddress.msg.transactionId);
                var solc_version = req.body.compilerVersion;
                const fileName = 'contract/' + new Date().getTime() + '-' + req.body.compilerVersion + '.sol';
                fs.writeFile(fileName, req.body.contractCode, { flag: 'a+' }, err => {
                    if (err) {
                        fs.unlink(fileName, (err) => {
                            if (err) throw err;

                        });
                    } else {
                        const inboxPath = path.resolve(fileName);
                        source = fs.readFileSync(inboxPath, 'utf8');
                        let input = {
                            language: "Solidity",
                            sources: {
                                [inboxPath]: {
                                    content: source,
                                },
                            },

                            settings: {
                                optimizer: {
                                    enabled: (req.body.optimization == 'true' ? true : false),
                                    runs: 200
                                },
                                outputSelection: {
                                    "*": {
                                        "*": ["*"],
                                    },
                                },
                                /*metadata: {
                                bytecodeHash: "ipfs"
                                },*/
                            },
                        };

                        solc.loadRemoteVersion(solc_version, function (err, solc_specific) {
                            if (!err) {
                                //var output = JSON.parse(solc_specific.compile(JSON.stringify({ sources: input }), is_optimized));

                                output = JSON.parse(solc_specific.compile(JSON.stringify(input)));

                                if (!output['errors']) {
                                    for (const element in output.contracts[inboxPath]) {
                                        console.log(output.contracts[inboxPath][element].evm.bytecode.object)
                                        if ('0x' + output.contracts[inboxPath][element].evm.bytecode.object.slice(0, -200) == transactionInfo.Transaction_Details.input.slice(0, -200)) {
                                            let insertValue = {
                                                name: element,
                                                compilerVersion: solc_version,
                                                address: req.body.contractAddress,
                                                abi: output.contracts[inboxPath][element].abi,
                                                sourceCode: req.body.contractCode,
                                                contractCreationCode: output.contracts[inboxPath][element].evm.bytecode.object,
                                                constructorArguments: '',
                                                deployedByteCode: output.contracts[inboxPath][element].evm.bytecode.sourceMap,
                                                swarmSource: 'bzzr://b4f5ab4fee9d9a2d930b51acc14d5fb67b02a502d8290b09ccf3180a1ad40b90',
                                            };
                                            queryHelper.insertData(smartContracts, insertValue);
                                            fs.unlink(fileName, (err) => {
                                                if (err) throw err;
                                                res.json({ status: true, message: 'Contract Address verified successful' });
                                            });
                                        }
                                    }
                                } else {
                                    res.status(400).json({ status: false, message: output['errors'][0]['message'] });
                                }


                                /*.forEach((element) => {
                                    console.log({ element });
                                    numCallbackRuns++;
                                });*/
                                //var bytecode = output['contracts'][contract_filename + ':' + contract_name]['runtimeBytecode'];
                                //var cc = JSON.parse(output);
                                //fs.writeFile('test.txt', output, { flag: 'a+' }, err => {})
                                //console.log(cc['contracts']);
                            } else {
                                fs.unlink(fileName, (errs) => {
                                    if (errs) throw errs;
                                    console.log('successfully deleted');
                                });
                                res.status(400).json({ status: false, message: err });
                            }
                        });
                    }

                })
            } else {
                fs.unlink(fileName, (errs) => {
                    if (errs) throw errs;
                    console.log('successfully deleted');
                });
                res.status(400).json({ status: false, message: 'Contract Address Already verified.' });
            }
        } else {
            res.status(400).json({ status: false, message: 'Invalid contract Address' });
        }
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTxnLogs = async (req, res) => {
    try {
        //let checkLocalAddress = await queryHelper.findoneData(Transactions, { transactionId: req.params.hash }, {});
        let transactions = await dbHelper.executeQuery(`select * from transaction_details as a, transactions as b where a.txnid = b.id ORDER BY ${sortField} ${sortDir} LIMIT ${limit} offset ${skip}`);
        let checkLocalAddress = transactions.data.records;
        if (checkLocalAddress) {
            //let contracts = await queryHelper.findoneData(smartContracts, { address: checkLocalAddress.contract }, {});
            let contracts = await dbHelper.getOneData([],'smartcontracts', " address = '"+checkLocalAddress.contract+"'");
            if (contracts) {
                logsDecoder.addABI(JSON.parse(contracts.abi));
                const decodedLogs = logsDecoder.decodeLogs(checkLocalAddress.transactionReceipt[0].logs);
                res.json({ status: true, data: decodedLogs });
            }
        }

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTokenBalances = async (req, res) => {
    try {
        let contracts = await dbHelper.getOneData([],'smartcontracts', " address = '"+req.params.tokenAddress+"'")
        //let contracts = await queryHelper.findoneData(smartContracts, { address: req.params.tokenAddress }, {});
        if (contracts) {
            MyContract = new web3js.eth.Contract(JSON.parse(contracts.abi), req.params.tokenAddress);
            MyContract.methods.balanceOf
                (req.params.address).call().then(resp => (
                    res.json({ status: true, "tokenBalance": resp })
                ));
        }

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTokenDetails = async (req, res) => {
    try {
        await getJSON('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=' + req.params.hash + '&CMC_PRO_API_KEY=03f10127-05b2-4b5a-be26-1eb3d9dd884a').
            then(function (coinResponse) {
                response1 = coinResponse;
                res.json({ status: true, data: response1 })
            }).catch(function (error) {
                response1.price = { status: false, message: { USDT_WYZTH: 22 } };
            });
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getWyzthMarketCap = async (req, res) => {
    try {
        var date_ob = new Date(); // Today!
        var today = new Date();
        date_ob.setDate(date_ob.getDate() - 1);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();

        let todayDate = today.getDate();
        let todayMonth = today.getMonth() + 1;
        let todayYear = today.getFullYear();
        let counts = await priceHistory.aggregate([
            {
                $match: {
                    "dateTime": {
                        $gte: new Date(year + "-" + month + "-" + date + " 00:00:00"),
                        $lt: new Date(todayYear + "-" + todayMonth + "-" + todayDate + " 00:00:00")
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avg: { $avg: "$price" }
                }
            },
            { $project: { _id: 0 } }
        ]);
        if (counts) {
            res.json({ status: true, balance: counts });
        }
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getULEPrice = async (req, res) => {
    try {
        let response1 = '';
        let wyzthPrice = await getJSON('https://childapi.wyzthswap.org/common/getPrice?pair=USDT_WYZTH');
        let ulePrice = await getJSON('https://childapi.wyzthswap.org/common/getPrice?pair=WYZTH_ULE');
        if (ulePrice.status && wyzthPrice.status) {
            let price = ulePrice.message.WYZTH_ULE * wyzthPrice.message.USDT_WYZTH;
            let contracts = await queryHelper.findoneData(Contracts, { address: '0xF5D1fEe5B8EA9A7F9007C05c4ebE74732a1BDa2F' }, {});
            if (contracts.status) {
                contracts.msg.details[0].tickers[0].converted_last.usd = price;
                contracts.msg.details[0].market_data.market_cap.usd = (price * 50000000000);
                queryHelper.updateData(Contracts, '', { _id: contracts.msg._id }, contracts.msg);
            }
            res.json({ status: true, value: price });
        }
    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getTxnMethod = async (req, res) => {
    try {
        let checkLocalAddress = await queryHelper.findoneData(Transactions, { transactionId: req.params.hash }, {});
        if (checkLocalAddress.status) {
            let contracts = await queryHelper.findoneData(smartContracts, { address: checkLocalAddress.msg.contract }, {});
            if (contracts.status) {
                logsDecoder.addABI(contracts.msg.abi);
                const testData = checkLocalAddress.msg.transactionInfo[0].input
                const decodedData = logsDecoder.decodeMethod(testData);
                if (decodedData && decodedData.name) {
                    dataObj.method = decodedData.name;
                }
            }
        }

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.getMissingBlock = async (req, res) => {
    try {
        let counts = await Block.aggregate([
            {
                $group: {
                    _id: null,
                    nos: { $push: "$blockNumber" }
                }
            },
            {
                $addFields: {
                    missing: { $setDifference: [{ $range: [1, 939825] }, "$nos"] }
                }
            }
        ]).collation({ locale: 'en', strength: 2 });
        if (counts && counts[0]) {
            res.json({ status: true, count: counts[0].missing.length, value: counts[0].missing });
        }

    } catch (e) {
        res.status(400).json({ status: false, message: e.message });
    }
}

exports.sampless = async (req, res) => {
    try{
        let sort = {};
        sort['_id'] = 1;
        let contracts = await queryHelper.findPaginationData(Contracts,{},{},sort,100);
        if(contracts.status) {
          await contracts.msg.forEach(async (element, index) => {
            console.log(element.details);
            let dataObj = {}
            dataObj.name = element.name;
            dataObj.address = element.address;
            dataObj.balance = element.balance;
            dataObj.trxcount = element.TRXCount;
            dataObj.creationtime = element.creationTime;
            dataObj.validationtime = element.validationTime;
            dataObj.apiid = element.apiId;
            dataObj.swapurl = element.swapUrl;
            dataObj.tradeurl = element.tradeUrl;
            dataObj.details = element.details[0];
            dataObj.decimal = element.decimal;
            await dbHelper.insertData(
              dataObj,
              'contracts'
            );
          });
          res.json({ status: true});
        }
      } catch(e){
          console.log('unable to get block data', e)
      }
}