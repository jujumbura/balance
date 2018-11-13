var io = require('./console_io');
var logger = require('./logger');
var BaseState = require('./base_state');

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

module.exports = {};
module.exports.ProductSelectActionState = ProductSelectActionState;
