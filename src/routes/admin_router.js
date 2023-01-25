const express = require('express');
const router = new express.Router();
const appController = require('../controllers/app_controller');

router.get("/getCurrentBlock",appController.getCurrentBlock);
router.post("/getBlocks",appController.getBlocks);
router.post("/getTransactions",appController.getTransactions);
router.post("/getCustomerTransactions",appController.getCustomerTransactions);
router.get("/getTransactionByHash/:hash",appController.getTransactionByHash);
router.get("/getTransactionByAddrHash/:hash",appController.getTransactionByAddrHash);
router.get("/getBlockTblById/:block",appController.getBlockTblById);
router.get("/getTransactionSummary",appController.getTransactionSummary);
router.get("/getContracts",appController.getContracts);
router.get("/getCoinDetails/:hash",appController.getCoinDetails);
router.get("/getSearchDetails/:hash",appController.getSearchDetails);
router.get("/getAccountBalance/:hash",appController.getAccountBalance);


module.exports = router;
