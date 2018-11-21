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

  fixup() {
		let groupDescs = this.groupTable.getAll();
		for (let i = 0; i < groupDescs.length; ++i) {
			let groupDesc = groupDescs[i];
      this.groupGraph.addGroup(groupDesc.id);
      if (groupDesc.parentIds) {
        this.groupGraph.relateParents(groupDesc.id, groupDesc.parentIds);
      }
		}
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
		let parentIds = null;
		if (groupParams.parents) {
			parentIds = this.groupTable.findIdsByName(groupParams.parents);
      groupParams.parentIds = parentIds;
		}
		
		this.groupTable.add(groupParams);
    let id = this.groupTable.findIdByName(groupParams.name);
    this.groupGraph.addGroup(id);

		if (parentIds) {
			try {
				this.groupGraph.relateParents(id, parentIds);
			} catch (e) {
				this.groupTable.remove(id);
				this.groupGraph.removeGroup(id);
				throw e;
			}
		}
	}
	
  updateGroup(id, groupParams) {	
		let oldDesc = this.groupTable.getById(id);
		console.log('old desc: ' + JSON.stringify(oldDesc, null, 2));
		let parentIds = null;
		if (groupParams.parents) {
			parentIds = this.groupTable.findIdsByName(groupParams.parents);
      groupParams.parentIds = parentIds;
		}
    
		this.groupTable.update(id, groupParams);
		
		this.groupGraph.clearAllParents(id);
		if (parentIds) {
			try {
      	this.groupGraph.relateParents(id, parentIds);
			} catch (e) {
				this.groupTable.update(id, oldDesc);
				if (oldDesc.parentIds) {
					this.groupGraph.relateParents(id, oldDesc.parentIds);
				}
				throw e;
			}
		}
	}

	removeGroup(id) {
		this.groupTable.remove(id);
		this.groupGraph.removeGroup(id);
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
