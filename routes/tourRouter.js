const express = require("express");
const Tour = require("../models/tourModel");
const tourController = require("./../controllers/tourController");

const router = express.Router();

// router.param("id", tourController.checkId);

router
  .route("/top-5")
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
