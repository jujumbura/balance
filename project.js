var ProductTable = require('./product_table');

class Project {
	constructor() {
		this.productTable = new ProductTable();
	}

	retrieveProductEntries() {
		return this.productTable.retrieveEntries();
	}

	assignProductEntries(entries) {
		this.productTable.assignEntries(entries);
	}

	addProduct(productParams) {
		this.productTable.add(productParams);
	}

	getAllProducts() {
		let productDescs = this.productTable.getAll();
		return productDescs;
	}
}

module.exports = Project;
