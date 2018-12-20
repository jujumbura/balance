var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;
var InputError = require('./errors').InputError;
var DataError = require('./errors').DataError;
var StateCommand = require('./state_command');

const RESTOCK_FIELDS = [
  { label: 'name',      usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'have',      usage: Usage.REQUIRED, type: Type.NUMBER, width: 10 },
  { label: 'desired',   usage: Usage.REQUIRED, type: Type.NUMBER, width: 10 },
  { label: 'need',      usage: Usage.REQUIRED, type: Type.NUMBER, width: 10 },
];

class ReportChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Reports';
		this.options = [
			{ label: 'restock' },
		];
		this.stateMap = {
		  restock: new ReportRestockState(),
    };
	}
}

class ReportRestockState extends baseStates.BaseState {
	constructor() {
		super();
    this.header = 'Reports-Restock';
		this.displayFields = RESTOCK_FIELDS;
	}
	
	async run () {
		this.writeHeader(this.header);
	
    this.writeInfo('products to restock:');
    let productProxys = this.context.project.getAllProducts();
    this.displayRestocks(productProxys);

    this.writeInfo('groups to restock:');
    let groupProxys = this.context.project.getAllGroups();
    this.displayRestocks(groupProxys);

		return new StateCommand(StateCommand.Type.BACK);
	}

  displayRestocks(proxys) {
    let restockProxys = [];
    proxys.forEach(proxy => {
      if (proxy.desiredCount !== null) {
        let itemCount = this.context.project.getItemCount(proxy.name);
        if (itemCount < proxy.desired) {
          let restockProxy = {
            name: proxy.name,
            have: itemCount,
            desired: proxy.desired,
            need: proxy.desired - itemCount,
          };
          restockProxys.push(restockProxy);
        }
      }
    });
		dialogHelper.listProxys(this.displayFields, restockProxys);
  }
}

module.exports = {};
module.exports.ReportChooseActionState = ReportChooseActionState;