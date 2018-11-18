var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');

const FIELDS = [
  { label: 'name', usage: 'r' },
];

class ProductChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.message = '[Products] Choose';
		this.options = [
			{ label: 'add', state: new ProductAddState() },
			{ label: 'edit', state: new ProductEditState() },
			{ label: 'list', state: new ProductListState() },
		];
	}
}

class ProductAddState extends baseStates.AddState {
	constructor() {
		super();
		this.message = '[Products-Add] Enter';
		this.fields = FIELDS;
	}

	handleAdd(attrs) {
		let params = {
			name: attrs[0],
		};
		this.context.project.addProduct(params);
		this.context.dirty = true;
	}
}

class ProductEditState extends baseStates.EditState {
	constructor() {
		super();
		this.findMessage = '[Products-Edit] Find';
		this.modifyMessage = '[Products-Edit] Modify';
		this.fields = FIELDS;
	}

	findObj(value) {
		let desc = this.context.project.findProduct(value);
		return desc;
	}

	handleModify(obj, attrs) {
		let params = {
			name: attrs[0],
		};
		this.context.project.updateProduct(obj.id, params);
		this.context.dirty = true;
	}
}

class ProductListState extends baseStates.ListState {
	constructor() {
		super();
		this.message = '[Products-List] ';
		this.fields = FIELDS;
	}
	
	produceObjs() {
		let productDescs = this.context.project.getAllProducts();
		return productDescs;
	}
}

module.exports = {};
module.exports.ProductChooseActionState = ProductChooseActionState;
