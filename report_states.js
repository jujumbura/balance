var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;
var InputError = require('./errors').InputError;
var DataError = require('./errors').DataError;
var StateCommand = require('./state_command');


class ReportChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Reports';
		this.options = [
			{ label: 'restock' },
		];
		this.stateMap = {
			add: new ReportRestockState(),
    };
	}
}

class ReportRestockState extends baseStates.BaseState {
	constructor() {
		super();
    this.header = 'Reports-Restock';
		this.displayFields = ALL_FIELDS;
	}
	
	async run () {
		this.writeHeader(this.header);
	
    this.writeInfo('products to restock:');
    let productProxys = this.context.project.getAllProducts();
    let restockProxys = [];
    productProxys.forEach(proxy => {
      if (proxy.desiredCount !== null) {
        let itemCount = this.context.project.getItemCount(proxy.name);
        if (itemCount < proxy.desiredCount) {
          let restockProxy = {
            name: proxy.name,
            itemCount: itemCount,
            desiredCount: proxy.desiredCount,
          };
          restockProxys.push(restockProxy);
        }
      }
    });
		dialogHelper.listProxys(this.displayFields, restockProxys);

		return new StateCommand(StateCommand.Type.BACK);
	}
}

module.exports = {};
module.exports.ReportChooseActionState = ReportChooseActionState;
