// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const ws = new WebSocket('ws://localhost:7810')
ws.onmessage = event => {
  console.log('got message', event.data)
}
ws.onopen = () => {
  ws.send('Hellos')
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
