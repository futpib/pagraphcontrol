
const r = require('r-dom');

module.exports = ({ options, optionValue, optionText, ...props }) => r.select({
	className: 'select',
	...props,
}, options.map(o => r.option({ value: optionValue(o) }, optionText(o))));
