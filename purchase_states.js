var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var logger = require('./logger');
var baseStates = require('./base_states');
var itemStates = require('./item_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;
var InputError = require('./errors').InputError;
var DataError = require('./errors').DataError;
var StateCommand = require('./state_command');

const ALL_FIELDS = [
  { label: 'product',   usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'price',     usage: Usage.REQUIRED, type: Type.MONEY,  width: 10 },
  { label: 'quantity',  usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'size',      usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
];

const FILTER_FIELDS = [
  { label: 'product',   usage: Usage.OPTIONAL, type: Type.STRING },
];

const CONVERT_FIELDS = [
  { label: 'location',  usage: Usage.REQUIRED, type: Type.STRING },
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
      { label: 'convert' },
		];
		this.stateMap = {
			add: new PurchaseAddState(),
			edit: new PurchaseEditState(),
			remove: new PurchaseRemoveState(),
			list: new PurchaseListState(),
      convert: new PurchaseConvertItemState(),
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
    let proxy = {
      transactionId: this.context.targetId,
      product: attrMap.product,
      price: attrMap.price,
			quantity: attrMap.quantity,
      size: attrMap.size,
		};
    if (isNaN(proxy.quantity)) { proxy.quantity = 1 }
    if (isNaN(proxy.size)) { proxy.size = 1; }
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
		let proxys = this.context.project.filterPurchases(this.context.targetId, 
        attrMap.product);
		return proxys;
	}

  formProxy(proxy, attrMap) {
    let newProxy = Object.assign({}, proxy);
    if (attrMap.product) { newProxy.product = attrMap.product; }
    if (!isNaN(attrMap.price)) { newProxy.price = attrMap.price; }
    if (!isNaN(attrMap.quantity)) { newProxy.quantity = attrMap.quantity; }
    if (!isNaN(attrMap.size)) { newProxy.size = attrMap.size; }
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
		let proxys = this.context.project.filterPurchases(this.context.targetId, 
        attrMap.product);
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
		let proxys = this.context.project.filterPurchases(this.context.targetId, 
        attrMap.product);
		return proxys;
	}
}

class PurchaseConvertItemState extends baseStates.BaseState {
	constructor() {
		super();
    this.header = 'Purchases-Convert-Items';
    this.convertFields = CONVERT_FIELDS;
		this.fromFields = ALL_FIELDS;
		this.toFields = itemStates.ALL_FIELDS;
	}
	
	async run () {
		this.writeHeader(this.header);
	
    let proxys = this.getProxys();
    this.writeInfo('converting ' + proxys.length + ' entries');
    for (let i = 0; i < proxys.length; ++i) {
      let proxy = proxys[i];
      try {
		    dialogHelper.printProxy('- from', this.fromFields, proxy);
        dialogHelper.printFields('? convert', this.convertFields);
        let attrMap = await dialogHelper.submitFields(this.convertFields);
		    let convertedProxy = this.convertProxy(proxy, attrMap);
        dialogHelper.printProxy('- to', this.toFields, convertedProxy);
        if (!await this.checkConfirm()) { continue; }
        this.handleConvert(proxy, convertedProxy);
      } catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
      }
    }

		return new StateCommand(StateCommand.Type.BACK);
	}

  getProxys() {
    let proxys = this.context.project.getAllPurchases(this.context.targetId);
    let convertProxys = [];
    proxys.forEach(proxy => {
      if (!proxy.itemId) {
        convertProxys.push(proxy);
      }
    });
    return convertProxys;
  }

  convertProxy(proxy, attrMap) {
    let transactionProxy = this.context.project.findTransaction(this.context.targetId);
    let convertedProxy = {
			product: proxy.product,
			location: attrMap.location,
			quantity: proxy.quantity,
      size: proxy.size,
			remain: proxy.quantity,
			acquired: transactionProxy.entered,
		};
    return convertedProxy;
  }
	
  handleConvert(proxy, convertedProxy) {
		this.context.project.convertPurchaseToItem(proxy, convertedProxy);
		this.context.dirty = true;
	}
}

module.exports = {};
module.exports.PurchaseChooseActionState = PurchaseChooseActionState;
