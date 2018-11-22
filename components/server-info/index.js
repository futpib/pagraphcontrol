
const os = require('os');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');

const { primaryPulseServer } = require('../../reducers/pulse');

const localHostname = os.hostname();
const { username: localUsername } = os.userInfo();

class ServerInfo extends React.Component {
	render() {
		const { username, hostname } = this.props.serverInfo;

		const server = `${username}@${hostname}`;
		const local = `${localUsername}@${localHostname}`;

		return r.div({
			className: 'server-info',
		}, [
			hostname && (server !== local) && r.span(server),
		]);
	}
}

module.exports = connect(
	state => ({
		serverInfo: state.pulse[primaryPulseServer].serverInfo,
	}),
)(ServerInfo);
