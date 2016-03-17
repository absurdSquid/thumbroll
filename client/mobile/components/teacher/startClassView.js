var React = require('react-native');
var SelectLessonView = require('./selectLessonView');
var api = require('./../../utils/api');
require('./../../utils/userAgent');
var io =require('socket.io-client/socket.io');
var env = require('./../../utils/environment');
var server = env.server + ':' + env.port;

var {
  View,
  Text,
  StyleSheet,
  Navigator,
  TouchableOpacity,
  ScrollView,
  ListView
} = React;

class StartClassView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: ['Quick Class', 'CS 101', 'CS 201', 'CS 401'],
    };
  }

  selectClass(classId) {
    // api.getLessons(classId)
    // .then((response) => {
    //   if(response.status === 500){
    //     console.error('err getting class data');
    //   } else if(response.status === 200) {
    //     var body = JSON.parse(response._bodyText);

    //     this.socket = io(server, {jsonp: false});

    //     this.socket.emit('teacherConnect');

    //     this.props.navigator.push({
    //       component: SelectLessonView,
    //       classId: classId,
    //       lessons: body.lessons,
    //       socket: this.socket,
    //       sceneConfig: {
    //         ...Navigator.SceneConfigs.FloatFromRight,
    //         gestures: {}
    //       }
    //     });
    //   }
    // })
    // .catch((err) => {
    //   console.error(err);
    // });

    this.socket = io(server, {jsonp: false});

    this.socket.emit('teacherConnect');

    this.props.navigator.push({
      component: SelectLessonView,
      classId: classId,
      lessons: ['lesson 1', 'Test1', 'lesson 2'],
      socket: this.socket,
      sceneConfig: {
        ...Navigator.SceneConfigs.FloatFromRight,
        gestures: {}
      }
    });
  }

  renderClasses(classes) {
    return classes.map((className, index) => {
      return (
        <View style={styles.buttonContainer} key={index}>
          <TouchableOpacity onPress={this.selectClass.bind(this, className)} style={styles.button}>
            <Text style={styles.buttonText}> {className} </Text>
          </TouchableOpacity>
        </View>
      )
    })
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#ededed'}}> 
        <View style={styles.viewContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.pageText}> Your classes </Text>
          </View>
          <ScrollView>
            <View style={styles.buttonsContainer}>
              {this.renderClasses(this.state.classes)}
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  pageText: {
    fontSize: 20
  },
  buttonsContainer: {
    padding: 20
  },
  buttonContainer: {
    margin: 20
  },
  button: {

  },
  buttonText: {
    fontSize: 20
  }
});

module.exports = StartClassView;
