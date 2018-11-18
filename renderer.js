/* global document */

const r = require('r-dom');

const { render } = require('react-dom');

const { Provider: ReduxProvider } = require('react-redux');

const createStore = require('./store');

const Graph = require('./components/graph');
const Cards = require('./components/cards');
const Preferences = require('./components/preferences');
const { HotKeys } = require('./components/hot-keys');
const { MenuProvider } = require('./components/menu');

const theme = require('./utils/theme');

const Root = () => r(ReduxProvider, {
	store: createStore(),
}, r(MenuProvider, {}, r(HotKeys, {}, ({ graphRef, cardsRef, preferencesRef }) => [
	r(Graph, { ref: graphRef }),
	r(Cards, { ref: cardsRef }),
	r(Preferences, { ref: preferencesRef }),
])));

Object.entries(theme.colors).forEach(([ key, value ]) => {
	document.body.style.setProperty('--' + key, value);
});

render(r(Root), document.getElementById('root'));
