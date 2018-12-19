var StateCommand = require('./state_command');
var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var baseStates = require('./base_states');
var groupStates = require('./group_states');
var productStates = require('./product_states');
var locationStates = require('./location_states');
var itemStates = require('./item_states');
var vendorStates = require('./vendor_states');
var transactionStates = require('./transaction_states');
var reportStates = require('./report_states');
var logger = require('./logger');

class ChooseModeState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Main';
		this.options = [
			{ label: 'groups' },
			{ label: 'products' },
      { label: 'locations' },
      { label: 'items' },
      { label: 'vendors' },
      { label: 'transactions' },
      { label: 'reports' },
		];
    this.stateMap = {
		  groups: new groupStates.GroupChooseActionState(),
			products: new productStates.ProductChooseActionState(),
			locations: new locationStates.LocationChooseActionState(),
      items: new itemStates.ItemChooseActionState(),
      vendors: new vendorStates.VendorChooseActionState(),
      transactions: new transactionStates.TransactionChooseActionState(),
      reports: new reportStates.ReportChooseActionState(), 
    };
	}
}

module.exports = {};
module.exports.ChooseModeState = ChooseModeState;
