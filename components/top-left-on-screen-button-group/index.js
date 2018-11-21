
const {
	map,
} = require('ramda');

const r = require('r-dom');

const { connect } = require('react-redux');

const Button = require('../button');

const TopLeftOnScreenButtonGroup = props => r.div({
	classSet: {
		panel: true,
		'top-left-on-screen-button-group': true,
	},
}, props.preferences.hideOnScreenButtons ? [] : [
	r(Button, {
		autoFocus: true,
		onClick: props.focusCards,
	}, 'Cards'),

	r(Button, {
		autoFocus: true,
		onClick: props.focusNetwork,
	}, 'Network'),
]);

module.exports = connect(
	state => ({
		preferences: state.preferences,
	}),
)(TopLeftOnScreenButtonGroup);
