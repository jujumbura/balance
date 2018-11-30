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
		let groupProxys = this.groupTable.getAll();
		for (let i = 0; i < groupProxys.length; ++i) {
			let groupProxy = groupProxys[i];
      this.groupGraph.addGroup(groupProxy.id);
		}
		for (let i = 0; i < groupProxys.length; ++i) {
			let groupProxy = groupProxys[i];
      if (groupProxy.parentIds) {
        this.groupGraph.relateParents(groupProxy.id, groupProxy.parentIds);
      }
		}
  }
	
  
  addGroup(groupProxy) {
		let parentIds = null;
		if (groupProxy.parents) {
			parentIds = this.groupTable.findIdsByName(groupProxy.parents);
      groupProxy.parentIds = parentIds;
		}
		
		this.groupTable.add(groupProxy);
    let id = this.groupTable.findIdByName(groupProxy.name);
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
	
  updateGroup(id, groupProxy) {	
		let oldProxy = this.groupTable.getById(id);
		let parentIds = null;
		if (groupProxy.parents) {
			parentIds = this.groupTable.findIdsByName(groupProxy.parents);
      groupProxy.parentIds = parentIds;
		}
    
		this.groupTable.update(id, groupProxy);
		
		this.groupGraph.clearAllParents(id);
		if (parentIds) {
			try {
      	this.groupGraph.relateParents(id, parentIds);
			} catch (e) {
				this.groupTable.update(id, oldProxy);
				if (oldProxy.parentIds) {
					this.groupGraph.relateParents(id, oldProxy.parentIds);
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
		let groupProxy = this.groupTable.getByName(name);
		if (groupProxy.parentIds) {
			groupProxy.parents = this.groupTable.findNamesById(groupProxy.parentIds);
		}
		return groupProxy;
	}

	getAllGroups() {
		let groupProxys = this.groupTable.getAll();
		for (let i = 0; i < groupProxys.length; ++i) {
			let groupProxy = groupProxys[i];
      if (groupProxy.parentIds) {
        groupProxy.parents = this.groupTable.findNamesById(groupProxy.parentIds);
      }
		}
		return groupProxys;
	}
	

	addProduct(productProxy) {
		if (productProxy.groups) {
			productProxy.groupIds = this.groupTable.findIdsByName(productProxy.groups);
		}
		this.productTable.add(productProxy);
	}
	
	updateProduct(id, productProxy) {
		if (productProxy.groups) {
			productProxy.groupIds = this.groupTable.findIdsByName(productProxy.groups);
		}
		this.productTable.update(id, productProxy);
	}
	
  removeProduct(id) {
		this.productTable.remove(id);
	}

	findProduct(name) {
		let productProxy = this.productTable.getByName(name);
		if (productProxy.groupIds) {
			productProxy.groups = this.groupTable.findNamesById(productProxy.groupIds);
		}
		return productProxy;
	}

	getAllProducts() {
		let productProxys = this.productTable.getAll();
		for (let i = 0; i < productProxys.length; ++i) {
			let productProxy = productProxys[i];
			if (productProxy.groupIds) {
				productProxy.groups = this.groupTable.findNamesById(productProxy.groupIds);
			}
		}
		return productProxys;
	}

  filterProducts(group) {
    let productProxys = this.getAllProducts();

    let filteredProxys;
    if (group) {
      let groupId = this.groupTable.findIdByName(group);
      let groupIdSet = this.groupGraph.getProxyendentSet(groupId);
      filteredProxys = [];
      for (let i = 0; i < productProxys.length; ++i) {
        let productProxy = productProxys[i];
        if (productProxy.groupIds) {
          for (let j = 0; j < productProxy.groupIds.length; ++j) {
            let groupId = productProxy.groupIds[j];
            if (groupIdSet[groupId]) {
              filteredProxys.push(productProxy);
            }
          }
        }
      }
    } else {
      filteredProxys = productProxys;
    }
    return filteredProxys;
  }


	addItem(itemProxy) {
		itemProxy.productId = this.productTable.findIdByName(itemProxy.product);
    if (itemProxy.acquired) {
      itemProxy.acquireDate = itemProxy.acquired.toISOString();
    }
    if (itemProxy.disposed) {
      itemProxy.disposeDate = itemProxy.disposed.toISOString();
    }

		this.itemTable.add(itemProxy);
	}
	
  updateItem(id, itemProxy) {
		itemProxy.productId = this.productTable.findIdByName(itemProxy.product);
    if (itemProxy.acquired) {
      itemProxy.acquireDate = itemProxy.acquired.toISOString();
    }
    if (itemProxy.disposed) {
      itemProxy.disposeDate = itemProxy.disposed.toISOString();
    }
		
    this.itemTable.update(id, itemProxy);
	}
  
  removeItem(id) {
		this.itemTable.remove(id);
	}
  
  getAllItems() {
		let itemProxys = this.itemTable.getAll();
		for (let i = 0; i < itemProxys.length; ++i) {
			let itemProxy = itemProxys[i];
			itemProxy.product = this.productTable.findNameById(itemProxy.productId);
      itemProxy.acquired = new Date(itemProxy.acquireDate);
      if (itemProxy.disposeDate) {
        itemProxy.disposed = new Date(itemProxy.disposeDate);
      }
		}
		return itemProxys;
	}
  
  filterItems(product, disposed) {
    let itemProxys = this.getAllItems();
    
    let filteredProxys;
    let productId;
    if (product) {
      this.productTable.findIdByName(product);
    }
    filteredProxys = [];
    for (let i = 0; i < itemProxys.length; ++i) {
      let itemProxy = itemProxys[i];
      if (!disposed && itemProxy.disposed) {
        continue;
      }
      if (product && (itemProxy.productId !== productId)) {
        continue
      }
      filteredProxys.push(itemProxy);
    }
    return filteredProxys;
  }
}

module.exports = Project;
