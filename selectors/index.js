
const {
	map,
	prop,
	path,
	filter,
	indexBy,
	pickBy,
} = require('ramda');

const { createSelector } = require('reselect');

const { things } = require('../constants/pulse');

const storeKeyByType = map(prop('key'), indexBy(prop('type'), things));

const getPaiByTypeAndIndex = (type, index) => state => path([ storeKeyByType[type], index ], state.pulse.infos);

const getClientSinkInputs = client => state => pickBy(
	si => si.clientIndex === client.index,
	state.pulse.infos.sinkInputs,
);

const getModuleSinkInputs = module => state => pickBy(
	si => si.moduleIndex === module.index,
	state.pulse.infos.sinkInputs,
);

const getDerivedMonitorSources = createSelector(
	state => state.pulse.infos.sources,
	sources => map(source => ({
		index: source.index,
		type: 'monitorSource',
		sinkIndex: source.monitorSourceIndex,
		sourceIndex: source.index,
	}), filter(source => source.monitorSourceIndex >= 0, sources)),
);

module.exports = {
	getPaiByTypeAndIndex,
	getDerivedMonitorSources,
	getClientSinkInputs,
	getModuleSinkInputs,
};
