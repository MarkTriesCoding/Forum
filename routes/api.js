/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGO_DB = process.env.DB;
module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(function(req,res){
      var board = req.params.board;
      var thread = {
        text:req.body.text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password:req.body.delete_password,
        replies:[]
      }
      MongoClient.connect(MONGO_DB,function(err,db){
        expect(err,'database error').to.not.exist;
        db.collection(board).insert(
          thread, 
          function(){
           res.redirect('/b/'+board+'/')
        })
        
      })
    })
  
    .get(function(req,res){
      var board = req.params.board;
      MongoClient.connect(MONGO_DB,function(err,db){
        expect(err,'database error').to.not.exist;
        db.collection(board).find(
          {},
          {
            reported:0,
            delete_password:0,
            "replies.reported":0,
            "replies.delete_password":0,
          })
        //order by date bumped, from most recent
        .sort({bumped_on:-1})
        //ten threads
        .limit(10)
        .toArray(function(err,data){
          //assemble 3 most recent replies
          data.forEach(function(data){
            data.replycount = data.replies.length;
            if(data.replycount>3){
              data.replies = data.replies.slice(-3);
            }
          })
          res.json(data);
        })
      })
  })
  
  .put(function(req,res){
    var board = req.params.board;
    MongoClient.connect(MONGO_DB,function(err,db){
      expect(err,'database error').to.not.exist;
      db.collection(board).findAndModify(
        {
        _id: new ObjectId(req.params.report_id),
        },
        [],
        {$set: {reported:true}},
        function(err,data){
          
        }
      );
      res.send("reported")
    })
  })
  
  .delete(function(req,res){
    var board = req.params.board;
    MongoClient.connect(MONGO_DB,function(err,db){
      expect(err,'database error').to.not.exist;
      db.collection(board).findAndModify({
        _id:new ObjectId(req.body.thread_id),
        delete_password:req.body.delete_password
       },
       [],
       {},
       {remove:true,new:false},
       function(err,data){
         if(data.value == null){ res.send("incorrect password") }      
         else{
           res.send("deleted");
         }
      }
      
      )
    })
  })
  ;
  
  
  
  
  app.route('/api/replies/:board')
  
    .post(function(req,res){
      var board = req.params.board;
      var reply = {
        _id : new ObjectId(),
        text: req.body.text,
        created_on: new Date(),
        reported:false,
        delete_password:req.body.delete_password
      }
    MongoClient.connect(MONGO_DB,function(err,db){
      expect(err,'database error').to.not.exist;
      db.collection(board).findAndModify(
        {
          _id:new ObjectId(req.body.thread_id)},
          [],
          {  
            $set:{bumped_on:new Date()},
            $push:{replies:reply}   
          },
          function(err,data){
            expect(err,'database findAndModify error').to.not.exist;
            if(data.value == null){
              res.send('thread id not found');
            }
            // else{
            //   res.redirect('/b/'+board+'/'+req.body.thread_id)
            // }
          })
    })
     res.redirect('/b/'+board+'/'+req.body.thread_id)
  })
  .get(function(req,res){
    var board = req.params.board;
    MongoClient.connect(MONGO_DB,function(err,db){
      expect(err,'database error').to.not.exist;
      db.collection(board).find(
        {
          _id: new ObjectId(req.query.thread_id)
        },
        {
          reported:0,
          delete_password:0,
          "replies.reported":0,
          "replies.delete_password":0
        }).toArray(
        function(err,data){
          res.json(data[0])
        })
    })
  })
  
  .put(function(req,res){
    var board = req.params.board;
    MongoClient.connect(MONGO_DB,function(err,db){
      db.collection(board).findAndModify(
        {
          _id:new ObjectId(req.body.thread_id),
          "replies_id":new ObjectId(req.body.reply_id)},
          [],
          {
              $set:{"replies.$.reported":true}                                  
          },
          function(err,data){
        
          })
    })
    res.send('reported')
  })
  
  .delete(function(req,res){
    var board = req.params.board;
    MongoClient.connect(MONGO_DB,function(err,db){
      db.collection(board).findAndModify(
        {  
          _id: new ObjectId(req.body.thread_id),
          replies:{ $elemMatch: { _id: new ObjectId(req.body.reply_id), delete_password:req.body.delete_password}}
        },
        [],
        {$set: {"replies.$.text":"[deleted]"}},
        function(err,data){
          if(data.value == null){
            console.log(data);
            res.send('incorrect password')
          }
          else{
            res.send('deleted');
          }
        }
      )
    })
  })
  
  ;

  
};
