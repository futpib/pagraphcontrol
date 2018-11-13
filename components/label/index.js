
const r = require('r-dom');

module.exports = props => r.label({
	className: 'label',
	...props,
}, props.children);
