// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Will add the Currency type to the Mongoose Schema types
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var commentSchema = new Schema({
    rating : {
      type : Number,
      min : 1,
      max : 5,
      required : true
    },
    comment : {
      type : String,
      required : true
    },
    postedBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User'
    }
  }, {
    timestamps : true
  });

// create a schema
var plantSchema = new Schema({
    name : {
      type : String,
      required : true,
      unique : true
    },
    image : {
      type : String
    },
    category : {
      type : String,
      required : true
    },
    label : {
      type : String,
      default : ""
    },
    price : {
      type : Currency,
      required : true
    },
    description : {
      type : String,
      required : true
    },
    featured: {
      type: String,
      default:"false"
    },
    comments : [commentSchema]
  }, {
    timestamps : true
  });

// the schema is useless so far
// we need to create a model using it
var plants = mongoose.model('plant', plantSchema);

// make this available to our Node applications
module.exports = plants;
