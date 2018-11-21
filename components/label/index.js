
const r = require('r-dom');

module.exports = ({ userSelect, passive, ...props }) => r.label({
	classSet: {
		label: true,
		'label-user-select': userSelect,
		'label-passive': passive,
	},
	...props,
}, props.children);
