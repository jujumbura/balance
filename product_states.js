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

	handleSubmit(fieldValues) {
		let params = {
			name: fieldValues[0],
		};
		this.context.project.addProduct(params);
		this.context.dirty = true;
	}
}

class ProductEditState extends baseStates.EditState {
	getMessage() {
		return '[Products-Edit] Modify: name';
	}
	
	handleInput(values) {
		let params = {
			name: values[0]
		}
		this.context.project.addProduct(params);
		this.context.dirty = true;

		return null;
	}
}

class ProductListState extends baseStates.ListState {
	constructor() {
		super();
		this.message = '[Products-List] ';
		this.fields = FIELDS;
	}
	
	produceDescs() {
		let productDescs = this.context.project.getAllProducts();
		return productDescs;
	}
}

module.exports = {};
module.exports.ProductChooseActionState = ProductChooseActionState;
