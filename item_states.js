var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;

const ALL_FIELDS = [
  { label: 'product',   usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
  { label: 'quantity',  usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'remain',    usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
  { label: 'acquired',  usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
  { label: 'discarded', usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
];

const FILTER_FIELDS = [
  { label: 'product',   usage: Usage.OPTIONAL, type: Type.STRING },
];

class ItemChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Items';
		this.options = [
			{ label: 'add', state: new ItemAddState() },
			{ label: 'edit', state: new ItemEditState() },
	//		{ label: 'remove', state: new ItemRemoveState() },
			{ label: 'list', state: new ItemListState() },
		];
	}
}

class ItemAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Items-Add';
		this.fields = ALL_FIELDS;
	}

	handleAdd(attrMap) {
		let proxy = {
			product: attrMap.product,
			quantity: attrMap.quantity,
			remain: attrMap.remain,
			acquired: attrMap.acquired,
      discarded: attrMap.discarded,
		};
    if (!proxy.quantity) { proxy.quantity = 1 }
    if (!proxy.remain) { proxy.remain = proxy.quantity; }
    if (!proxy.acquired) { proxy.acquired = new Date(); }
		this.context.project.addItem(proxy);
		this.context.dirty = true;
	}
}

class ItemEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Items-Edit';
		this.filterFields = FILTER_FIELDS;
    this.listFields = ALL_FIELDS;
    this.modifyFields = ALL_FIELDS;
	}

	filterProxys(attrMap) {
		let proxys = this.context.project.filterItems(attrMap.product);
		return proxys;
	}

	handleModify(proxy, attrMap) {
    if (attrMap.product) { proxy.product = attrMap.product; }
    if (!isNaN(attrMap.quantity)) { proxy.quantity = attrMap.quantity; }
    if (!isNaN(attrMap.remain)) { proxy.remain = attrMap.remain; }
    if (attrMap.acquired) { proxy.acquired = attrMap.acquired; }
    if (attrMap.discarded) { proxy.discarded = attrMap.discarded; }
		this.context.project.updateItem(proxy.id, proxy);
		this.context.dirty = true;
	}
}
/*
class ItemRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Items-Remove';
	}

	findProxy(value) {
		let desc = this.context.project.findItem(value);
		return desc;
	}

	handleRemove(proxy) {
		this.context.project.removeItem(proxy.id);
		this.context.dirty = true;
	}
}
*/
class ItemListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Items-List';
		this.filterFields = FILTER_FIELDS;
		this.listFields = ALL_FIELDS;
	}
	
	produceProxys(attrMap) {
		let itemProxys = this.context.project.filterItems(attrMap.product);
		return itemProxys;
	}
}

module.exports = {};
module.exports.ItemChooseActionState = ItemChooseActionState;
