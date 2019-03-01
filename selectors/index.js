
const {
	map,
	prop,
	path,
	filter,
	find,
	indexBy,
	pickBy,
	propEq,
	values,
} = require('ramda');

const { createSelector } = require('reselect');

const { things } = require('../constants/pulse');

const { primaryPulseServer } = require('../reducers/pulse');

const storeKeyByType = map(prop('key'), indexBy(prop('type'), things));

const getPaiByTypeAndIndex = (type, index, pulseServerId = primaryPulseServer) =>
	state => path([ pulseServerId, 'infos', storeKeyByType[type], index ], state.pulse);

const getPaiByTypeAndIndexFromInfos = (type, index) => infos => path([ storeKeyByType[type], index ], infos);
const getPaiByDgoFromInfos = ({ type, index }) => infos => path([ storeKeyByType[type], index ], infos);

const getClientSinkInputs = (client, pulseServerId = primaryPulseServer) => state => pickBy(
	si => si.clientIndex === client.index,
	state.pulse[pulseServerId].infos.sinkInputs,
);

const getModuleSinkInputs = (module, pulseServerId = primaryPulseServer) => state => pickBy(
	si => si.moduleIndex === module.index,
	state.pulse[pulseServerId].infos.sinkInputs,
);

const getClientSourceOutputs = (client, pulseServerId = primaryPulseServer) => state => pickBy(
	so => so.clientIndex === client.index,
	state.pulse[pulseServerId].infos.sourceOutputs,
);

const getModuleSourceOutputs = (module, pulseServerId = primaryPulseServer) => state => pickBy(
	so => so.moduleIndex === module.index,
	state.pulse[pulseServerId].infos.sourceOutputs,
);

const getSinkSinkInputs = (sink, pulseServerId = primaryPulseServer) => state => pickBy(
	si => si.sinkIndex === sink.index,
	state.pulse[pulseServerId].infos.sinkInputs,
);

const getDerivedMonitorSources = createSelector(
	state => state.pulse[primaryPulseServer].infos.sources,
	sources => map(source => ({
		index: source.index,
		type: 'monitorSource',
		sinkIndex: source.monitorSourceIndex,
		sourceIndex: source.index,
	}), filter(source => source.monitorSourceIndex >= 0, sources)),
);

const getDefaultSourcePai = createSelector(
	state => state.pulse[primaryPulseServer].infos.sources,
	state => state.pulse[primaryPulseServer].serverInfo.defaultSourceName,
	(sources, defaultSourceName) => find(propEq('name', defaultSourceName), values(sources)),
);

const getDefaultSinkPai = createSelector(
	state => state.pulse[primaryPulseServer].infos.sinks,
	state => state.pulse[primaryPulseServer].serverInfo.defaultSinkName,
	(sinks, defaultSinkName) => find(propEq('name', defaultSinkName), values(sinks)),
);

const createGetCardSinks = cardIndex => createSelector(
	state => state.pulse[primaryPulseServer].infos.sinks,
	sinks => filter(propEq('cardIndex', cardIndex), sinks),
);

const createGetCardSources = cardIndex => createSelector(
	state => state.pulse[primaryPulseServer].infos.sources,
	sources => filter(propEq('cardIndex', cardIndex), sources),
);

module.exports = {
	getPaiByTypeAndIndex,
	getPaiByTypeAndIndexFromInfos,
	getPaiByDgoFromInfos,

	getDerivedMonitorSources,

	getClientSinkInputs,
	getModuleSinkInputs,

	getClientSourceOutputs,
	getModuleSourceOutputs,

	getSinkSinkInputs,

	getDefaultSinkPai,
	getDefaultSourcePai,

	createGetCardSinks,
	createGetCardSources,
};
