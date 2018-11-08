
const { createActions: createActionCreators } = require('redux-actions');

// const { getIconPath } = require('../modules/get-gtk-icon');
const getIconPath = () => {
	throw new Error('stub');
};

const fallbacks = new Map(Object.entries({
	'audio-card-pci': 'audio-card',
	'audio-card-usb': 'audio-card',
}));

const getIconPathFallback = async (icon, size) => {
	try {
		return await getIconPath(icon, size);
	} catch (error) {
		if (error.message === 'No icon found') {
			if (fallbacks.has(icon)) {
				return getIconPathFallback(fallbacks.get(icon), size);
			}
		}
		throw error;
	}
};

module.exports = createActionCreators({
	ICONS: {
		GET_ICON_PATH: [
			(icon, size) => getIconPathFallback(icon, size),
			icon => icon,
		],
	},
});
