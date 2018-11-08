
const { app, BrowserWindow } = require('electron');

const theme = require('./utils/theme');

app.on('ready', () => {
	const win = new BrowserWindow({
		backgroundColor: theme.colors.themeBaseColor,
	});
	win.loadFile('index.html');
});
