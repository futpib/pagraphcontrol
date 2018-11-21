
const {
	map,
	toPairs,
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

module.exports = { formatModuleArgs };
