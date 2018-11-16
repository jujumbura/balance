var io = require('./console_io');
var logger = require('./logger');
var baseStates = require('./base_states');

class ProductChooseActionState extends baseStates.ChooseState {
	constructor() {
		super();
		this.message = '[Products] Choose action';
		this.options = [
			{ label: 'add', state: new ProductAddState() },
			{ label: 'list', state: new ProductListState() },
		];
	}
}

class ProductAddState extends baseStates.AddState {
	constructor() {
		super();
		this.message = '[Products] Add';
		this.fields = [
			{ label: 'name', usage: 'r' },
		];
	}

	handleSubmit(fieldValues) {
		let params = {
			name: fieldValues[0],
		};
		this.context.project.addProduct(params);
		this.context.dirty = true;
	}
}
/*
class ProductSelectState extends BaseState {
	getMessage() {
		return '[Product] Select product: name';
	}
	
	handleInput(values) {
		let name = values[0];
		let descs = project.getAllProducts();
		for (let i = 0; i < descs.length; ++i) {
			let desc = descs[i];
			if (desc.name === name) {
			}
		}

		// TODO

		return null;
	}
}

class ProductEditState extends BaseState {
	getMessage() {
		return '[Product] Edit product: name';
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
*/
class ProductListState extends baseStates.AddState {
	constructor() {
		super();
		this.message = '[Products] List';
		this.fields = [
			{ label: 'name', usage: 'r' },
		];
	}

	getMessage() {
		return '[Product] List products: ';
	}
	
	handleInput(values) {
		let productDescs = this.context.project.getAllProducts();
		for (let i = 0; i < productDescs.length; ++i) {
			let productDesc = productDescs[i];
			io.writeMessage(productDesc.name);
		}

		return null;
	}
}

module.exports = {};
module.exports.ProductChooseActionState = ProductChooseActionState;
