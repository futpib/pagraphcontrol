
const { app, BrowserWindow } = require('electron');

const theme = require('./utils/theme');

app.on('ready', () => {
	const win = new BrowserWindow({
		backgroundColor: theme.colors.themeBaseColor,
	});
	win.setAutoHideMenuBar(true);
	win.setMenuBarVisibility(false);
	win.loadFile('index.html');
});
