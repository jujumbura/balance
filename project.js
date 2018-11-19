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
		if (productParams.groups) {
			productParams.groupIds = this.groupTable.findIdsByName(productParams.groups);
		}
		this.productTable.add(productParams);
	}
	
	updateProduct(id, productParams) {
		if (productParams.groups) {
			productParams.groupIds = this.groupTable.findIdsByName(productParams.groups);
		}
		this.productTable.update(id, productParams);
	}

	findProduct(name) {
		let productDesc = this.productTable.getByName(name);
		if (productDesc.groupIds) {
			productDesc.groups = this.groupTable.findNamesById(productDesc.groupIds);
		}
		return productDesc;
	}

	getAllProducts() {
		let productDescs = this.productTable.getAll();
		for (let i = 0; i < productDescs.length; ++i) {
			let productDesc = productDescs[i];
			if (productDesc.groupIds) {
				productDesc.groups = this.groupTable.findNamesById(productDesc.groupIds);
			}
		}
		return productDescs;
	}


	addGroup(groupParams) {
		this.groupTable.add(groupParams);
	}

	findGroup(name) {
		let groupDesc = this.groupTable.getByName(name);
		return groupDesc;
	}

	updateGroup(id, groupParams) {
		this.groupTable.update(id, groupParams);
	}

	getAllGroups() {
		let groupDescs = this.groupTable.getAll();
		return groupDescs;
	}
}

module.exports = Project;
