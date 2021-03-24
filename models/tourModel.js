const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour must have name"],
      unique: true,
      trim: true,
      //maxlength&minlength only available for strings
      maxlength: [40, "Tour name must have less or equal then 40 characters"],
      minlength: [2, "Tour name must have more or equal then 2 characters"],
      //example for plug in validator from package validator, isAlpha checks if string only contains letters(we will comment out since it also doesn't accept spaces)
      // validate: [
      //   validator.isAlpha,
      //   "Tour name must only contain characters(A-Z, a-z)",
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "Tour must have duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have a max groupsize"],
    },
    difficulty: {
      type: String,
      required: [true, "Tour must have a difficulty"],
      //enum only available for strings
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      //min&max only available for numbers and dates
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      //custom validator
      validate: {
        //this keyword only points to current doc on NEW document creation
        validator: function (value) {
          return value < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  //Into the Mongoose.schema we can pass in not only the object with the schema definition itself but also an object for the schema options
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//Can't use 'this' keyword with arrowfunctions so use oldfashioned way of function
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE:
//Document pre-middleware: runs before and ONLY triggers with .save() and .create() also called the pre 'save' hook:
tourSchema.pre("save", function (next) {
  //add value of name into field slug before saving in db
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", function (next) {
//   console.log("will save document..");
//   next();
// });

//Document post-middleware:
// tourSchema.post("save", function (doc, next) {
//   console.log(doc)
//   next();
// });

//QUERY MIDDLEWARE:
//use regular expression '/^find/' instead of 'find' to include ALL commands that start with find:( findOne, findOneAndDelete, findOneAndRemove, findOneAndUpdate )
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  //add element(in this case an extra stage(match) for non secretTours) at the beginning of the array with unshift
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
