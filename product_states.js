var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;

class ProductChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Products';
		this.options = [
			{ label: 'add',     state: new ProductAddState() },
			{ label: 'edit',    state: new ProductEditState() },
			{ label: 'remove',  state: new ProductRemoveState() },
			{ label: 'list',    state: new ProductListState() },
		];
	}
}

class ProductAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Products-Add';
		this.fields = [
      { label: 'name',    usage: Usage.REQUIRED },
      { label: 'groups',  usage: Usage.MULTIPLE },
    ];
	}

	handleAdd(attrMap) {
		let proxy = {
			name: attrMap['name'],
			groups: attrMap['groups'],
		};
		this.context.project.addProduct(proxy);
		this.context.dirty = true;
	}
}

class ProductEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Products-Edit';
		this.fields = [
      { label: 'name',    usage: Usage.REQUIRED },
      { label: 'groups',  usage: Usage.MULTIPLE },
    ];
	}

	findProxy(value) {
		let desc = this.context.project.findProduct(value);
		return desc;
	}

	handleModify(proxy, attrMap) {
		let proxy = {
			name: attrMap['name'],
			groups: attrMap['groups'],
		};
		this.context.project.updateProduct(proxy.id, proxy);
		this.context.dirty = true;
	}
}

class ProductRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Products-Remove';
	}

	findProxy(value) {
		let desc = this.context.project.findProduct(value);
		return desc;
	}

	handleRemove(proxy) {
		this.context.project.removeProduct(proxy.id);
		this.context.dirty = true;
	}
}

class ProductListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Products-List';
    this.filterFields = [
      { label: 'group',   usage: Usage.OPTIONAL },
    ];
		this.listFields = [
      { label: 'name',    usage: Usage.REQUIRED, type: Type.STRING, width: 20 },
      { label: 'groups',  usage: Usage.MULTIPLE, type: Type.STRING, width: 40 },
    ];
	}
	
	produceProxys(attrMap) {
		let proxys = this.context.project.filterProducts(attrMap['group']);
		return proxys;
	}
}

module.exports = {};
module.exports.ProductChooseActionState = ProductChooseActionState;
