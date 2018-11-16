
const {
	keys,
	pick,
	map,
	bind,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { HotKeys } = require('react-hotkeys');

const keyMap = {
	hotKeyEscape: 'escape',

	hotKeyFocusCards: 'c',
	hotKeyFocusGraph: 'g',
	hotKeyFocusPreferences: 'p',

	hotKeyFocusDown: [ 'j', 'down' ],
	hotKeyFocusUp: [ 'k', 'up' ],
	hotKeyFocusLeft: [ 'h', 'left' ],
	hotKeyFocusRight: [ 'l', 'right' ],

	hotKeyMute: 'm',
};

class MyHotKeys extends React.Component {
	constructor(props) {
		super(props);

		this.graphRef = React.createRef();
		this.cardsRef = React.createRef();
		this.preferencesRef = React.createRef();
	}

	hotKeyFocusCards() {
		this.cardsRef.current.getWrappedInstance().toggle();
		this.preferencesRef.current.getWrappedInstance().close();
	}

	hotKeyFocusGraph() {
		this.cardsRef.current.getWrappedInstance().close();
		this.preferencesRef.current.getWrappedInstance().close();
		this.graphRef.current.getWrappedInstance().focus();
	}

	hotKeyFocusPreferences() {
		this.preferencesRef.current.getWrappedInstance().toggle();
		this.cardsRef.current.getWrappedInstance().close();
	}

	hotKeyEscape() {
		this.hotKeyFocusGraph();
		this.graphRef.current.getWrappedInstance().deselect();
	}

	render() {
		return r(HotKeys, {
			keyMap,
			handlers: map(f => bind(f, this), pick(keys(keyMap), this)),
		}, this.props.children({
			graphRef: this.graphRef,
			cardsRef: this.cardsRef,
			preferencesRef: this.preferencesRef,
		}));
	}
}

module.exports = {
	HotKeys: MyHotKeys,
	keyMap,
};
