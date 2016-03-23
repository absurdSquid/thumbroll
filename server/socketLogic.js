var models = require("./models");

module.exports = function(io) {
  
  var poll = {
    responseId: 1,
    type: 'thumbs',
    datetime: new Date(),
    lessonId: 13,
  };

  io.on('connection', function(client){
    var room;
    //TEACHER CODE
    client.on('teacherConnect', function(data) {
      room = 'room' + data.classId;
      client.join(room);
      console.log('Teacher connected to', room);
    });

    //maybe not necessary since basically the same as above
    client.on('teacherQuickClassConnect', function(data) {
      room = 'room' + data.classId;
      client.join(room);
      console.log('Teacher connected to quick class', room);
    });

    client.on('teacherClosePoll', function(data) {
      var pollId = data.pollId;
      // var classId = data.classId;
      console.log('teacher closing poll', pollId, 'in', room);
      io.sockets.to(room).emit('closePoll', data);
    });

    client.on('teacherLeavingClass', function(data) {
      // var classId = data.classId;
      console.log('teacher leaving class', data.classId);
      client.leave(room);
      io.sockets.to(room).emit('teacherLeftClass', data);
      room = undefined;
    });

    //STUDENT CODE
    client.on('studentConnect', function(data) {
      // FRONTEND-LISTENER: client.on('newStudentConnected', (studentInfo) => {display(studentCount++ and studentInfo);});
      var userId = data.userId;
      room = 'room' + data.classId;
      client.join(room);
      console.log('Student', userId, 'connected to', room);
      io.sockets.to(room).emit('studentJoinedRoom', data);
      //TODO: DB.write('newStudentConnected', data);
    });

    client.on('studentQuickClassConnect', function(data) {
      room = 'room' + data.classId;
      client.join(room);
      console.log('Student connected to quick class', room);
      io.sockets.to(room).emit('studentJoinedRoom', data);
    });

    client.on('studentResponse', function(data) {
      console.log('INCOMING STUDENT RESPONSE:', data);
      io.sockets.to(room).emit('studentResponseForTeacher', data);

      if(data.pollId !== 'Quick Poll') {
        models.poll_responses.create({
          response_val: data.answer,
          student_id: data.userId,
          poll_id: data.pollId
        })
        .catch(function(err) {
          console.error('Error saving student', data.userId, 'poll response to DB:', err);
        });
      }

    });

    client.on('raiseHand', function(data) {
      console.log('Student', data.userId, 'raised hand');
      io.sockets.to(room).emit('studentRaisedHand', data);
    });

    client.on('studentLeavingClass', function(data) {
      var userId = data.userId;
      // var classId = data.classId;
      client.leave(room);
      console.log('Student', userId, 'leaving', room);
      io.sockets.to(room).emit('studentLeftRoom', data);
      room = undefined;
    });

  });
};