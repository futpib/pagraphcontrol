
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

module.exports = {
	PA_VOLUME_NORM,

	things,
};
