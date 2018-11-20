
const r = require('r-dom');

const React = require('react');

const Modal = require('react-modal');

const Button = require('../button');

class NewGraphObjectModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			name: '',
			args: '',
		};
	}

	render() {
		const { isOpen, onRequestClose, openLoadModuleModal } = this.props;

		return r(Modal, {
			isOpen,
			onRequestClose,
		}, [
			r.h3('Add something'),

			r(Button, {
				style: { width: '100%' },
				onClick: openLoadModuleModal,
				autoFocus: true,
			}, 'Load a module...'),
		]);
	}
}

module.exports = NewGraphObjectModal;
