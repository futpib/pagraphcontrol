
const {
	map,
	prop,
	path,
	filter,
	indexBy,
} = require('ramda');

const { createSelector } = require('reselect');

const { things } = require('../constants/pulse');

const storeKeyByType = map(prop('key'), indexBy(prop('type'), things));

const getPaiByTypeAndIndex = (type, index) => state => path([ storeKeyByType[type], index ], state.pulse.infos);

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
};
