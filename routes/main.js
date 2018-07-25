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
  let allTickets;

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
      return Fine.find({}, {
        location: 1,
        _id: 0
      }).exec()
    })

    .then((ticketLocation) => {
      allTickets = ticketLocation;
      let total = 0;

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

      sortLoc = (arrObj) => {
        let arr = [];
        for (i = 0; i < arrObj.length; i++) {
          arr.push(arrObj[i].location[0]);
          arr.push(arrObj[i].location[1]);
        }
        return arr;
      }

      res.render("main/dashboard", {
        user: req.user,
        parking: parking,
        tickets: tickets,
        locations: sortLoc(allTickets),
        sum: Math.round(total * 100) / 100,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
      });
    }).catch((err) => {
      console.log(err);
    });
});

router.get("/parking", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("main/parking", {
    user: req.user
  });
});

router.post("/parking", (req, res) => {
  const user = req.user._id

  const {
    time,
    rate,
    frequency,
    start,
    end
  } = req.body;

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

router.get("/add-ticket", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("main/add-ticket", {
    user: req.user
  });
});

router.post("/add-ticket", (req, res) => {
  const cost = req.body.cost;
  const loc = [req.body.lat, req.body.lon];
  const user = req.user._id;

  if (cost === "" || cost < 0) {
    res.render("main/add-ticket", {
      message: "Fine must be greater than $0."
    });
    return;
  }

  if (req.body.lat < -90 || req.body.lat > 90 || req.body.lon < -180 || req.body.lon > 180) {
    res.render("main/add-ticket", {
      message: "Invalid latitude or longitude. We're on Earth."
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
      res.render("main/add-ticket", {
        message: "Error: Could not save parking event."
      });
    } else {
      res.redirect("/dashboard");
    }
  });
});

router.get("/tickets", ensureLogin.ensureLoggedIn(), (req, res) => {

  Fine.find({
      user: ObjectId(`${req.user._id}`)
    }).exec()

    .then((userTicketsDB) => {
      res.render("main/tickets", {
        tickets: userTicketsDB
      })
    })
    .catch((err) => {
      console.log(err)
    });
});

router.get('/ticket/edit', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  Fine.findOne({
      _id: req.query.ticket_id
    })
    .then((ticket) => {
      res.render("main/edit-ticket", {
        ticket
      })
    })
    .catch((err) => {
      console.log(err)
    })
});

router.post('/ticket/edit', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const newCost = req.body.cost;
  console.log(newCost);
  Fine.update({_id: req.query.ticket_id}, {$set: {cost: newCost}}, {new: true})
    .then(() => {
      res.redirect('/tickets')
    })
    .catch((error) => {
      console.log(error)
    })
});


module.exports = router;