
const {
	GraphView: GraphViewBase,
} = require('react-digraph');

class GraphView extends GraphViewBase {
	constructor(props) {
		super(props);

		Object.assign(this, {
			_super_handleNodeMove: this.handleNodeMove,
			handleNodeMove: this.constructor.prototype.handleNodeMove.bind(this),
		});
	}

	handleNodeMove(position, nodeId, shiftKey) {
		this._super_handleNodeMove(position, nodeId, shiftKey);
		if (this.props.onNodeMove) {
			this.props.onNodeMove(position, nodeId, shiftKey);
		}
	}
}

module.exports = { GraphView };
