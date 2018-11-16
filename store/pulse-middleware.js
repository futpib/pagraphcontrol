
const Bluebird = require('bluebird');

const PAClient = require('@futpib/paclient');

const { handleActions } = require('redux-actions');

const { pulse: pulseActions } = require('../actions');

const { things } = require('../constants/pulse');

const { getPaiByTypeAndIndex } = require('../selectors');

function getFnFromType(type) {
	let fn;
	switch (type) {
		case 'sink':
		case 'card':
		case 'source':
			fn = type;
			break;
		case 'sinkInput':
		case 'sourceOutput':
		case 'client':
		case 'module':
			fn = `${type}ByIndex`;
			break;
		default:
			throw new Error('Unexpected type: ' + type);
	}
	return 'get' + fn[0].toUpperCase() + fn.slice(1);
}

function setSinkChannelVolume(pa, store, index, channelIndex, volume, cb) {
	const pai = getPaiByTypeAndIndex('sink', index)(store.getState());
	pa.setSinkVolumes(index, pai.channelVolumes.map((v, i) => i === channelIndex ? volume : v), cb);
}
function setSourceChannelVolume(pa, store, index, channelIndex, volume, cb) {
	const pai = getPaiByTypeAndIndex('source', index)(store.getState());
	pa.setSourceVolumes(index, pai.channelVolumes.map((v, i) => i === channelIndex ? volume : v), cb);
}
function setSinkInputChannelVolume(pa, store, index, channelIndex, volume, cb) {
	const pai = getPaiByTypeAndIndex('sinkInput', index)(store.getState());
	pa.setSinkInputVolumesByIndex(index, pai.channelVolumes.map((v, i) => i === channelIndex ? volume : v), cb);
}
function setSourceOutputChannelVolume(pa, store, index, channelIndex, volume, cb) {
	const pai = getPaiByTypeAndIndex('sourceOutput', index)(store.getState());
	pa.setSourceOutputVolumesByIndex(index, pai.channelVolumes.map((v, i) => i === channelIndex ? volume : v), cb);
}

module.exports = store => {
	const pa = new PAClient();

	const getInfo = (type, index) => {
		let method;
		try {
			method = getFnFromType(type);
		} catch (error) {
			if (error.message.startsWith('Unexpected type:')) {
				console.warn(error);
				return;
			}
			throw error;
		}

		pa[method](index, (err, info) => {
			if (err) {
				if (err.message === 'No such entity') {
					console.warn(err.message, type, index);
					return;
				}
				throw err;
			}
			info.type = info.type || type;
			store.dispatch(pulseActions.info(info));
		});
	};

	pa
		.on('ready', () => {
			store.dispatch(pulseActions.ready());
			pa.subscribe('all');
			things.forEach(({ method, type }) => {
				pa[method]((err, infos) => {
					if (err) {
						throw err;
					}
					infos.forEach(info => {
						const { index } = info;
						info.type = info.type || type;
						store.dispatch(pulseActions.new({ type, index }));
						store.dispatch(pulseActions.info(info));
					});
				});
			});
		})
		.on('close', () => {
			store.dispatch(pulseActions.close());
			reconnect();
		})
		.on('new', (type, index) => {
			if (type === 'server') {
				pa.end(); // Reconnect
				return;
			}
			store.dispatch(pulseActions.new({ type, index }));
			getInfo(type, index);
		})
		.on('change', (type, index) => {
			if (type === 'server') {
				pa.end(); // Reconnect
				return;
			}
			store.dispatch(pulseActions.change({ type, index }));
			getInfo(type, index);
		})
		.on('remove', (type, index) => {
			store.dispatch(pulseActions.remove({ type, index }));
		})
		.on('error', error => {
			console.error(error);
		});

	const reconnect = () => new Bluebird((resolve, reject) => {
		pa.once('ready', resolve);
		pa.once('error', reject);
		pa.connect();
	}).catch(error => {
		if (error.message === 'Unable to connect to PulseAudio server') {
			return Bluebird.delay(5000).then(reconnect);
		}
		throw error;
	});

	reconnect();

	const rethrow = error => {
		if (error) {
			throw error;
		}
	};

	const handlePulseActions = handleActions({
		[pulseActions.moveSinkInput]: (state, { payload: { sinkInputIndex, destSinkIndex } }) => {
			pa.moveSinkInput(sinkInputIndex, destSinkIndex, rethrow);
			return state;
		},
		[pulseActions.moveSourceOutput]: (state, { payload: { sourceOutputIndex, destSourceIndex } }) => {
			pa.moveSourceOutput(sourceOutputIndex, destSourceIndex, rethrow);
			return state;
		},

		[pulseActions.killClientByIndex]: (state, { payload: { clientIndex } }) => {
			pa.killClientByIndex(clientIndex, rethrow);
			return state;
		},

		[pulseActions.killSinkInputByIndex]: (state, { payload: { sinkInputIndex } }) => {
			pa.killSinkInputByIndex(sinkInputIndex, rethrow);
			return state;
		},
		[pulseActions.killSourceOutputByIndex]: (state, { payload: { sourceOutputIndex } }) => {
			pa.killSourceOutputByIndex(sourceOutputIndex, rethrow);
			return state;
		},

		[pulseActions.unloadModuleByIndex]: (state, { payload: { moduleIndex } }) => {
			pa.unloadModuleByIndex(moduleIndex, rethrow);
			return state;
		},

		[pulseActions.setSinkVolumes]: (state, { payload: { index, channelVolumes } }) => {
			pa.setSinkVolumes(index, channelVolumes, rethrow);
			return state;
		},
		[pulseActions.setSourceVolumes]: (state, { payload: { index, channelVolumes } }) => {
			pa.setSourceVolumes(index, channelVolumes, rethrow);
			return state;
		},
		[pulseActions.setSinkInputVolumes]: (state, { payload: { index, channelVolumes } }) => {
			pa.setSinkInputVolumesByIndex(index, channelVolumes, rethrow);
			return state;
		},
		[pulseActions.setSourceOutputVolumes]: (state, { payload: { index, channelVolumes } }) => {
			pa.setSourceOutputVolumesByIndex(index, channelVolumes, rethrow);
			return state;
		},

		[pulseActions.setSinkChannelVolume]: (state, { payload: { index, channelIndex, volume } }) => {
			return setSinkChannelVolume(pa, store, index, channelIndex, volume, rethrow);
		},
		[pulseActions.setSourceChannelVolume]: (state, { payload: { index, channelIndex, volume } }) => {
			return setSourceChannelVolume(pa, store, index, channelIndex, volume, rethrow);
		},
		[pulseActions.setSinkInputChannelVolume]: (state, { payload: { index, channelIndex, volume } }) => {
			return setSinkInputChannelVolume(pa, store, index, channelIndex, volume, rethrow);
		},
		[pulseActions.setSourceOutputChannelVolume]: (state, { payload: { index, channelIndex, volume } }) => {
			return setSourceOutputChannelVolume(pa, store, index, channelIndex, volume, rethrow);
		},

		[pulseActions.setCardProfile]: (state, { payload: { index, profileName } }) => {
			pa.setCardProfile(index, profileName, rethrow);
			return state;
		},
	}, null);

	return next => action => {
		const ret = next(action);

		handlePulseActions(null, action);

		return ret;
	};
};
