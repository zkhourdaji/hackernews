import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';


const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

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

const largeColumn = { width: '40%' };
const midColumn = { width: '30%' };
const smallColumn = { width: '10%' };

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
      // search term changes as use types in the text box
      searchTerm: DEFAULT_QUERY,
      results: null,
      // searchKey is for caching results, the key will be what the user searched on
      searchKey: '',

    };

    // make sure to bind all methods
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
  }

  // this returns true if the user is searching for the searchTerm for the first time
  // meaning that we didnt cache the results
  // if we already have the results cahced, this will return false
  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  // this method is used after we get a json response from the api call
  // result is the json result from the api call
  setSearchTopStories(result) {
    // hits is an array of articles
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    // concatenate the old hits with the new hits
    const updatedHits = [...oldHits, ...hits];

    this.setState({
      results: {
        ...results,
        [searchKey]: {
          hits: updatedHits,
          page
        }
      }
    });
  }

  /*
  This function is called when the user clicks a dismiss button on one of the items.
  */
  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    const isNotId = item => item.objectID !== id;

    const updatedHits = hits.filter(isNotId);
    this.setState({
      results: {
        ...results,
        [searchKey]: {
          hits: updatedHits,
          page
        }
      }
    });
  }

  // this is used to keep track of the user input in the text box
  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  // this method is called when the user clicks the submit button
  // it will call the api with the search term
  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    // we keep track of the search key for caching the results to the state
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      // setSearchTopStories will update the state causing a rerender
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this.setState({ error }));
  }

  componentDidMount() {
    // destructuring sytax
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    // this is ES6 destructing syntax.
    const {
      searchTerm,
      results,
      searchKey,
      error
    } = this.state;

    // page will be the page number if result is not null
    // otherwise default to 0 (this is for the first api call)
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className='interactions'>
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          />
        </div>
        {
          error ? 
          <div className='interaction'>
            <p>Something went wrong {error.toString()}</p>
          </div> :
             <Table
             list={list}
             onDismiss={this.onDismiss}
           />
        }
     
        {/* pagination */}
        <div className='interactions'>
          <Button onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}>
            More
          </Button>
        </div>
      </div>
    )
  }
}

export default App;
