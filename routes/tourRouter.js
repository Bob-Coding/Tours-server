const express = require("express");
const Tour = require("../models/tourModel");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/top-5")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
