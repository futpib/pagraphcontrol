
const r = require('r-dom');

const Label = require('../label');

const Checkbox = props => r(Label, [
	r.input({
		...props,
		type: 'checkbox',
	}),

	...[].concat(props.children),
]);

module.exports = Checkbox;
