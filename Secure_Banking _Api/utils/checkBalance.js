const Account = require('../models/Account');
const mongoose = require('mongoose');

const checkBalance = async (accountId, amount) => {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new Error('Invalid account ID');
  }
  const account = await Account.findById(accountId).select('balance');
  if (!account) {
    throw new Error('Account not found');
  }
  if (account.balance < amount) {
    throw new Error('Insufficient funds');
  }
};

module.exports = checkBalance;
