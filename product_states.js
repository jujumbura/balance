var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');
var Usage = require('./dialog_helper').Usage;

const FIELDS = [
  { label: 'name', usage: Usage.REQUIRED },
  { label: 'groups', usage: Usage.MULTIPLE },
];

class ProductChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.header = 'Products';
		this.options = [
			{ label: 'add', state: new ProductAddState() },
			{ label: 'edit', state: new ProductEditState() },
			{ label: 'remove', state: new ProductRemoveState() },
			{ label: 'list', state: new ProductListState() },
		];
	}
}

class ProductAddState extends baseStates.AddState {
	constructor() {
		super();
		this.header = 'Products-Add';
		this.fields = FIELDS;
	}

	handleAdd(attrs) {
		let params = {
			name: attrs[0],
			groups: attrs[1],
		};
		this.context.project.addProduct(params);
		this.context.dirty = true;
	}
}

class ProductEditState extends baseStates.EditState {
	constructor() {
		super();
		this.header = 'Products-Edit';
		this.fields = FIELDS;
	}

	findObj(value) {
		let desc = this.context.project.findProduct(value);
		return desc;
	}

	handleModify(obj, attrs) {
		let params = {
			name: attrs[0],
			groups: attrs[1],
		};
		this.context.project.updateProduct(obj.id, params);
		this.context.dirty = true;
	}
}

class ProductRemoveState extends baseStates.RemoveState {
	constructor() {
		super();
		this.header = 'Products-Remove';
	}

	findObj(value) {
		let desc = this.context.project.findProduct(value);
		return desc;
	}

	handleRemove(obj) {
		this.context.project.removeProduct(obj.id);
		this.context.dirty = true;
	}
}

class ProductListState extends baseStates.ListState {
	constructor() {
		super();
    this.header = 'Products-List';
    this.filterFields = [
      { label: 'group', usage: Usage.OPTIONAL },
    ];
		this.listFields = FIELDS;
	}
	
	produceObjs(attrs) {
		let productDescs = this.context.project.filterProducts(attrs[0]);
		return productDescs;
	}
}

module.exports = {};
module.exports.ProductChooseActionState = ProductChooseActionState;
