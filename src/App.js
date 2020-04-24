import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from "react-router-dom";

import NavBar from "./components/Navigation";
import MainPage from "./components/MainPage";
import Footer from "./components/Footer";
import Calculator from './containers/Calculator';
import SideDrawer from "./components/SideDrawer";
import Results from "./containers/Results";

class App extends Component {
  state = {
    showDrawer: false,
    results: null
  }

  redirectHandler = (result, fn) => {
    this.setState({ results: result }, fn);
  }

  openDrawerHandler = () => {
    this.setState({showDrawer: true});
  }

  closeDrawerHandler = () => {
    this.setState({showDrawer: false});
  }

  render() {
    return (
      <div className="App">
        <Router basename={process.env.PUBLIC_URL}>
          <React.Fragment>
            <NavBar drawer={this.openDrawerHandler}/>
            <SideDrawer show={this.state.showDrawer} drawer={this.closeDrawerHandler}/>
              <Route exact path="/" render={() => <MainPage />} />
              <Route path="/cal" render={() => <Calculator redirect={this.redirectHandler}/> }/>
              <Route path="/result" render={() => <Results result={this.state.results}/>} />
          </React.Fragment>
        </Router>
        <Footer />
      </div>
    );
  }
}

export default App;
