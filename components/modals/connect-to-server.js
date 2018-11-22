
const { spawn } = require('child_process');

const {
	merge,
} = require('ramda');

const r = require('r-dom');

const React = require('react');

const Modal = require('react-modal');

const Button = require('../button');
const Label = require('../label');
const Input = require('../input');

class ConnectToServerModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			address: props.defaults.address,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();

		const subprocess = spawn('pagraphcontrol', [], {
			detached: true,
			stdio: 'ignore',
			env: merge(process.env, {
				PULSE_SERVER: this.state.address,
			}),
		});

		subprocess.unref();

		this.props.onRequestClose();
	}

	render() {
		const { isOpen, onRequestClose } = this.props;

		return r(Modal, {
			isOpen,
			onRequestClose,
		}, [
			r.h3('Connect to PulseAudio server'),

			r.form({
				onSubmit: this.handleSubmit,
			}, [
				r(Label, [
					r.div({
						title: 'Same format as PULSE_SERVER',
					}, 'Specify the server to connect to:'),
					r.p([
						r(Input, {
							style: { width: '100%' },
							autoFocus: true,
							value: this.state.address,
							onChange: e => this.setState({ address: e.target.value }),
						}),
					]),
				]),

				r.div({
					className: 'button-group',
				}, [
					r(Button, {
						onClick: onRequestClose,
					}, 'Cancel'),

					r(Button, {
						type: 'submit',
					}, 'Connect'),
				]),
			]),
		]);
	}
}

ConnectToServerModal.defaultProps = {
	defaults: {
		address: 'tcp:remote-computer.lan',
	},
};

module.exports = ConnectToServerModal;
