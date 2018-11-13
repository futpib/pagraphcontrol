
const r = require('r-dom');

const Button = props => r.button({
	className: 'button',
	...props,
}, props.children);

module.exports = Button;
