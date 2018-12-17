var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var purchaseStates = require('./purchase_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;

const ALL_FIELDS = [
  { label: 'vendor',   usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'entered',  usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
];

const FILTER_FIELDS = [
  { label: 'vendor',   usage: Usage.OPTIONAL, type: Type.STRING },
];

class TransactionChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Transactions';
		this.options = [
			{ label: 'add' },
			{ label: 'edit' },
			{ label: 'remove' },
			{ label: 'list' },
      { label: 'purchases' },
		];
		this.stateMap = {
			add: new TransactionAddState(),
			edit: new TransactionEditState(),
			remove: new TransactionRemoveState(),
			list: new TransactionListState(),
      purchases: new TransactionPurchaseTargetState(),
    };
	}
}

class TransactionAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Transactions-Add';
		this.addFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

  formProxy(attrMap) {
		let proxy = {
			vendor: attrMap.vendor,
			entered: attrMap.entered,
		};
    if (!proxy.entered) { proxy.entered = new Date(); }
    return proxy;
  }

	handleAdd(proxy) {
		this.context.project.addTransaction(proxy);
		this.context.dirty = true;
	}
}

class TransactionEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Transactions-Edit';
		this.filterFields = FILTER_FIELDS;
    this.modifyFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterTransactions(attrMap.vendor);
		return proxys;
	}

  formProxy(proxy, attrMap, skipMap) {
    let newProxy = Object.assign({}, proxy);
    if (!skipMap.vendor) { newProxy.vendor = attrMap.vendor; }
    if (!skipMap.entered) { newProxy.entered = attrMap.entered; }
    return newProxy;
  }

	handleModify(proxy) {
		this.context.project.updateTransaction(proxy);
		this.context.dirty = true;
	}
}

class TransactionRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Transactions-Remove';
		this.filterFields = FILTER_FIELDS;
    this.displayFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterTransactions(attrMap.vendor);
		return proxys;
	}

	handleRemove(proxy) {
		this.context.project.removeTransaction(proxy.id);
		this.context.dirty = true;
	}
}

class TransactionListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Transactions-List';
		this.filterFields = FILTER_FIELDS;
		this.displayFields = ALL_FIELDS;
	}
	
	filterProxys(attrMap) {
		let proxys = this.context.project.filterTransactions(attrMap.vendor);
		return proxys;
	}
}

class TransactionPurchaseTargetState extends baseStates.TargetState {
	constructor() {
		super();
		this.header = 'Transactions-Purchases-Target';
		this.filterFields = FILTER_FIELDS;
    this.displayFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
    this.nextState = new purchaseStates.PurchaseChooseActionState(); 
    this.nextName = 'purchases';
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterTransactions(attrMap.vendor);
		return proxys;
	}

	handleSelect(proxy) {
		this.context.targetId = proxy.id;
	}
}

module.exports = {};
module.exports.TransactionChooseActionState = TransactionChooseActionState;
