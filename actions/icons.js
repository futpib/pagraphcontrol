
const { createActions: createActionCreators } = require('redux-actions');

const freedesktopIcons = require('freedesktop-icons');

const { iconThemeNames } = require('../utils/theme');

const fallbacks = new Map(Object.entries({
	'audio-card-pci': 'audio-card',
	'audio-card-usb': 'audio-card',
}));

const cache = new Map();

const getIconWithFallback = async name => {
	if (cache.has(name)) {
		return cache.get(name);
	}

	let res = await freedesktopIcons({
		name,
		type: 'scalable',
	}, iconThemeNames);

	if (!res) {
		res = await freedesktopIcons({
			name,
			size: 128,
		}, iconThemeNames);
	}

	if (!res && fallbacks.has(name)) {
		return getIconWithFallback(fallbacks.get(name));
	}

	cache.set(name, res);

	return res;
};

module.exports = createActionCreators({
	ICONS: {
		GET_ICON_PATH: [
			icon => getIconWithFallback(icon),
			icon => icon,
		],
	},
});
