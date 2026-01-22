const Donation = require('../models/donation.model');
const axios = require('axios');
const crypto = require('crypto');
const queryString = require('query-string');
const _ = require('underscore');


const createPaymentSession = async (amount) => {
    const order = `DONATION-${Date.now()}`;
    const response = await axios.post(process.env.KASHIER_URL + '/v3/payment/sessions', {
        paymentType: "credit",
        amount: amount.toString(),
        currency: "EGP",
        order: order,
        display: "en",
        allowedMethods: "card,wallet",
        merchantRedirect: "https://example.com/redirect",  // TODO: replace with the frontend URL
        redirectMethod: null,
        failureRedirect: false,
        iframeBackgroundColor: "#FFFFFF",
        merchantId: process.env.KASHIER_MERCHANT_ID,
        brandColor: "#0059ff",
        defaultMethod: "card",
        description: `Payment for order ${order}`,
        manualCapture: false,
        saveCard: "none",
        interactionSource: "ECOMMERCE",
        enable3DS: true,
        serverWebhook: process.env.KASHIER_WEBHOOK_BASE_URL + "/donations/webhook",
        notes: "please support our blog"
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.KASHIER_SECRET_KEY,
            'api-key': process.env.KASHIER_API_KEY,
        }
    });
    return response?.data;
};

const createDonation = async (donationData) => {
    return await Donation.create(donationData);
};

const verifyWebhookSignature = (data, signatureHeader) => {
    data.signatureKeys.sort();
    const objectSignaturePayload = _.pick(data, data.signatureKeys);
    const signaturePayload = queryString.stringify(objectSignaturePayload);
    const signature = crypto
        .createHmac('sha256', process.env.KASHIER_API_KEY)
        .update(signaturePayload)
        .digest('hex');

    if (signatureHeader === signature) {
        return true;
    } else {
        return false;
    }
};

const updateDonationStatus = async (body) => {
    const { data, event } = body;
    const donation = await Donation.findOne({ orderId: data.merchantOrderId });
    if (!donation) {
        throw new APIError("donation not found", 404);
    };
    const updateQuery = {
        $set: {
            status: data.status === "SUCCESS" ? "PAID" : "FAILED",
            webhookData: body,
        }
    };
    await Donation.updateOne({ _id: donation._id }, updateQuery);
};

module.exports = {
    createPaymentSession,
    createDonation,
    verifyWebhookSignature,
    updateDonationStatus
};