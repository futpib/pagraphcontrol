
const r = require('r-dom');

const React = require('react');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const Modal = require('react-modal');

const Button = require('../button');
const Label = require('../label');
const Input = require('../input');

const {
	pulse: pulseActions,
} = require('../../actions');

class LoadModuleModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			name: '',
			args: '',
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();

		const { name, args } = this.state;
		this.props.loadModule(name, args);
		this.props.onRequestClose();
	}

	render() {
		const { isOpen, onRequestClose } = this.props;

		return r(Modal, {
			isOpen,
			onRequestClose,
		}, [
			r.h3('Load a module'),

			r.form({
				onSubmit: this.handleSubmit,
			}, [
				r(Label, [
					r.div('Module name:'),
					r.p([
						r(Input, {
							style: { width: '100%' },
							autoFocus: true,
							value: this.state.name,
							onChange: e => this.setState({ name: e.target.value }),
						}),
					]),
				]),

				r(Label, [
					r.div('Arguments:'),
					r.p([
						r(Input, {
							style: { width: '100%' },
							value: this.state.args,
							onChange: e => this.setState({ args: e.target.value }),
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
	dispatch => bindActionCreators(pulseActions, dispatch),
)(LoadModuleModal);
