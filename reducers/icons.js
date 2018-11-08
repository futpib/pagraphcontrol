
const {
	merge,
} = require('ramda');

const { handleActions } = require('redux-actions');

const { icons } = require('../actions');

const initialState = {};

const reducer = handleActions({
	[icons.getIconPath + '_FULFILLED']: (state, { payload, meta }) => merge(state, { [meta]: payload }),
}, initialState);

module.exports = {
	initialState,
	reducer,
};
