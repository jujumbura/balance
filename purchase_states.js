var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;

const ALL_FIELDS = [
  { label: 'product',   usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'quantity',  usage: Usage.REQUIRED, type: Type.NUMBER, width: 10 },
  { label: 'price',     usage: Usage.REQUIRED, type: Type.NUMBER, width: 10 },
];

const FILTER_FIELDS = [
  { label: 'product',   usage: Usage.OPTIONAL, type: Type.STRING },
];

class PurchaseChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Purchases';
		this.options = [
			{ label: 'add' },
			{ label: 'edit' },
			{ label: 'remove' },
			{ label: 'list' },
		];
		this.stateMap = {
			add: new PurchaseAddState(),
			edit: new PurchaseEditState(),
			remove: new PurchaseRemoveState(),
			list: new PurchaseListState(),
    };
	}
}

class PurchaseAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Purchases-Add';
		this.addFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

  formProxy(attrMap) {
		console.log(this.context.targetId);
    let proxy = {
      transactionId: this.context.targetId,
      product: attrMap.product,
			quantity: attrMap.quantity,
      price: attrMap.price,
		};
    return proxy;
  }

	handleAdd(proxy) {
		this.context.project.addPurchase(proxy);
		this.context.dirty = true;
	}
}

class PurchaseEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Purchases-Edit';
		this.filterFields = FILTER_FIELDS;
    this.modifyFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterPurchases(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}

  formProxy(proxy, attrMap) {
    let newProxy = Object.assign({}, proxy);
    if (attrMap.product) { newProxy.product = attrMap.product; }
    if (!isNaN(attrMap.quantity)) { newProxy.quantity = attrMap.quantity; }
    if (!isNaN(attrMap.price)) { newProxy.price = attrMap.price; }
    return newProxy;
  }

	handleModify(proxy) {
		this.context.project.updatePurchase(proxy);
		this.context.dirty = true;
	}
}

class PurchaseRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Purchases-Remove';
		this.filterFields = FILTER_FIELDS;
    this.displayFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
    // FIX!!
		let proxys = this.context.project.filterPurchases(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}

	handleRemove(proxy) {
		this.context.project.removePurchase(proxy.id);
		this.context.dirty = true;
	}
}

class PurchaseListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Purchases-List';
		this.filterFields = FILTER_FIELDS;
		this.displayFields = ALL_FIELDS;
	}
	
	filterProxys(attrMap) {
		let proxys = this.context.project.filterPurchases(this.context.targetId, attrMap.product);
		return proxys;
	}
}

module.exports = {};
module.exports.PurchaseChooseActionState = PurchaseChooseActionState;
