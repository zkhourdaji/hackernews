import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`

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

//className has a default value 
//its applied if the parent componenet didnt pass a className
const Button = ({ onClick, className = "", children }) =>
  <button
    onClick={onClick}
    className={className}
    type='button'
  >
    {children}
  </button>

const Search = ({ 
  value, 
  onChange,
  onSubmit, 
  children 
}) =>
  <form onSubmit={onSubmit}>
    {children}
    <input
      type='text'
      value={value}
      onChange={onChange}
    />
    <button>Search</button>
  </form>

const largeColumn = {width: '40%'};
const midColumn = {width: '30%'};
const smallColumn = {width:'10%'};

const Table = ({ list, onDismiss }) =>
  <div className='table'>
    {list.map(item => {
      // onMyClick is not attached to 'this'
      // we cannot just set the click listener to this.onDismiss(item.objectId) because this will
      // execute the function right away and only the first time the componenet is rendered.
      // instead we wrap it in a lambda expressions, this wont be invoked right away.
      const onMyClick = () => onDismiss(item.objectID);
      
      // this return is for the map method
      return (
        <div key={item.objectID} className='table-row'>
          {/*The style attribute is a little bit different than html. Here is a javascript object */}
          <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={midColumn}>
            {item.author}
          </span>
          <span style={smallColumn}>
            {item.num_comments}
          </span>
          <span style={smallColumn}>
            {item.points}
          </span>
          <span style={smallColumn}>
            <Button
              onClick={onMyClick}
              className="button-inline"
            >
              Dismiss
          </Button>
          </span>

        </div>
      )
    })}
  </div>

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      name: 'zafer',
      greeting: 'Hello world!',
      searchTerm: DEFAULT_QUERY,
      result:null
    };
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
  }

  // this method is used after we get a json response from the api call
  setSearchTopStories(result){
    // this is a shortcut for {result:result}
    this.setState({result});
  }

  /*
  This function is called when the user clicks a dismiss button on one of the items.
  */
  onDismiss(id) {
    const updatedHits = this.state.result.hits.filter(item => item.objectID !== id);
    this.setState({ 
     // result: Object.assign({}, this.state.result, {hits: updatedHits})
     result: {...this.state.result, hits: updatedHits}
    });
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }
  
  onSearchSubmit(event){
    const{searchTerm} = this.state;
    this.fetchSearchTopStories(searchTerm);
    event.preventDefault();
  }

  fetchSearchTopStories(searchTerm){
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
    .then(res => res.json())
    // setSearchTopStories will update the state causing a rerender
    .then(result => this.setSearchTopStories(result))
    .catch(error => error);
  }

  componentDidMount(){
    // destructuring sytax
    const{searchTerm} = this.state;
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    // this is ES6 destructing syntax.
    const { searchTerm, greeting, name, result } = this.state;
    if (!result)
      return null;

    return (
      <div className="page">
        <div className='interactions'>
          <h2>{greeting}</h2>
          <p>{name}</p>

          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            {/*This will be passed in as props.children available in the Search Componenet*/}
            Search Component
        </Search>
        </div>
        {
          // wow this is crazy shit right here
          result && 
          <Table
          list={result.hits}
          onDismiss={this.onDismiss}
        />
        }
      
      </div>
    )
  }
}

export default App;
