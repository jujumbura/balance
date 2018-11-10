var io = require('./console_io');
var logger = require('./logger');

class BaseState {
	constructor() {
		this.context = null;
	}
}

class SelectModeState extends BaseState {
	getMessage() {
		return 'Select mode: ( products )';
	}
	
	handleInput(values) {
		let nextState = null;
		switch(values[0]) {
			case 'products':
			case 'p':
				nextState = new ProductSelectActionState();
				break;
			default:
				io.writeMessage('Unknown mode');
				nextState = new SelectModeState();
				break;
		}
		return nextState;
	}
}

class ProductSelectActionState extends BaseState {
	getMessage() {
		return '[Product] Select action: ( add, list )';
	}
	
	handleInput(values) {
		switch(values[0]) {
			case 'add':
			case 'a':
				return new ProductAddState();
			case 'list':
			case 'l':
				return new ProductListState();
			default:
				return new ProductSelectActionState();
		}
	}
}

class ProductAddState extends BaseState {
	getMessage() {
		return '[Product] Add product: name';
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

class ProductListState extends BaseState {
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

function createInitialState() {
	return new SelectModeState();
}

module.exports = {};
module.exports.createInitialState = createInitialState;
