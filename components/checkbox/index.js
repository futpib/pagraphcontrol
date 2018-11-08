
const r = require('r-dom');

const Checkbox = props => r.label({
	classSet: { checkbox: true },
}, [
	r.input({
		...props,
		type: 'checkbox',
	}),

	...[].concat(props.children),
]);

module.exports = Checkbox;
