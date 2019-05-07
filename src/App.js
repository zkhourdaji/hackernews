import React, { Component } from 'react';
import './App.css';

const list = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1
  }
]

/*
This function is used to return a function to pass it to the filter method when the 
user types in the text box. The value of the text box is passed to isSearchTerm as searchTerm
item will be filled in by the filter function and it represents each item from the list above.
*/
const isSearched = (searchTerm) => (item) =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase());


class Button extends Component {

  render(){
    const{
      onClick, 
      className = "", //this is a default value applied if the parent componenet didnt pass a className
      children
    } = this.props;
    
    return(
      <button
        onClick={onClick}
        className={className}
        type='button'
      >
        {children}
      </button>
    );
  }
}


class Search extends Component {

  render (){

    const {value, onChange, children} = this.props; 

    return (
      <form>
        {children}
      <input 
        type='text'
        value={value}
        onChange={onChange}
      />
      </form>
    );
  }
}

class Table extends Component {

  render(){
    const {pattern, list, onDismiss} = this.props;

    return (
      <div>
        {list.filter(isSearched(pattern)).map(item => {
            // onMyClick is not attached to 'this'
            // we cannot just set the click listener to this.onDismiss(item.objectId) because this will
            // execute the function right away and only the first time the componenet is rendered.
            // instead we wrap it in a lambda expressions, this wont be invoked right away.
            const onMyClick = () => onDismiss(item.objectID);
            // this return is for the map method
            return (
              <div key={item.objectID}>
                <span><a href={item.url}>{item.title}</a></span>
                <span>{item.author}</span>
                <span>{item.num_comments}</span>
                <span>{item.points}</span>
                <span>
                  <Button
                    onClick={onMyClick}
                  >
                    Dismiss
                  </Button>
                </span>
              </div>
            )
          })}
      </div>
    );
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      list,
      name: 'zafer',
      greeting: 'Hello world!',
      searchTerm: ''
    };
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  /*
  This function is called when the user clicks a dismiss button on one of the items.
  */
  onDismiss(id) {
    const updatedList = this.state.list.filter(item => item.objectID !== id);
    this.setState({ list: updatedList });
  }

  onSearchChange(event){
    this.setState({searchTerm:event.target.value});
  }


  render() {

    // this is ES6 destructing syntax.
    const {searchTerm, greeting, name, list} = this.state;

    return (
      <div className="App">
        <h2>{greeting}</h2>
        <p>{name}</p>
        
        <Search 
          value={searchTerm}
          onChange={this.onSearchChange}
        >
        {/*This will be passed in as props.children available in the Search Componenet*/}
        Search Component
        </Search>
        <Table 
          list={list}
          pattern={searchTerm}
          onDismiss={this.onDismiss}
        />
      </div>
    )
  }
}

export default App;
