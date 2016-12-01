// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import makeActions from './actions'

const ws = new WebSocket('ws://localhost:7810')

ws.onopen = () => {
  ReactDOM.render(
    <App
      actions={makeActions(ws)}
    />,
    document.getElementById('root')
  );

}
