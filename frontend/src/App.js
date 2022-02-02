import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Chat from './components/Chat/Chat';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Chat} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          <Route
            render={() => (
              <h1>
                404
                <br />
                Page not found
              </h1>
            )}
          />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
