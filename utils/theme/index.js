
const fs = require('fs');
const path = require('path');

const ini = require('ini');

const { theme } = require('@jakejarrett/gtk-theme');
const camelCase = require('camelcase');

const colors = {};

theme.css.replace(/@define-color\s+([\w_]+?)\s+(.+?);/g, (_, name, value) => {
	colors[camelCase(name)] = value;
});

const gtkIniPath = path.join(
	process.env.HOME,
	process.env.XDG_CONFIG_HOME || '.config',
	'gtk-3.0',
	'settings.ini',
);

const iconThemeNames = (() => {
	let gtk;
	try {
		gtk = ini.parse(fs.readFileSync(gtkIniPath, 'utf-8'));
	} catch (error) {
		console.error(error);
	}

	if (gtk) {
		return [
			gtk.Settings['gtk-icon-theme-name'],
			gtk.Settings['gtk-fallback-icon-theme'],
			'hicolor',
		];
	}

	return [ 'Adwaita', 'hicolor' ];
})();

module.exports = {
	name: theme.theme_name,
	iconThemeNames,
	colors,
};
