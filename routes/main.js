require('dotenv').config();

const express = require('express');
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const Parking = require("../models/parking");
const Fine = require("../models/fine");
const ObjectId = require('mongodb').ObjectID;
const moment = require("moment");

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
      let total = 0;
      // const calcDays = (milli) => { return Math.floor(milli / 1000 / 60 /60 /24); };


      for (i = 0; i < parking.length; i++) {
        if (parking[i].frequency === "Once") {
          total += parking[i].time * parking[i].rate;
        } else if (parking[i].frequency === "Daily") {
          if (moment() < moment(parking[i].endDate)) {
            let a = moment();
            let b = moment(parking[i].startDate);
            daysBetween = a.diff(b, 'days');
            total += (parking[i].time * parking[i].rate) * daysBetween;
          } else {
            let a = moment(parking[i].startDate);
            let b = moment(parking[i].endDate);
            daysBetween = b.diff(a, 'days');
            total += (parking[i].time * parking[i].rate) * daysBetween;
          }
        } else {
          if (moment() < moment(parking[i].endDate)) {
            let a = moment();
            let b = moment(parking[i].startDate);
            daysBetween = a.diff(b, 'days');
            total += ((parking[i].time * parking[i].rate) * 1 / 7) * daysBetween;
          } else {
            let a = moment(parking[i].startDate);
            let b = moment(parking[i].endDate);
            daysBetween = b.diff(a, 'days');
            total += ((parking[i].time * parking[i].rate) * 1 / 7) * daysBetween;
          }
        }
      }

      res.render("main/dashboard", {
        user: req.user,
        parking: parking,
        tickets: tickets,
        sum: Math.round(total * 100) / 100,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
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
  const start = req.body.start;
  const end = req.body.end;
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
    startDate: start,
    endDate: end,
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
  const loc = [req.body.lat, req.body.lon];
  const user = req.user._id;

  if (cost === "") {
    res.render("main/fines", {
      message: "Fine cannot be empty."
    });
    return;
  }

  const newFine = new Fine({
    cost: cost,
    location: loc,
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