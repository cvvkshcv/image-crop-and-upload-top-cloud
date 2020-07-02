import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import './App.css';
import HomePage from './HomePage/pages/HomePage';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact><HomePage /></Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
