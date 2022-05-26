const { json } = require("express");
const express = require("express");
const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsyncErrors = require("./../utils/catchAsyncErrors");

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTourStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRatings: { $sum: "ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      // sort from low to high
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getAllTours = catchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate();
  // Tour.findOne({ _id: req.params.id })

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsyncErrors(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`No tour is found with specified ID`, 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMonthlyPlan = catchAsyncErrors(async (req, res, next) => {
  const year = req.params.year * 1;
  const monthlyPlan = await Tour.aggregate([
    {
      //take all results, and unwind the field startDates, returns record for each element(startdate) in the array
      $unwind: "$startDates",
    },
    {
      //all results that matches startdate year
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      //Groups input documents by the specified _id expression and for each distinct grouping, outputs a document.
      //The _id field of each output document contains the unique group by value.
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        // $push Returns an array of all values that result from applying an expression to each document in a group of documents that share the same group by key.
        tours: { $push: "$name" },
      },
    },
    {
      //add field to results
      $addFields: { month: "$_id" },
    },
    {
      //project set to 0 will not show this field
      $project: {
        _id: 0,
      },
    },
    {
      //sort from high to low
      $sort: { month: 1 },
    },
    {
      //no usecase to limit, just for example
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      monthlyPlan,
    },
  });
});
