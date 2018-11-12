
const { app, BrowserWindow } = require('electron');

const theme = require('./utils/theme');

app.on('ready', () => {
	const win = new BrowserWindow({
		backgroundColor: theme.colors.themeBaseColor,
	});
	win.setAutoHideMenuBar(true);
	win.setMenuBarVisibility(false);
	win.loadFile('index.html');

	if (process.env.NODE_ENV !== 'production') {
		const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

		installExtension(REACT_DEVELOPER_TOOLS)
			.then(name => console.log(`Added Extension:  ${name}`))
			.catch(error => console.error(error));
	}
});
