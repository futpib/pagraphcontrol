
const camelCase = require('camelcase');

const theme = require('../gtk-theme');

const colors = require('./default-colors.json');

theme.css.replace(/@define-color\s+([\w_]+?)\s+(.+?);/g, (_, name, value) => {
	colors[camelCase(name)] = value;
});

module.exports = {
	iconThemeNames: theme.iconThemeNames,
	colors,
};
