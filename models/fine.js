const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const fineSchema = new Schema({
  cost: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
}
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Fine = mongoose.model("Fine", fineSchema);
module.exports = Fine;