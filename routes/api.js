/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

// *********
//  MODELS
// *********
// Using mongoose instead of mongoDB
const mongoose = require("mongoose");
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useCreateIndex: true, }, function(err, db) {
  if(err){
    console.log(err)
  } else {
    console.log("connected to database");
  }
});

// Issue
var issueSchema = new mongoose.Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: String,
  status_text: String,
  created_on: Date,
  updated_on: Date,
  open: {
    type: Boolean,
    default: true
  }
});
var Issue = new mongoose.model("Issue", issueSchema);

// Project
var projectSchema = new mongoose.Schema({
  project_title: {
    type: String
  },
  issues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue"
    }
  ]
});
var Project = mongoose.model("Project", projectSchema);




// Seed test project
// Project.create({
//   project_title: "test"
// }, function(err, project){
//   if(err){
//     console.log(err);
//   } else {
//     console.log(project);
//   }
// });

// ==========
//   ROUTES
// ==========
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      
      var issue_title = req.query.issue_title;
      var issue_text = req.query.issue_text;
      var created_by = req.query.created_by;
      var assigned_to = req.query.assigned_to;
      var status_text = req.query.status_text;
      var open = req.query.open;
      // Build match object
      var toMatch = {}
      if(issue_title!==undefined){
        toMatch.issue_title = issue_title;
      }
      if(issue_text!==undefined){
        toMatch.issue_text = issue_text;
      }
      if(created_by!==undefined){
        toMatch.created_by = created_by;
      }
      if(assigned_to!==undefined){
        toMatch.assigned_to = assigned_to;
      }
      if(status_text!==undefined){
        toMatch.status_text = status_text;
      }
      if(open!==undefined){
        toMatch.open = open;
      }
      
      Project.find({
        project_title: project
      }).populate({
        path: "issues",
        match: toMatch
      }).exec(function(err, project){
        if(err){
          console.log(err);
        } else {
          res.json(project[0]["issues"]);
        }
      });
      
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var issue_title = req.body.issue_title;
      var issue_text = req.body.issue_text;
      var created_by = req.body.created_by;
      var assigned_to = req.body.assigned_to;
      var status_text = req.body.status_text;
      var created_on = new Date();
      var updated_on = new Date();
      var newIssue = {issue_title: issue_title, 
                      issue_text: issue_text, 
                      created_by: created_by, 
                      assigned_to: assigned_to, 
                      status_text: status_text, 
                      created_on: created_on, 
                      updated_on: updated_on
                     };
    
      // Check that required fields are filled in
      if(issue_title==="" || issue_text==="" || created_by===""){
        return res.send("missing required fields");
      }
      // Find project( works with findOne(), but not find() )
      Project.findOne({
        project_title: project
      }, function(err, project){
        if(err){
          console.log("An error occured", err);
        } else {
          Issue.create(newIssue, function(err, addedIssue){
            if(err){
              console.log(err);
            } else {
              project.issues.push(addedIssue);
              project.save();
              console.log(addedIssue);
              res.json(addedIssue);
            }
          });
        }
      });
    })
    
    .put(function (req, res){
      var project = req.params.project;
      // My code
      var issue_title = req.body.issue_title;
      var issue_text = req.body.issue_text;
      var created_by = req.body.created_by;
      var assigned_to = req.body.assigned_to;
      var status_text = req.body.status_text;
      var updated_on = new Date();
      
      // Check for fields filled in
      console.log("issue_title", issue_title)
      if(issue_title===undefined && issue_text===undefined && created_by===undefined && assigned_to===undefined && status_text===undefined){
        console.log("no updated field sent");
        console.log("IF statement hit") //debug
        return res.send("no updated field sent");
      }
    
      var newIssue = {issue_title: issue_title, 
                      issue_text: issue_text, 
                      created_by: created_by, 
                      assigned_to: assigned_to, 
                      status_text: status_text, 
                      updated_on: updated_on
                     };
      
      Project.findOne({
        project_title: project
      }, function(err, foundProject){
        if(err){
          console.log(err);
        } else {
          // Find by id and update
          // Needs a form where the values are the old data so that everything no explicitly changed stays the same
          Issue.findByIdAndUpdate(req.body._id, newIssue, function(err, foundIssue){
            if(err){
              console.log("Could not update " + req.body._id);
              res.send("could not update " + req.body._id);
              console.log(err);
            } else {
              console.log("Successfully updated!");  
              // res.json(foundIssue);
              res.send("successfully updated");
            }
          });
        }
      });
    
    
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      // Check if an id was entered
      console.log("req.body._id", req.body._id);
      if(req.body._id===""){
        return res.send("_id error");
      }
      Project.findOne({
        project_title: project
      }, function(err, foundProject){
        if(err){
          console.log("Database Error: ", err);
        } else {
          Issue.findByIdAndRemove(req.body._id, function(err){
            if(err){
              console.log(err);
              res.send("cound not delete " + req.body._id);
            } else {
              console.log("Issue Deleted");
              res.send("deleted " + req.body._id);
            }
          });
        }
      });
    });
    
};
