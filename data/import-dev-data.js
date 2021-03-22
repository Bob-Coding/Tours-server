const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("./../models/tourModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log("DB connection successful!");
  });

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync("./data/tours-simple.json", "utf-8"));

//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Data successfully imported!");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data successfully deleted!");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// FUNCTION FOR ADDING ARGS --IMPORT AND --DELETE TO MANAGE SAMPLE DATA
if (process.argv[2] === "--import") importData();
if (process.argv[2] === "--delete") deleteData();
