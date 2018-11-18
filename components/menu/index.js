
const electron = require('electron');

const React = require('react');

const r = require('r-dom');

const {
	WindowMenu: WindowMenuBase,
	MenuItem,
	Provider,
} = require('@futpib/react-electron-menu');

const MenuProvider = ({ children }) => r(Provider, { electron }, r(React.Fragment, {}, [
	r(WindowMenu),
	...[].concat(children),
]));

const WindowMenu = () => r(WindowMenuBase, [
	r(MenuItem, {
		label: 'App',
	}, [
		r(MenuItem, {
			label: 'Quit',
			role: 'quit',
		}),
	]),

	r(MenuItem, {
		label: 'View',
	}, [
		r(MenuItem, {
			label: 'Reload',
			role: 'reload',
		}),
		r(MenuItem, {
			label: 'Force Reload',
			role: 'forcereload',
		}),
		r(MenuItem, {
			label: 'Toggle Developer Tools',
			role: 'toggledevtools',
		}),

		r(MenuItem.Separator),

		r(MenuItem, {
			label: 'Toggle Full Screen',
			role: 'togglefullscreen',
		}),
	]),

	r(MenuItem, {
		label: 'Help',
	}, [
		r(MenuItem, {
			label: 'Documentation',
			onClick: () => electron.shell.openExternal('https://github.com/futpib/pagraphcontrol#readme'),
		}),
	]),
]);

module.exports = { MenuProvider };
