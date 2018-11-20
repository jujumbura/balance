var ProductTable = require('./product_table');
var GroupTable = require('./group_table');
var GroupGraph = require('./group_graph');

class Project {
	constructor() {
		this.productTable = new ProductTable();
		this.groupTable = new GroupTable();

		this.tables = [
			this.productTable,
			this.groupTable,
		];
		
		this.groupGraph = new GroupGraph();
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
		if (groupParams.parents) {
			groupParams.parentIds = this.groupTable.findIdsByName(groupParams.parents);
		}
		this.groupTable.add(groupParams);
	}
	
  updateGroup(id, groupParams) {	
		// TODO: clear graph?
		if (groupParams.parents) {
			// TODO: set in graph?

			groupParams.parentIds = this.groupTable.findIdsByName(groupParams.parents);
		}
		this.groupTable.update(id, groupParams);
	}

	findGroup(name) {
		let groupDesc = this.groupTable.getByName(name);
		if (groupDesc.parentIds) {
			groupDesc.parents = this.groupTable.findNamesById(groupDesc.parentIds);
		}
		return groupDesc;
	}

	getAllGroups() {
		let groupDescs = this.groupTable.getAll();
		for (let i = 0; i < groupDescs.length; ++i) {
			let groupDesc = groupDescs[i];
      if (groupDesc.parentIds) {
        groupDesc.parents = this.groupTable.findNamesById(groupDesc.parentIds);
      }
		}
		return groupDescs;
	}
}

module.exports = Project;
