/* global document */

const React = require('react');

const r = require('r-dom');

const { render } = require('react-dom');

const { Provider } = require('react-redux');

const createStore = require('./store');

const Graph = require('./components/graph');
const Cards = require('./components/cards');
const Preferences = require('./components/preferences');

const theme = require('./utils/theme');

const Root = () => r(Provider, {
	store: createStore(),
}, r(React.Fragment, [
	r(Graph),
	r(Cards),
	r(Preferences),
]));

Object.entries(theme.colors).forEach(([ key, value ]) => {
	document.body.style.setProperty('--' + key, value);
});

render(r(Root), document.getElementById('root'));
