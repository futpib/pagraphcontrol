
const r = require('r-dom');

const Label = require('../label');
const Input = require('../input');

module.exports = props => r(Label, [
	...[].concat(props.children),
	r(Input, props),
]);
