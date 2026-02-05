const donationService = require('../services/donation.service');
const APIError = require('../utils/APIError');

const createDonation = async function (req, res) {
    const { amount } = req.body;

    const session = await donationService.createPaymentSession(amount);

    // if (session.status !== "CREATED") {
    //     throw new APIError("Failed to create a payment session", 503);
    // }


    const donation = await donationService.createDonation({
        sessionId: session._id,
        orderId: session.paymentParams.order,
        amount: session.paymentParams.amount,
        sessionURL: session.sessionUrl
    })

    res.status(200).json({
        message: "Donation Link created successfully",
        Data: {
            sessionURL: donation.sessionURL,
        }
    });
}

const webhook = async function (req, res) {
    const { data, event } = req.body;
    const kashierSignature = req.header('x-kashier-signature');
    const isValid = donationService.verifyWebhookSignature(data, kashierSignature);
    if (!isValid) {
        throw new APIError("invalid signature", 400);
    }

    await donationService.updateDonationStatus(req.body);

    res.status(200).json({
        message: "Webhook received successfully",
    });
}


module.exports = {
    createDonation,
    webhook
};