/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  var id_1;
  var id_2;
  var id_3;
  
  suite('API ROUTING FOR /api/threads/:board', function() {
 
    
    suite('POST', function() {
      test('post new thread',function(done){
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text:"Example text.",
          delete_password:"testpassword"})
        .end(function(err,res){
          assert.equal(res.status,200);
      });
    //         assert.property(res.body,'text','Message should contain text')
    //         assert.property(res.body,'delete_password',"Message should be posted with password")
    //         assert.equal(res.body.text,"Example text.")
    //         assert.equal(res.body.delete_password,"testpassword");
        
          chai.request(server)
            .post('/api/threads/test')
            .send({
              text:"Example text 2.",
              delete_password:"testpassword"})
            .end(function(err,res){
              assert.equal(res.status,200);
          
//            assert.property(res.body,'text','Message should contain text')
//           assert.property(res.body,'delete_password',"Message should be posted with password")
           // assert.equal(res.body.text,"Example text 2.")
           // assert.equal(res.body.delete_password,"testpassword2");
        done();
      })
      })
    });
    
    suite('GET', function() {
      test('get new thread',function(done){
        chai.request(server)
          .get('/api/threads/test')
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.isArray(res.body);
            assert.isBelow(res.body.length,11);
            assert.property(res.body[0],'_id');
            assert.property(res.body[1],'_id')
            assert.property(res.body[0],'created_on');
            assert.property(res.body[0],'bumped_on');
            assert.property(res.body[0],'text');
            assert.property(res.body[0],'replies');
            assert.isArray(res.body[0].replies);
            assert.notProperty(res.body[0],'reported')
            assert.notProperty(res.body[0],'delete_password');
            assert.isBelow(res.body[0].replies.length,4);
            id_1 = res.body[0]._id;
            id_2 = res.body[1]._id;
            done();              
        })
      })
    });
    
    suite('DELETE', function() {
      test('delete thread good password', function(done){
        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id:id_1, 
                 delete_password:'testpassword'})
          .end(function(err,res){
            assert.equal(res.status, 200 );
            assert.equal(res.text,'deleted');
            done();
        })  
      })
      
          test('delete thread bad password', function(done){
        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id:id_2, 
                 delete_password:'wrongpassword'})
          .end(function(err,res){
            assert.equal(res.status, 200 );
            assert.equal(res.text,'incorrect password');
            done();
        })  
      })
    });
    
    suite('PUT', function() {
      test('modify thread status',function(done){
        chai.request(server)
          .put('/api/threads/test')
          .send({reported_id:id_2})
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'reported');
            done();
        
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('post text to board',function(done){
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id:id_2,
            text:'sample text',
            delete_password:'testpassword'})
          .end(function(err,res){
            assert.equal(res.status,200);
          
            //
          //assert.property(res.body[0],'_id')
            done();  
          })
        })
    });
    
    suite('GET', function() {
      test('get text to board',function(done){
        chai.request(server)
          .get('/api/replies/test')
          .query({thread_id:id_2})
          .end(function(err,res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body,'_id')  
            assert.property(res.body,'text')
            assert.property(res.body,'replies')
            assert.property(res.body,'bumped_on')
            assert.property(res.body,'created_on')
            assert.isArray(res.body.replies);
            assert.notProperty(res.body.replies[0],'reported');
            assert.notProperty(res.body.replies[0],'delete_password');
            assert.equal(res.body.replies[res.body.replies.length -1].text,'sample text');
            done();

          }) 
        })
    });
    
    suite('PUT', function() {
        test('put report reply',function(done){
        chai.request(server)
          .put('/api/replies/test')
          .send({
            thread_id:id_2,
            reply_id:id_2
          })
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'reported');
            done();
          })
        })
    });
    
    suite('DELETE', function() {
      test('delete reply, wrong password',function(done){
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id:id_2,
            reply_id:id_3,
            delete_password:'wrongpassword'     
        })
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'incorrect password');
            done();
        })
      })
      test('delete reply, right password',function(done){
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id:id_2,
            reply_id:id_3,
            delete_password:'testpassword'     
        })
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'deleted');
            done();
        })
      })  
      
      })
    });
  });
});