
const r = require('r-dom');

const React = require('react');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const Modal = require('react-modal');

const Button = require('../button');
const Label = require('../label');
const Input = require('../input');

const {
	preferences: preferencesActions,
} = require('../../actions');

class AddRemoteServerModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			address: 'tcp:remote-computer.lan',
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();

		const { address } = this.state;
		this.props.setAdd('remoteServerAddresses', address);
		this.props.onRequestClose();
	}

	render() {
		const { isOpen, onRequestClose } = this.props;

		return r(Modal, {
			isOpen,
			onRequestClose,
		}, [
			r.h3('Add remote server'),

			r.form({
				onSubmit: this.handleSubmit,
			}, [
				r(Label, {
					title: 'PULSE_SERVER syntax',
				}, [
					r.div('Server address:'),
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
					}, 'Confirm'),
				]),
			]),
		]);
	}
}

module.exports = connect(
	null,
	dispatch => bindActionCreators(preferencesActions, dispatch),
)(AddRemoteServerModal);
