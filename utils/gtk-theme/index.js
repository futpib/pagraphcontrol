
const fs = require('fs');
const path = require('path');

const ini = require('ini');

const gtkIniPaths = [];

gtkIniPaths.push('/etc/gtk-3.0/settings.ini');

if (process.env.XDG_CONFIG_DIRS) {
	gtkIniPaths.push(...process.env.XDG_CONFIG_DIRS.split(':')
		.map(dir => path.join(dir, 'gtk-3.0', 'settings.ini')));
}

gtkIniPaths.push(path.join(
	process.env.HOME,
	process.env.XDG_CONFIG_HOME || '.config',
	'gtk-3.0',
	'settings.ini',
));

const gtkInis = [];
try {
	gtkIniPaths.forEach(path => {
		const gtk = ini.parse(fs.readFileSync(path, 'utf-8'));
		gtkInis.push(gtk);
	});
} catch (error) {
	if (error.code !== 'ENOENT') {
		console.warn(error);
	}
}

let themeName = 'Adwaita';
const iconThemeNames = [ 'Adwaita', 'hicolor' ];

gtkInis.forEach(gtk => {
	if (gtk && gtk.Settings) {
		if (gtk.Settings['gtk-icon-theme-name']) {
			iconThemeNames[0] = gtk.Settings['gtk-icon-theme-name'];
		}

		if (gtk.Settings['gtk-fallback-icon-theme']) {
			iconThemeNames[1] = gtk.Settings['gtk-fallback-icon-theme'];
		}

		if (gtk.Settings['gtk-theme-name']) {
			themeName = gtk.Settings['gtk-theme-name'];
		}
	}
});

const themePaths = [
	path.join(
		'/',
		'usr',
		'share',
		'themes',
	),
	path.join(
		process.env.HOME,
		'.themes',
	),
	path.join(
		process.env.HOME,
		'.local',
		'share',
		'themes',
	),
];

let css = '';

for (const themePath of themePaths) {
	const themeNamePath = path.join(themePath, themeName);

	try {
		fs.readdirSync(themeNamePath);
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
