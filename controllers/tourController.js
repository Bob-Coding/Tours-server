const express = require("express");
const fs = require("fs");

const toursObj = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/tours-simple.json`)
);

exports.checkId = (req, res, next, val) => {
  console.log(`Tour ID is: ${val}`);
  if (req.params.id * 1 > toursObj.length) {
    return res.status(404).send({
      status: "failure",
      message: "Invalid ID",
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "failure",
      message: "missing name or price",
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    results: toursObj.length,
    data: {
      tours: toursObj,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = toursObj.find((el) => el.id === id);
  res.status(200).json({
    status: "success",
    data: {
      id,
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = toursObj[toursObj.length - 1].id + 1;
  const newTour = { ...req.body, id: newId };
  toursObj.push(newTour);
  fs.writeFile(
    `${__dirname}/../data/tours-simple.json`,
    JSON.stringify(toursObj),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "updated tour",
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};
