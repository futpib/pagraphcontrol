/* global document */

const r = require('r-dom');

const { render } = require('react-dom');

const { Provider: ReduxProvider } = require('react-redux');

const createStore = require('./store');

const Graph = require('./components/graph');
const TopLeftOnScreenButtonGroup = require('./components/top-left-on-screen-button-group');
const Cards = require('./components/cards');
const Network = require('./components/network');
const Preferences = require('./components/preferences');
const Log = require('./components/log');
const ServerInfo = require('./components/server-info');
const { HotKeys } = require('./components/hot-keys');
const { MenuProvider } = require('./components/menu');
const Modals = require('./components/modals');
const { VolumePeaksProvider, VolumePeaksConsumer } = require('./components/volume-peaks-provider');

const theme = require('./utils/theme');

const Root = () => r(ReduxProvider, {
	store: createStore(),
}, r(VolumePeaksProvider, {
}, r(VolumePeaksConsumer, {
}, peaks => r(HotKeys, {
}, ({
	graphRef,
	cardsRef,
	networkRef,
	preferencesRef,
	actions: hotKeysActions,
}) => r(Modals, {
}, ({ actions: modalsActions }) => r(MenuProvider, {
	...modalsActions,
	...hotKeysActions,
}, [
	r(Graph, { ref: graphRef, peaks, ...modalsActions }),
	r(TopLeftOnScreenButtonGroup, hotKeysActions),
	r(Cards, { ref: cardsRef }),
	r(Network, { ref: networkRef, ...modalsActions }),
	r(Preferences, { ref: preferencesRef }),
	r(ServerInfo),
	r(Log),
]))))));

Object.entries(theme.colors).forEach(([ key, value ]) => {
	document.body.style.setProperty('--' + key, value);
});

render(r(Root), document.querySelector('#root'));
