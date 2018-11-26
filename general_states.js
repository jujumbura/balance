var StateCommand = require('./state_command');
var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var baseStates = require('./base_states');
var groupStates = require('./group_states');
var productStates = require('./product_states');
var itemStates = require('./item_states');
var logger = require('./logger');

class ChooseModeState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Main';
		this.options = [
			{ label: 'groups', state: new groupStates.GroupChooseActionState() },
			{ label: 'products', state: new productStates.ProductChooseActionState() },
			{ label: 'items', state: new itemStates.ItemChooseActionState() },
		];
	}
}

module.exports = {};
module.exports.ChooseModeState = ChooseModeState;
