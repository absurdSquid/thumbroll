import React from 'react'
import Lessons from './lessons/Lessons'
import Students from './students/Students'


class Classes extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      displayListener: this.props.displayListener,
      classes : this.props.classData.map((specificClass) => {
        return (<li style={{cursor: 'default'}} onClickCapture={(event) => {
          this.setState({
            currentClass: event.target.innerText,
          });
          this.state.displayListener('class');
        }} key={specificClass.name}>{specificClass.name}</li>)
      }),
      students : this.props.studentData.map((specificStudent) => {
        return (<li style={{cursor: 'default'}} onClickCapture={(event) => {
          this.setState({
            currentStudent: event.target.innerText,
          });
          this.state.displayListener('student');
        }} key={specificStudent.firstname}>{specificStudent.firstname}</li>)
      }),
      newClassName : '',
      currentClass: '',
      currentStudent: ''
    };
  }

  render(){
    if(this.props.display[0] === 'home'){
      return (
        <div>
          <h2>Classes</h2>
          {this.state.classes}
          <div>
            <form onSubmit={this.addClass.bind(this)}>
              <input className='newClassForm' type='text' value={this.state.newClassName} onChange={(event) => {
                this.setState({
                  newClassName: event.target.value
                });
              }} />
              <div>
                <button type='submit'>Add new class</button>
              </div>
            </form>
          </div>
          <h2>Today's Lessons</h2>
          <p>There are no lessons today.</p>
        <div>
          <Lessons students={this.state.students} display={this.props.display} displayListener={this.state.displayListener.bind(this)} className={this.state.currentClass}/>
          <Students students={this.state.students} display={this.props.display} displayListener={this.state.displayListener.bind(this)} className={this.state.currentClass}/>
        </div>
      </div>
    );
   } else {
      return (
        <div>
          <Lessons display={this.props.display} displayListener={this.state.displayListener.bind(this)} className={this.state.currentClass}/>
          <Students students={this.state.students} display={this.props.display} displayListener={this.state.displayListener.bind(this)} className={this.state.currentClass}/>
        </div>
      )
    }
  }

  addClass(e){
    e.preventDefault();
    // update state with new list item
    if(!!this.state.newClassName.trim()){
      var classesCopy = this.state.classes.slice();
      classesCopy.push(<li 
        style={{cursor: 'default'}} 
        onClickCapture={(event) => {
          this.setState({currentClass: event.target.innerText});
          this.state.displayListener('lessons');
        }} 
        key={this.state.newClassName}>
        {this.state.newClassName}
      </li>);

      this.setState({
        classes: classesCopy,
        newClassName: ''
      });
    }

    // post to DB with teacher associated
  }

  showClass(){

  }


}

module.exports = Classes;