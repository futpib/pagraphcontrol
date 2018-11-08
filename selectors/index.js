
const {
	map,
	prop,
	indexBy,
} = require('ramda');

const { things } = require('../constants/pulse');

const storeKeyByType = map(prop('key'), indexBy(prop('type'), things));

const getPaiByTypeAndIndex = (type, index) => state => state.pulse.infos[storeKeyByType[type]][index];

module.exports = {
	getPaiByTypeAndIndex,
};
