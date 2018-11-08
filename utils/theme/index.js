
const { theme } = require('@jakejarrett/gtk-theme');
const camelCase = require('camelcase');

const colors = {};

theme.css.replace(/@define-color\s+([\w_]+?)\s+(.+?);/g, (_, name, value) => {
	colors[camelCase(name)] = value;
});

module.exports = { colors };
