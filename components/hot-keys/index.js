
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
	hotKeyFocusNetwork: 'n',
	hotKeyFocusGraph: 'g',
	hotKeyFocusPreferences: 'p',

	hotKeyFocusDown: [ 'j', 'down' ],
	hotKeyFocusUp: [ 'k', 'up' ],
	hotKeyFocusLeft: [ 'h', 'left' ],
	hotKeyFocusRight: [ 'l', 'right' ],

	hotKeyMove: 'm',

	hotKeyVolumeDown: [ '/', '9' ],
	hotKeyVolumeUp: [ '*', '0' ],

	hotKeyMute: [
		'space',
		'shift+space',
		'ctrl+space',
		'ctrl+shift+space',
	],

	hotKeySetAsDefault: 'f',

	hotKeyAdd: 'a',
};

class MyHotKeys extends React.Component {
	constructor(props) {
		super(props);

		this.graphRef = React.createRef();
		this.cardsRef = React.createRef();
		this.networkRef = React.createRef();
		this.preferencesRef = React.createRef();
	}

	componentDidMount() {
		this.hotKeyFocusGraph();
	}

	hotKeyFocusGraph() {
		this.cardsRef.current.close();
		this.networkRef.current.close();
		this.preferencesRef.current.close();
		this.graphRef.current.focus();
	}

	hotKeyFocusCards() {
		this.networkRef.current.close();
		this.preferencesRef.current.close();

		const cards = this.cardsRef.current;
		cards.toggle();
		if (!cards.isOpen()) {
			this.graphRef.current.focus();
		}
	}

	hotKeyFocusNetwork() {
		this.cardsRef.current.close();
		this.preferencesRef.current.close();

		const network = this.networkRef.current;
		network.toggle();
		if (!network.isOpen()) {
			this.graphRef.current.focus();
		}
	}

	hotKeyFocusPreferences() {
		this.cardsRef.current.close();
		this.networkRef.current.close();

		const preferences = this.preferencesRef.current;
		preferences.toggle();
		if (!preferences.isOpen()) {
			this.graphRef.current.focus();
		}
	}

	hotKeyEscape() {
		this.hotKeyFocusGraph();
	}

	render() {
		const handlers = map(f => bind(f, this), pick(keys(keyMap), this));
		return r(HotKeys, {
			keyMap,
			handlers,
		}, this.props.children({
			graphRef: this.graphRef,
			cardsRef: this.cardsRef,
			networkRef: this.networkRef,
			preferencesRef: this.preferencesRef,

			actions: {
				focusGraph: handlers.hotKeyFocusGraph,
				focusCards: handlers.hotKeyFocusCards,
				focusNetwork: handlers.hotKeyFocusNetwork,
				focusPreferences: handlers.hotKeyFocusPreferences,
			},
		}));
	}
}

module.exports = {
	HotKeys: MyHotKeys,
	keyMap,
};
