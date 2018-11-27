var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;

class ItemChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Items';
		this.options = [
			{ label: 'add', state: new ItemAddState() },
	//		{ label: 'edit', state: new ItemEditState() },
	//		{ label: 'remove', state: new ItemRemoveState() },
			{ label: 'list', state: new ItemListState() },
		];
	}
}

class ItemAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Items-Add';
		this.fields = [
      { label: 'product', usage: Usage.REQUIRED },
      { label: 'quantity', usage: Usage.OPTIONAL, type: Type.NUMBER },
      { label: 'remain', usage: Usage.OPTIONAL, type: Type.NUMBER },
      { label: 'acquired', usage: Usage.OPTIONAL, type: Type.DATE },
    ];
	}

	handleAdd(attrMap) {
		let params = {
			product: attrMap['product'],
			quantity: attrMap['quantity'],
			remain: attrMap['remain'],
			acquired: attrMap['acquired'],
		};
    if (!params.quantity) { params.quantity = 1 }
    if (!params.remain) { params.remain = params.quantity; }
    if (!params.acquired) { params.acquired = new Date(); }
		this.context.project.addItem(params);
		this.context.dirty = true;
	}
}
/*
class ItemEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Items-Edit';
		this.fields = FIELDS;
	}

	findObj(value) {
		let desc = this.context.project.findItem(value);
		return desc;
	}

	handleModify(obj, attrMap) {
		let params = {
			name: attrMap['name'],
			groups: attrMap['groups'],
		};
		this.context.project.updateItem(obj.id, params);
		this.context.dirty = true;
	}
}

class ItemRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Items-Remove';
	}

	findObj(value) {
		let desc = this.context.project.findItem(value);
		return desc;
	}

	handleRemove(obj) {
		this.context.project.removeItem(obj.id);
		this.context.dirty = true;
	}
}
*/
class ItemListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Items-List';
    this.filterFields = [
      { label: 'product',   usage: Usage.OPTIONAL },
    ];
		this.listFields = [
      { label: 'product',   usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
      { label: 'quantity',  usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
      { label: 'remain',    usage: Usage.OPTIONAL, type: Type.NUMBER, width: 10 },
      { label: 'acquired',  usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
      { label: 'discarded', usage: Usage.OPTIONAL, type: Type.DATE,   width: 20 },
    ];
	}
	
	produceObjs(attrMap) {
		let itemDescs = this.context.project.filterItems(attrMap['product']);
		return itemDescs;
	}
}

module.exports = {};
module.exports.ItemChooseActionState = ItemChooseActionState;
