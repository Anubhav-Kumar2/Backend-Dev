const Transaction = require('../models/Transaction');
const User = require('../models/User');
const logger = require('../config/logger');

exports.transferMoney = async (req, res, next) => {
  try {
    const { amount, recipientId, description } = req.body;

    if (!amount || amount <= 0 || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Invalid transfer amount' });
    }

    if (amount > 1000 && !req.session2faVerified) {
      return res.status(403).json({ 
        success: false, 
        error: 'Transfers over $1000 require 2FA authentication',
        challenge: '2FA_REQUIRED'
      });
    }

    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }

    if (sender.balance < amount) {
      logger.warn(`Insufficient funds attempt by user ${sender._id}`);
      return res.status(400).json({ success: false, error: 'Insufficient funds' });
    }

    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save();
    await recipient.save();

    const transaction = await Transaction.create({
      user: sender._id,
      recipient: recipient._id,
      type: 'transfer',
      amount,
      description,
      status: 'completed',
      ipAddress: req.ip,
      userAgent: req.useragent.source
    });

    logger.info(`Transfer of $${amount} from ${sender._id} to ${recipient._id} completed`);

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    logger.error(`Transaction Error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Transaction failed' });
  }
};
