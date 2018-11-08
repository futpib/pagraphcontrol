
const r = require('r-dom');

const Button = props => r.button({
	...props,
}, props.children);

module.exports = Button;
