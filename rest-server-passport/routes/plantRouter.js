var express = require('express');
var bodyParser = require('body-parser');
//var boolParser = require('express-query-boolean');



var mongoose = require('mongoose');

var plants = require('../models/plants');

var Verify = require('./verify');

var plantRouter = express.Router();

plantRouter.use(bodyParser.json());
//plantRouter.use(boolParser());

plantRouter.route('/')
.get(function (req, res, next) {
  console.log("inside plants.get");
  plants.find(req.query)
  .populate('comments.postedBy')
  .exec(function (err, plant) {
    console.log("plants", plants);
    if (err) next(err);
    res.json(plant);
  });
})

.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
  plants.create(req.body, function (err, plant) {
    if (err) next(err);
    console.log('plant created!');
    var id = plant._id;
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end('Added the plant with id: ' + id);
  });
})

.delete (Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
  plants.remove({}, function (err, plant) {
    if (err) next(err);
    res.json(plant);
  });
});

plantRouter.route('/:plantId')
.get(function (req, res, next) {
  plants.findById(req.params.plantId)
  .populate('comments.postedBy')
  .exec(function (err, plant) {
    if (err) next(err);
    res.json(plant);
  });
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
  plants.findByIdAndUpdate(req.params.plantId, {
    $set: req.body
  }, {
    new: true
  }, function (err, plant) {
    if (err) next(err);
    res.json(plant);
  });
})

.delete (Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
  plants.findByIdAndRemove(req.params.plantId, function (err, plant) {
    if (err) next(err);
    res.json(plant);
  });
});

plantRouter.route('/:plantId/comments')
.get(function (req, res, next) {
  plants.findById(req.params.plantId)
  .populate('comments.postedBy')
  .exec(function (err, plant) {
    if (err) next(err);
    res.json(plant.comments);
  });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
  plants.findById(req.params.plantId, function (err, plant) {
    if (err) next(err);
    req.body.postedBy = req.decoded._id;
    plant.comments.push(req.body);
    plant.save(function (err, plant) {
      if (err) next(err);
      console.log('Updated Comments!');
      res.json(plant);
    });
  });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
  plants.findById(req.params.plantId, function (err, plant) {
    if (err) next(err);
    for (var i = (plant.comments.length - 1); i >= 0; i--) {
      plant.comments.id(plant.comments[i]._id).remove();
    }
    plant.save(function (err, result) {
      if (err) next(err);
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('Deleted all comments!');
    });
  });
});

plantRouter.route('/:plantId/comments/:commentId')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
  plants.findById(req.params.plantId)
  .populate('comments.postedBy')
  .exec(function (err, plant) {
    if (err) next(err);
    res.json(plant.comments.id(req.params.commentId));
  });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
  // We delete the existing commment and insert the updated
  // comment as a new comment
  plants.findById(req.params.plantId, function (err, plant) {
    if (err) next(err);
    plant.comments.id(req.params.commentId).remove();
    req.body.postedBy = req.decoded._id;
    plant.comments.push(req.body);
    plant.save(function (err, plant) {
      if (err) next(err);
      console.log('Updated Comments!');
      res.json(plant);
    });
  });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
  plants.findById(req.params.plantId, function (err, plant) {
    if (plant.comments.id(req.params.commentId).postedBy != req.decoded._id) {
      var err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      return next(err);
    }
    plant.comments.id(req.params.commentId).remove();
    plant.save(function (err, resp) {
      if (err) next(err);
      res.json(resp);
    });
  });
});

module.exports = plantRouter;