var StateCommand = require('./state_command');
var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var baseStates = require('./base_states');
var productStates = require('./product_states');
//var groupStates = require('./group_states');
var logger = require('./logger');

class ChooseModeState extends baseStates.ChooseState {
	constructor() {
		super();
		this.message = 'Choose mode';
		this.options = [
			{ label: 'products', state: new productStates.ProductChooseActionState() },
			//{ label: 'groups', state: new groupStates.GroupChooseActionState() },
		];
	}
}

module.exports = {};
module.exports.ChooseModeState = ChooseModeState;
