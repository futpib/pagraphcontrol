
const r = require('r-dom');

const Button = props => r.button({
	ref: input => {
		if (input && props.autoFocus) {
			input.focus();
		}
	},
	className: 'button',
	...props,
}, props.children);

module.exports = Button;
