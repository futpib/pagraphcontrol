
const {
	map,
	toPairs,
	fromPairs,
} = require('ramda');

const separators = {
	'auth-ip-acl': ';',
};

const formatModuleArgs = object => map(([ k, v ]) => {
	v = [].concat(v);
	if (k in separators) {
		v = v.join(separators[k]);
	} else {
		v = v.join(',');
	}
	return `${k}=${v}`;
}, toPairs(object)).join(' ');

const parseModuleArgs = (args = '') => fromPairs(args.split(' ').map(arg => {
	const [ key, ...value ] = arg.split('=');
	// TODO: `separators`
	return [ key, value.join('=') ];
}));

module.exports = { formatModuleArgs, parseModuleArgs };
