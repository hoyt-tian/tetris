import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game.jsx';

let GA = function(){
    console.log('done');
};

let game = ReactDOM.render(<Game disableMode={true} onGameOver = {GA} />, document.body);