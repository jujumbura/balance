var ProductTable = require('./product_table');
var GroupTable = require('./group_table');

class Project {
	constructor() {
		this.productTable = new ProductTable();
		this.groupTable = new GroupTable();

		this.tables = [
			this.productTable,
			this.groupTable,
		];
	}

	getTables() {
		return this.tables;
	}

	addProduct(productParams) {
		this.productTable.add(productParams);
	}

	getAllProducts() {
		let productDescs = this.productTable.getAll();
		return productDescs;
	}
	
	addGroup(groupParams) {
		this.groupTable.add(groupParams);
	}

	getAllGroups() {
		let groupDescs = this.groupTable.getAll();
		return groupDescs;
	}
}

module.exports = Project;
