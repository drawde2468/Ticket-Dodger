const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");
// Schema.Types.Decimal128

const parkingSchema = new Schema({
  time: Number,
  rate: Number,
  frequency: {
    type: String,
    enum: ["Once", "Daily", "Weekly"]
  },
  startDate: Date,
  endDate: Date,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Parking = mongoose.model("Parking", parkingSchema);
module.exports = Parking;