
const r = require('r-dom');

const React = require('react');

const Modal = require('react-modal');

const Checkbox = require('../checkbox');
const Button = require('../button');

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

module.exports = ConfirmationModal;
