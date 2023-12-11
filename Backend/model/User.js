const mongoose = require("mongoose");
const User = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  eth_wallet: {
    type: String,
  },
  solana_wallet: {
    type: String,
  },
  tankCount: {
    type: Number,
    required: true,
  },
  earn: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("user", User);
