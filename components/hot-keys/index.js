
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

	hotKeyMove: 'm',

	hotKeyVolumeDown: [ '/', '9' ],
	hotKeyVolumeUp: [ '*', '0' ],

	hotKeyMute: 'space',
	hotKeyShiftMute: 'shift+space',

	hotKeySetAsDefault: 'f',
};

class MyHotKeys extends React.Component {
	constructor(props) {
		super(props);

		this.graphRef = React.createRef();
		this.cardsRef = React.createRef();
		this.preferencesRef = React.createRef();
	}

	componentDidMount() {
		this.hotKeyFocusGraph();
	}

	hotKeyFocusCards() {
		this.preferencesRef.current.getWrappedInstance().close();

		const cards = this.cardsRef.current.getWrappedInstance();
		cards.toggle();
		if (!cards.isOpen()) {
			this.graphRef.current.getWrappedInstance().focus();
		}
	}

	hotKeyFocusGraph() {
		this.cardsRef.current.getWrappedInstance().close();
		this.preferencesRef.current.getWrappedInstance().close();
		this.graphRef.current.getWrappedInstance().focus();
	}

	hotKeyFocusPreferences() {
		this.cardsRef.current.getWrappedInstance().close();

		const preferences = this.preferencesRef.current.getWrappedInstance();
		preferences.toggle();
		if (!preferences.isOpen()) {
			this.graphRef.current.getWrappedInstance().focus();
		}
	}

	hotKeyEscape() {
		this.hotKeyFocusGraph();
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
