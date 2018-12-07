var generator = require('./generator');
var change_helper = require('./change_helper.js');
var io = require('./console_io');
var GroupTable = require('./group_table');
var ProductTable = require('./product_table');
var ItemTable = require('./item_table');
var GroupGraph = require('./group_graph');
var DependencyError = require('./errors').DependencyError;

function removeFromRefArray(proxy, arrayName, element) {
  let array = proxy[arrayName];
  let index = array.indexOf(element);
  array.splice(index, 1);
  if (array.length === 0) {
    delete proxy[arrayName];
  }
}

function writeChange(message) {
  io.writeMessage('* ' + message);
}

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
    groupProxys.forEach(groupProxy => {
      this.groupGraph.addGroup_(groupProxy.id);
    });
    groupProxys.forEach(groupProxy => {
      if (groupProxy.parentIds) {
        this.groupGraph.setParents_(groupProxy.id, groupProxy.parentIds);
      }
    });
  }
	
  
  addGroup(groupProxy) {
    let id = generator.generateUUID();
		groupProxy.id = id;
		let parentIds = null;
		if (groupProxy.parents) {
			parentIds = this.groupTable.findIdsByName(groupProxy.parents);
      groupProxy.parentIds = parentIds;
		} 

    let changes = []
		changes.push(this.groupTable.makeAddChange(groupProxy));
    changes.push(this.groupGraph.makeAddGroupChange(id));
    changes.push(this.groupGraph.makeSetParentsChange(id, parentIds));
    change_helper.runChanges(changes);
    writeChange('added 1 group');
	}
	
  updateGroup(groupProxy) {	
		let parentIds = null;
		if (groupProxy.parents) {
			parentIds = this.groupTable.findIdsByName(groupProxy.parents);
      groupProxy.parentIds = parentIds;
		} 

    let changes = []
		changes.push(this.groupTable.makeUpdateChange(groupProxy));
    changes.push(this.groupGraph.makeSetParentsChange(groupProxy.id, parentIds));
    change_helper.runChanges(changes);
    writeChange('updated 1 group');
	}

	removeGroup(id) {
    let changes = []
    let childProxys = this.groupTable.findWithParentId(id);
    childProxys.forEach(childProxy => {
      removeFromRefArray(childProxy, 'parentIds', id);
      changes.push(this.groupGraph.makeSetParentsChange(childProxy.id, 
          childProxy.parentIds));
      changes.push(this.groupTable.makeUpdateChange(childProxy));
    });
    let refProxys = this.productTable.findWithGroupId(id);
    refProxys.forEach(refProxy => {
      removeFromRefArray(refProxy, 'groupIds', id);
      changes.push(this.groupGraph.makeSetParentsChange(refProxy.id, 
          refProxy.groupIds));
      changes.push(this.productTable.makeUpdateChange(refProxy));
    });
    let parentIds = null;
    changes.push(this.groupGraph.makeSetParentsChange(id, parentIds));
    changes.push(this.groupGraph.makeRemoveGroupChange(id));
		changes.push(this.groupTable.makeRemoveChange(id));
    change_helper.runChanges(changes);
    writeChange('removed 1 group');
    if (childProxys.length > 0) {
      writeChange('updated ' + childProxys.length + ' groups');
    }
    if (refProxys.length > 0) {
      writeChange('updated ' + refProxys.length + ' products');
    }
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
  
  filterGroups(group) {
    let groupProxys = this.getAllGroups();

    let groupIdSet = null;
    if (group) {
      let groupId = this.groupTable.findIdByName(group);
      groupIdSet = this.groupGraph.getDescendentSet(groupId);
    } 
    let filteredProxys = [];
    groupProxys.forEach(groupProxy => {
      let keep = true;
      if (group) {
        if (!groupIdSet[groupProxy.id]) { keep = false; }
      }
      if (keep) { filteredProxys.push(groupProxy); }
    });
    return filteredProxys;
  }
	

	addProduct(productProxy) {
    let id = generator.generateUUID();
		productProxy.id = id;
		if (productProxy.groups) {
			productProxy.groupIds = this.groupTable.findIdsByName(productProxy.groups);
		} 

    let changes = []
		changes.push(this.productTable.makeAddChange(productProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 product');
	}
	
	updateProduct(productProxy) {
		if (productProxy.groups) {
			productProxy.groupIds = this.groupTable.findIdsByName(productProxy.groups);
		}
    
    let changes = []
		changes.push(this.productTable.makeUpdateChange(productProxy));
    change_helper.runChanges(changes);
    writeChange('updated 1 product');
	}
	
  removeProduct(id) {
    let itemProxys = this.itemTable.findByProductId(id);
    if (itemProxys.length > 0) {
      throw new DependencyError('Items depend on product');
    }

    let changes = []
		changes.push(this.productTable.makeRemoveChange(id));
    change_helper.runChanges(changes);
    writeChange('removed 1 product');
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
      let groupIdSet = this.groupGraph.getDescendentSet(groupId);
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
    let id = generator.generateUUID();
		itemProxy.id = id;
    itemProxy.productId = this.productTable.findIdByName(itemProxy.product);
    if (itemProxy.acquired) {
      itemProxy.acquireDate = itemProxy.acquired.toISOString();
    }
    if (itemProxy.disposed) {
      itemProxy.disposeDate = itemProxy.disposed.toISOString();
    }

    let changes = []
		changes.push(this.itemTable.makeAddChange(itemProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 item');
	}
	
  updateItem(itemProxy) {
    if (itemProxy.acquired) {
      itemProxy.acquireDate = itemProxy.acquired.toISOString();
    }
    if (itemProxy.disposed) {
      itemProxy.disposeDate = itemProxy.disposed.toISOString();
    }
    
    let changes = []
		changes.push(this.itemTable.makeUpdateChange(itemProxy));
    change_helper.runChanges(changes);
    writeChange('updated 1 item');
	}
  
  removeItem(id) {
    let changes = []
		changes.push(this.itemTable.makeRemoveChange(id));
    change_helper.runChanges(changes);
    writeChange('removed 1 item');
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
      productId = this.productTable.findIdByName(product);
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
