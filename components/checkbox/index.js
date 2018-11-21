
const r = require('r-dom');

const Label = require('../label');

const Checkbox = ({ title, ...props }) => r(Label, {
	title,
}, [
	r.input({
		...props,
		type: 'checkbox',
	}),

	...[].concat(props.children),
]);

module.exports = Checkbox;
