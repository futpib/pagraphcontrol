
const electron = require('electron');

const React = require('react');

const r = require('r-dom');

const {
	WindowMenu: WindowMenuBase,
	MenuItem,
	Provider,
} = require('@futpib/react-electron-menu');

const MenuProvider = ({ children, ...props }) => r(Provider, { electron }, r(React.Fragment, {}, [
	r(WindowMenu, props),
	...[].concat(children),
]));

const WindowMenu = props => r(WindowMenuBase, [
	r(MenuItem, {
		label: 'File',
	}, [
		r(MenuItem, {
			label: 'Connect to server...',
			accelerator: 'CommandOrControl+N',
			onClick: props.openConnectToServerModal,
		}),

		r(MenuItem.Separator),

		r(MenuItem, {
			label: 'Quit',
			role: 'quit',
		}),
	]),

	r(MenuItem, {
		label: 'View',
	}, [
		r(MenuItem, {
			label: 'Cards',
			onClick: props.focusCards,
		}),
		r(MenuItem, {
			label: 'Network',
			onClick: props.focusNetwork,
		}),
		r(MenuItem, {
			label: 'Preferences',
			onClick: props.focusPreferences,
		}),

		r(MenuItem.Separator),

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
