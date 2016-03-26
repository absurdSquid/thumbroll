var models = require("./../models");
var sequelize = require('./../models/index').sequelize;

module.exports = {
  getLessons: function(req, res, next) {
    var classId = req.params.classId;
    console.log(classId);
    models.lessons.findAll({ where: {
        class_id: classId
      }
    })
    .then(function(lessons){
      models.classes.findOne({ where: {
          id: classId
        } 
      }).then(function(oneClass){
        models.students_classes.findAll({ 
          where: { class_id: classId},
          include: [models.students]
      }).then(function(students){
        var response = {
          className: oneClass.dataValues.name,
          lessons: lessons,
          students: students
        };
        res.status(200).send(response);
      });
      });
    })
    .catch(function(err){
      console.error('Error getting lessons from DB', err);
      res.status(500).send(err);
    })
  },

  getClassLessonsData: function(req, res, next) {
    var classId = req.params.classId;

    sequelize.query(
      'SELECT w.lesson_id, w.lesson_name, w.poll_count, u.potential_correct_responses_count, ' 
      + 'x.response_count, y.correct_response_count, z.average_thumb, v.student_count FROM '
        + '(SELECT a.id AS lesson_id, a.name AS lesson_name, '
        + 'COUNT(b.*) AS poll_count ' 
        + 'FROM lessons a '
        + 'LEFT JOIN polls b ON b.lesson_id = a.id '
        + 'WHERE a.class_id = ' + classId + ' '
        + 'GROUP BY a.id, a.name) w '
      + 'LEFT JOIN '
        + '(SELECT a.id AS lesson_id, '
        + 'COUNT(c.*) AS response_count ' 
        + 'FROM lessons a '
        + 'LEFT JOIN polls b ON b.lesson_id = a.id '
        + 'LEFT JOIN poll_responses c ON c.poll_id = b.id '
        + 'WHERE a.class_id = ' + classId + ' '
        + 'GROUP BY a.id) x '
      + 'ON w.lesson_id = x.lesson_id LEFT JOIN '
        + '(SELECT a.id AS lesson_id, '
        + 'COUNT(c.*) AS correct_response_count ' 
        + 'FROM lessons a '
        + 'LEFT JOIN polls b ON b.lesson_id = a.id '
        + 'LEFT JOIN poll_responses c ON c.poll_id = b.id '
        + 'WHERE a.class_id = ' + classId + ' '
        + 'AND b.answer IS NOT NULL '
        + 'AND c.response_val = b.answer '
        + 'GROUP BY a.id) y '
      + 'ON w.lesson_id = y.lesson_id LEFT JOIN '
        + '(SELECT a.id AS lesson_id, '
        + 'AVG(CAST(c.response_val AS decimal)) AS average_thumb ' 
        + 'FROM lessons a '
        + 'LEFT JOIN polls b ON b.lesson_id = a.id '
        + 'LEFT JOIN poll_responses c ON c.poll_id = b.id '
        + 'WHERE a.class_id = ' + classId + ' '
        + "AND b.type = 'thumbs' " 
        + 'GROUP BY a.id) z '
      + 'ON w.lesson_id = z.lesson_id LEFT JOIN '
        + '(SELECT a.id AS lesson_id, '
        + 'COUNT(distinct c.student_id) AS student_count ' 
        + 'FROM lessons a '
        + 'LEFT JOIN polls b ON b.lesson_id = a.id '
        + 'LEFT JOIN poll_responses c ON c.poll_id = b.id '
        + 'WHERE a.class_id = ' + classId + ' '
        + 'GROUP BY a.id) v '
      + 'ON w.lesson_id = v.lesson_id LEFT JOIN'
        + '(SELECT a.id AS lesson_id, '
        + 'COUNT(c.*) AS potential_correct_responses_count ' 
        + 'FROM lessons a '
        + 'LEFT JOIN polls b ON b.lesson_id = a.id '
        + 'LEFT JOIN poll_responses c ON c.poll_id = b.id '
        + 'WHERE a.class_id = ' + classId + ' '
        + 'AND b.answer IS NOT NULL '
        + 'GROUP BY a.id) u '
      + 'ON w.lesson_id = u.lesson_id'
    ).then(function(data) {
      var results = data[0];
      console.log(results);
      res.status(200).send(results);
    }).catch(function(err) {
      console.err('Error with query', err)
      res.send(500).send(err);
    });

  },

  getLessonPollsData: function(req, res, next) {
    var lessonId = req.params.lessonId;
    sequelize.query(
      'SELECT w.poll_id, w.poll_name, w.answer, w.response_count, ' 
      + 'x.student_count, y.correct_response_count, z.average_thumb FROM '
        + '(SELECT a.id AS poll_id, a.name AS poll_name, a.answer, '
        + 'COUNT(b.*) AS response_count ' 
        + 'FROM polls a '
        + 'LEFT JOIN poll_responses b ON b.poll_id = a.id '
        + 'WHERE a.lesson_id = ' + lessonId + ' '
        + 'GROUP BY a.id) w '
      + 'LEFT JOIN '
        + '(SELECT a.id AS poll_id, '
        + 'COUNT(distinct c.id) AS student_count ' 
        + 'FROM polls a '
        + 'LEFT JOIN poll_responses b ON b.poll_id = a.id '
        + 'JOIN students c ON c.id = b.student_id '
        + 'WHERE a.lesson_id = ' + lessonId + ' '
        + 'GROUP BY a.id) x '
      + 'ON w.poll_id = x.poll_id LEFT JOIN '
        + '(SELECT a.id AS poll_id, '
        + 'COUNT(b.*) AS correct_response_count ' 
        + 'FROM polls a '
        + 'LEFT JOIN poll_responses b ON b.poll_id = a.id '
        + 'WHERE a.lesson_id = ' + lessonId + ' '
        + 'AND a.answer IS NOT NULL '
        + 'AND b.response_val = a.answer '
        + 'GROUP BY a.id) y '
      + 'ON w.poll_id = y.poll_id LEFT JOIN '
        + '(SELECT a.id AS poll_id, '
        + 'AVG(CAST(b.response_val AS decimal)) AS average_thumb ' 
        + 'FROM polls a '
        + 'LEFT JOIN poll_responses b ON b.poll_id = a.id '
        + 'WHERE a.lesson_id = ' + lessonId + ' '
        + "AND a.type = 'thumbs' " 
        + 'GROUP BY a.id) z '
      + 'ON w.poll_id = z.poll_id '
    ).then(function(data) {
      var results = data[0];
      console.log(results);
      res.status(200).send(results);
    }).catch(function(err) {
      console.err('Error with query', err)
      res.send(500).send(err);
    });
  },

  getClassStudentsData: function(req, res, next) {
    var classId = req.params.classId;
    sequelize.query(
      // May want to start queries with classes for less selecting
      'SELECT w.student_id, w.first_name, w.last_name, w.lesson_count, ' 
      + 'x.response_count, y.correct_response_count, z.average_thumb FROM '
        + '(SELECT a.id AS student_id, a.firstname AS first_name, a.lastname AS last_name, '
        + 'COUNT(distinct d.lesson_id) AS lesson_count ' 
        + 'FROM students a '
        + 'JOIN students_classes b ON a.id = b.student_id '
        + 'LEFT JOIN poll_responses c ON a.id = c.student_id '
        + 'LEFT JOIN polls d ON d.id = c.poll_id '
        + 'WHERE b.class_id = ' + classId + ' '
        + 'GROUP BY a.id, a.firstname, a.lastname) w '
      + 'LEFT JOIN '
        + '(SELECT a.id AS student_id, '
        + 'COUNT(c.*) AS response_count ' 
        + 'FROM students a '
        + 'JOIN students_classes b ON a.id = b.student_id '
        + 'LEFT JOIN poll_responses c ON a.id = c.student_id '
        + 'WHERE b.class_id = ' + classId + ' '
        + 'GROUP BY a.id) x '
      + 'ON w.student_id = x.student_id LEFT JOIN '
        + '(SELECT a.id AS student_id, '
        + 'COUNT(c.*) AS correct_response_count ' 
        + 'FROM students a '
        + 'JOIN students_classes b ON a.id = b.student_id '
        + 'LEFT JOIN poll_responses c ON a.id = c.student_id '
        + 'LEFT JOIN polls d ON d.id = c.poll_id '
        + 'WHERE b.class_id = ' + classId + ' '
        + 'AND d.answer IS NOT NULL '
        + 'AND c.response_val = d.answer '
        + 'GROUP BY a.id) y '
      + 'ON w.student_id = y.student_id LEFT JOIN '
        + '(SELECT a.id AS student_id, '
        + 'AVG(CAST(c.response_val AS decimal)) AS average_thumb ' 
        + 'FROM students a '
        + 'JOIN students_classes b ON a.id = b.student_id '
        + 'LEFT JOIN poll_responses c ON a.id = c.student_id '
        + 'LEFT JOIN polls d ON d.id = c.poll_id '
        + 'WHERE b.class_id = ' + classId + ' '
        + "AND d.type = 'thumbs' " 
        + 'GROUP BY a.id) z '
      + 'ON w.student_id = z.student_id '
    ).then(function(data) {
      var results = data[0];
      console.log(results);
      res.status(200).send(results);
    }).catch(function(err) {
      console.err('Error with query', err)
      res.send(500).send(err);
    });
  },

  getStudentPollsData: function(req, res, next) {
    var classId = req.params.classId;
    var studentId = req.params.studentId;
    sequelize.query(
      // May want to start queries with classes for less selecting
      'SELECT a.id AS student_id, a.firstname AS first_name, a.lastname AS last_name, '
      + 'd.id AS lesson_id, d.name AS lesson_name, '
      + 'c.id AS poll_id, c.name AS poll_name, c.type, c.answer AS correct_answer, '
      + 'b.response_val AS student_answer '
      + 'FROM students a '
      + 'LEFT JOIN poll_responses b ON a.id = b.student_id '
      + 'JOIN polls c ON c.id = b.poll_id '
      + 'JOIN lessons d ON d.id = c.lesson_id '
      + 'WHERE a.id = ' + studentId + ' '
      + 'AND d.class_id = ' + classId + ' '
    ).then(function(data) {
      var results = data[0];
      console.log(results);
      res.status(200).send(results);
    }).catch(function(err) {
      console.err('Error with query', err)
      res.send(500).send(err);
    });
  }
}

