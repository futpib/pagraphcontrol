
const PA_VOLUME_NORM = 0x10000;

const things = [ {
	method: 'getModules',
	type: 'module',
	key: 'modules',
}, {
	method: 'getCards',
	type: 'card',
	key: 'cards',
}, {
	method: 'getClients',
	type: 'client',
	key: 'clients',
}, {
	method: 'getSinks',
	type: 'sink',
	key: 'sinks',
}, {
	method: 'getSources',
	type: 'source',
	key: 'sources',
}, {
	method: 'getSinkInputs',
	type: 'sinkInput',
	key: 'sinkInputs',
}, {
	method: 'getSourceOutputs',
	type: 'sourceOutput',
	key: 'sourceOutputs',
} ];

const modules = {
	'module-alsa-sink': {
		confirmUnload: true,
	},
	'module-alsa-source': {
		confirmUnload: true,
	},
	'module-alsa-card': {
		confirmUnload: true,
	},
	'module-oss': {
		confirmUnload: true,
	},
	'module-solaris': {
		confirmUnload: true,
	},

	'module-cli': {
		confirmUnload: true,
	},
	'module-cli-protocol-unix': {
		confirmUnload: true,
	},
	'module-simple-protocol-unix': {
		confirmUnload: true,
	},
	'module-esound-protocol-unix': {
		confirmUnload: true,
	},
	'module-native-protocol-unix': {
		confirmUnload: true,
	},
};

module.exports = {
	PA_VOLUME_NORM,

	things,
	modules,
};
