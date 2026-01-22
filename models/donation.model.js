const mongoose = require('mongoose');

const { Schema } = mongoose;

const DonationSchema = new Schema({
    sessionId: { type: String, required: true },
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    sessionURL: { type: String },
    webhookData: { type: Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);