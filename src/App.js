import React, { Component } from 'react';

const ws = new WebSocket('ws://localhost:7810')
ws.onmessage = event => {
  console.log('got message', event.data)
}
ws.onopen = () => {
  ws.send('Hellos')
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
