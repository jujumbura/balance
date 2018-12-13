var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;

const ALL_FIELDS = [
  { label: 'product',   usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'location',  usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'quantity',  usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'size',      usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'remain',    usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'acquired',  usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
  { label: 'disposed',  usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
];

const FILTER_FIELDS = [
  { label: 'product',   usage: Usage.OPTIONAL, type: Type.STRING },
  { label: 'location',  usage: Usage.OPTIONAL, type: Type.STRING },
  { label: 'disposed',  usage: Usage.OPTIONAL, type: Type.BOOL },
];

class ItemChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Items';
		this.options = [
			{ label: 'add' },
			{ label: 'edit' },
			{ label: 'remove' },
			{ label: 'list' },
		];
		this.stateMap = {
			add: new ItemAddState(),
			edit: new ItemEditState(),
			remove: new ItemRemoveState(),
			list: new ItemListState(),
    };
	}
}

class ItemAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Items-Add';
		this.addFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

  formProxy(attrMap) {
		let proxy = {
			product: attrMap.product,
			location: attrMap.location,
			quantity: attrMap.quantity,
			size: attrMap.size,
      remain: attrMap.remain,
			acquired: attrMap.acquired,
      disposed: attrMap.disposed,
		};
    if (isNaN(proxy.quantity)) { proxy.quantity = 1 }
    if (isNaN(proxy.size)) { proxy.size = 1 }
    if (isNaN(proxy.remain)) { proxy.remain = proxy.quantity; }
    if (!proxy.acquired) { proxy.acquired = new Date(); }
    return proxy;
  }

	handleAdd(proxy) {
		this.context.project.addItem(proxy);
		this.context.dirty = true;
	}
}

class ItemEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Items-Edit';
		this.filterFields = FILTER_FIELDS;
    this.modifyFields = ALL_FIELDS;
    this.displayFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterItems(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}

  formProxy(proxy, attrMap) {
    let newProxy = Object.assign({}, proxy);
    if (attrMap.product) { newProxy.product = attrMap.product; }
    if (attrMap.location) { newProxy.location = attrMap.location; }
    if (!isNaN(attrMap.quantity)) { newProxy.quantity = attrMap.quantity; }
    if (!isNaN(attrMap.size)) { newProxy.size = attrMap.size; }
    if (!isNaN(attrMap.remain)) { newProxy.remain = attrMap.remain; }
    if (attrMap.acquired) { newProxy.acquired = attrMap.acquired; }
    if (attrMap.disposed) { newProxy.disposed = attrMap.disposed; }
    return newProxy;
  }

	handleModify(proxy) {
		this.context.project.updateItem(proxy);
		this.context.dirty = true;
	}
}

class ItemRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Items-Remove';
		this.filterFields = FILTER_FIELDS;
    this.displayFields = ALL_FIELDS;
    this.removeFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterItems(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}

	handleRemove(proxy) {
		this.context.project.removeItem(proxy.id);
		this.context.dirty = true;
	}
}

class ItemListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Items-List';
		this.filterFields = FILTER_FIELDS;
		this.displayFields = ALL_FIELDS;
	}
	
	filterProxys(attrMap) {
		let proxys = this.context.project.filterItems(attrMap.product, 
        attrMap.location, attrMap.disposed);
		return proxys;
	}
}

module.exports = {};
module.exports.ItemChooseActionState = ItemChooseActionState;
module.exports.ALL_FIELDS = ALL_FIELDS;
