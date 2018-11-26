var GroupTable = require('./group_table');
var ProductTable = require('./product_table');
var ItemTable = require('./item_table');
var GroupGraph = require('./group_graph');

class Project {
	constructor() {
    this.groupTable = new GroupTable();
		this.productTable = new ProductTable();
    this.itemTable = new ItemTable();

		this.tables = [
      this.groupTable,
			this.productTable,
			this.itemTable,
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
		}
		for (let i = 0; i < groupDescs.length; ++i) {
			let groupDesc = groupDescs[i];
      if (groupDesc.parentIds) {
        this.groupGraph.relateParents(groupDesc.id, groupDesc.parentIds);
      }
		}
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
	
  removeProduct(id) {
		this.productTable.remove(id);
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

  filterProducts(group) {
    let productDescs = this.getAllProducts();

    let filteredDescs;
    if (group) {
      let groupId = this.groupTable.findIdByName(group);
      let groupIdSet = this.groupGraph.getDescendentSet(groupId);
      filteredDescs = [];
      for (let i = 0; i < productDescs.length; ++i) {
        let productDesc = productDescs[i];
        if (productDesc.groupIds) {
          for (let j = 0; j < productDesc.groupIds.length; ++j) {
            let groupId = productDesc.groupIds[j];
            if (groupIdSet[groupId]) {
              filteredDescs.push(productDesc);
            }
          }
        }
      }
    } else {
      filteredDescs = productDescs;
    }
    return filteredDescs;
  }


	addItem(itemParams) {
		itemParams.productId = this.productTable.findIdByName(itemParams.product);
    itemParams.quantity = itemParams.quantity;
    itemParams.remain = itemParams.remain;
    itemParams.acquireDate = itemParams.acquired.toISOString();
    if (itemParams.discarded) {
      itemParams.discardDate = itemParams.discarded.toISOString();
    }
    console.log(JSON.stringify(itemParams, null, 2));

		this.itemTable.add(itemParams);
	}
	
  getAllItems() {
		let itemDescs = this.itemTable.getAll();
		for (let i = 0; i < itemDescs.length; ++i) {
			let itemDesc = itemDescs[i];
			itemDesc.product = this.productTable.findNameById(itemDesc.productId);
      itemDesc.acquired = new Date(itemDesc.acquireDate);
      if (itemDesc.discardDate) {
        itemDesc.discarded = new Date(itemDesc.discardDate);
      }
		}
		return itemDescs;
	}
  
  filterItems(group) {
    let itemDescs = this.getAllItems();
/*
    let filteredDescs;
    if (group) {
      let groupId = this.groupTable.findIdByName(group);
      let groupIdSet = this.groupGraph.getDescendentSet(groupId);
      filteredDescs = [];
      for (let i = 0; i < itemDescs.length; ++i) {
        let itemDesc = itemDescs[i];
        if (itemDesc.groupIds) {
          for (let j = 0; j < itemDesc.groupIds.length; ++j) {
            let groupId = itemDesc.groupIds[j];
            if (groupIdSet[groupId]) {
              filteredDescs.push(itemDesc);
            }
          }
        }
      }
    } else {
      filteredDescs = itemDescs;
    }
    return filteredDescs;
    */
    return itemDescs;
  }
}

module.exports = Project;
