const express = require('express');
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const Parking = require("../models/parking");
const Fine = require("../models/fine");
const ObjectId = require('mongodb').ObjectID;

router.get("/dashboard", ensureLogin.ensureLoggedIn(), (req, res) => {
  let parking;
  let tickets;

  Parking.find({
      user: ObjectId(`${req.user._id}`)
    }).exec()

    .then((parkingDb) => {
      parking = parkingDb;
      return Fine.find({
        user: ObjectId(`${req.user._id}`)
      }).exec()
    })

    .then((ticketDb) => {
      tickets = ticketDb;
    })

    .then(() => {
      res.render("main/dashboard", {
        user: req.user,
        parking: parking,
        tickets: tickets
      });
    })
});

router.get("/parking", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("main/parking", {
    user: req.user
  });
});

router.post("/parking", (req, res) => {
  const time = req.body.time;
  const rate = req.body.rate;
  const frequency = req.body.frequency;
  const user = req.user._id

  if (time === "" || rate === "") {
    res.render("main/parking", {
      message: "Paking Time and Rate cannot be empty."
    });
    return;
  }

  const newParking = new Parking({
    time: time,
    rate: rate,
    frequency: frequency,
    user: user
  });

  newParking.save((err) => {
    if (err) {
      res.render("main/parking", {
        message: "Error: Could not save parking event."
      });
    } else {
      res.redirect("/dashboard");
    }
  });
});

router.get("/fines", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("main/fines", {
    user: req.user
  });
});

router.post("/fines", (req, res) => {
  const cost = req.body.cost;
  const user = req.user._id

  if (cost === "") {
    res.render("main/fines", {
      message: "Fine cannot be empty."
    });
    return;
  }

  const newFine = new Fine({
    cost: cost,
    user: user
  });

  newFine.save((err) => {
    if (err) {
      res.render("main/fines", {
        message: "Error: Could not save parking event."
      });
    } else {
      res.redirect("/dashboard");
    }
  });
});



module.exports = router;