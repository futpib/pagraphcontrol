
const {
	memoizeWith,
} = require('ramda');

const r = require('r-dom');

const ref = memoizeWith(autoFocus => String(Boolean(autoFocus)), autoFocus => input => {
	if (input && autoFocus) {
		input.focus();
	}
});

const Button = props => r.button({
	ref,
	className: 'button',
	type: 'button',
	...props,
}, props.children);

module.exports = Button;
