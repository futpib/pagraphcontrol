
const camelCase = require('camelcase');

const {
	map,
} = require('ramda');

const theme = require('../gtk-theme');

const colors = require('./default-colors.json');

theme.css.replace(/@define-color\s+([\w_]+?)\s+(.+?);/g, (_, name, value) => {
	colors[camelCase(name)] = value;
});

const resolveColor = (value, depth = 0) => {
	if (depth > 3) {
		return value;
	}

	if (value && value.startsWith('@')) {
		return resolveColor(colors[camelCase(value.slice(1))], depth + 1);
	}

	return value;
}

module.exports = {
	iconThemeNames: theme.iconThemeNames,
	colors: map(resolveColor, colors),
};
