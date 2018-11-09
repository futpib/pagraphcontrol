
const fs = require('fs');
const path = require('path');

const ini = require('ini');

const gtkIniPath = path.join(
	process.env.HOME,
	process.env.XDG_CONFIG_HOME || '.config',
	'gtk-3.0',
	'settings.ini',
);

let gtk;
try {
	gtk = ini.parse(fs.readFileSync(gtkIniPath, 'utf-8'));
} catch (error) {
	console.warn(error);
}

let themeName = 'Adwaita';
let iconThemeNames = [ 'Adwaita', 'hicolor' ];

if (gtk) {
	iconThemeNames = [
		gtk.Settings['gtk-icon-theme-name'],
		gtk.Settings['gtk-fallback-icon-theme'],
		'hicolor',
	];
	themeName = gtk.Settings['gtk-theme-name'];
}

const themePaths = [
	path.join(
		'/',
		'usr',
		'share',
		'themes',
	),
	path.join(
		process.env.HOME,
		process.env.XDG_CONFIG_HOME || '.themes',
	),
	path.join(
		process.env.HOME,
		'.local',
		'share',
		process.env.XDG_CONFIG_HOME || '.themes',
	),
];

let css = '';

for (const themePath of themePaths) {
	const themeNamePath = path.join(themePath, themeName);

	let dir;

	try {
		dir = fs.readdirSync(themeNamePath);
	} catch (error) {
		if (error.code === 'ENOENT') {
			continue;
		}
		throw error;
	}

	try {
		css = fs.readFileSync(path.join(themeNamePath, 'gtk-3.0', 'gtk.css'), 'utf8');
		break;
	} catch (error) {
		if (error.code === 'ENOENT') {
			continue;
		}
		throw error;
	}
}

module.exports = {
	iconThemeNames,
	css,
};
