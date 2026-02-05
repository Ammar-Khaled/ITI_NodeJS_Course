const donationRouter = require('express').Router();
const donationController = require('../../controllers/donation.controller');
const validate = require("../../middlewares/validate");
const schemas = require('../../schemas');

donationRouter.post("/", validate(schemas.donations.donateSchema), donationController.createDonation);
donationRouter.post("/webhook", donationController.webhook);

module.exports = donationRouter;