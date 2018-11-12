
const r = require('r-dom');

module.exports = props => r.input({
	className: 'input',
	...props,
}, props.children);
