
const {
	mapObjIndexed,
	map,
	merge,
	path,
} = require('ramda');

const r = require('r-dom');

const React = require('react');

const Modal = require('react-modal');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const {
	pulse: pulseActions,
	preferences: preferencesActions,
} = require('../../actions');

const {
	getPaiByTypeAndIndex,
} = require('../../selectors');

const { modules } = require('../../constants/pulse');

const Checkbox = require('../checkbox');
const Button = require('../button');

Modal.setAppElement('#root');

Modal.defaultStyles = {
	overlay: {},
	content: {},
};

class ConfirmationModal extends React.PureComponent {
	render() {
		const { target, confirmation, onConfirm, onCancel } = this.props;

		return r(Modal, {
			isOpen: Boolean(confirmation),
			onRequestClose: onCancel,
		}, [
			confirmation === 'unloadModuleByIndex' && r(React.Fragment, [
				r.h3('Module unload confirmation'),

				target && r.p([
					'You are about to unload ',
					r.code(target.name),
					'.',
					'This may not be easily undoable and may impair sound playback on your system.',
				]),
			]),

			r(Checkbox, {
				checked: this.props.preferences.doNotAskForConfirmations,
				onChange: () => this.props.toggle('doNotAskForConfirmations'),
			}, 'Do not ask for confirmations'),

			r.div({
				className: 'button-group',
			}, [
				r(Button, {
					onClick: onCancel,
				}, 'Cancel'),

				r(Button, {
					onClick: onConfirm,
					autoFocus: true,
				}, 'Confirm'),
			]),
		]);
	}
}

class Modals extends React.PureComponent {
	constructor(props) {
		super(props);

		this.initialState = {
			target: null,
			confirmation: null,
			continuation: null,
		};
		this.state = this.initialState;

		this.handleCancel = this.handleCancel.bind(this);
	}

	static getDerivedStateFromProps(props) {
		return {
			actions: mapObjIndexed((f, name) => function (...args) {
				const continuation = () => {
					props[name](...args);
					this.setState(this.initialState);
				};

				if (props.preferences.doNotAskForConfirmations) {
					return continuation();
				}

				const target = f(...args);

				if (!target) {
					return continuation();
				}

				this.setState({
					target,
					continuation,
					confirmation: name,
				});
			}, {
				unloadModuleByIndex(index) {
					const pai = getPaiByTypeAndIndex('module', index)({ pulse: props });

					if (pai && path([ pai.name, 'confirmUnload' ], modules)) {
						return pai;
					}

					return null;
				},
			}),
		};
	}

	handleCancel() {
		this.setState(this.initialState);
	}

	render() {
		const { preferences, toggle, children } = this.props;
		const { actions, target, confirmation, continuation } = this.state;

		return r(React.Fragment, [
			...children({ actions: map(a => a.bind(this), actions) }),

			r(ConfirmationModal, {
				target,
				confirmation,
				onConfirm: continuation,
				onCancel: this.handleCancel,

				preferences,
				toggle,
			}),
		]);
	}
}

module.exports = connect(
	state => ({
		infos: state.pulse.infos,
		preferences: state.preferences,
	}),
	dispatch => bindActionCreators(merge(pulseActions, preferencesActions), dispatch),
)(Modals);
