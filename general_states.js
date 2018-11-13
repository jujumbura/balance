var io = require('./console_io');
var logger = require('./logger');
var BaseState = require('./base_state');
var productStates = require('./product_states');
var groupStates = require('./group_states');

class SelectModeState extends BaseState {
	getMessage() {
		return 'Select mode: ( products, groups )';
	}
	
	handleInput(values) {
		let nextState = null;
		switch(values[0]) {
			case 'products':
			case 'p':
				nextState = new productStates.ProductSelectActionState();
				break;
			case 'groups':
			case 'g':
				nextState = new groupStates.GroupSelectActionState();
				break;
			default:
				io.writeMessage('Unknown mode');
				nextState = new SelectModeState();
				break;
		}
		return nextState;
	}
}

module.exports = {};
module.exports.SelectModeState = SelectModeState;
