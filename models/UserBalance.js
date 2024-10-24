const mongoose = require('mongoose');

const UserBalanceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0.0, require: true },
});

const UserBalance = mongoose.model('UserBalance', UserBalanceSchema);

module.exports = UserBalance;