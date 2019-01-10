var generator = require('./generator');
var change_helper = require('./change_helper.js');
var io = require('./console_io');
var GroupTable = require('./group_table');
var ProductTable = require('./product_table');
var LocationTable = require('./location_table');
var ItemTable = require('./item_table');
var VendorTable = require('./vendor_table');
var TransactionTable = require('./transaction_table');
var PurchaseTable = require('./purchase_table');
var GroupGraph = require('./group_graph');
var DependencyError = require('./errors').DependencyError;

function compareDates(a, b) {
  let value = 0;
  if (a < b) {
    value = -1;
  } else if (a > b) {
    value = 1;
  }
  return value;
}

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
    this.locationTable = new LocationTable();
    this.itemTable = new ItemTable();
    this.vendorTable = new VendorTable();
    this.transactionTable = new TransactionTable();
    this.purchaseTable = new PurchaseTable();

		this.tables = [
      this.groupTable,
			this.productTable,
      this.locationTable,
			this.itemTable,
      this.vendorTable,
			this.transactionTable,
			this.purchaseTable,
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
		} else {
      groupProxy.parentIds = null;
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
		} else {
      groupProxy.parentIds = null;
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
		} else {
      groupProxy.parents = null;
    }
		return groupProxy;
	}

	getAllGroups() {
		let groupProxys = this.groupTable.getAll();
		for (let i = 0; i < groupProxys.length; ++i) {
			let groupProxy = groupProxys[i];
      if (groupProxy.parentIds) {
        groupProxy.parents = this.groupTable.findNamesById(groupProxy.parentIds);
      } else {
        groupProxy.parents = null;
      }
		}
    
    groupProxys.sort((a, b) => {
      let value = a.name.localeCompare(b.name);
      return value;
    });
		
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
		} else {
      productProxy.groupIds = null;
    }

    let changes = []
		changes.push(this.productTable.makeAddChange(productProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 product');
	}
	
	updateProduct(productProxy) {
		if (productProxy.groups) {
			productProxy.groupIds = this.groupTable.findIdsByName(productProxy.groups);
		} else {
      productProxy.groupIds = null;
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
    } else {
      productProxy.groups = null;
    }
		return productProxy;
	}

  findProductsByGroup(group) {
    let productProxys = this.getAllProducts();

    let foundProxys;
    let groupId = this.groupTable.findIdByName(group);
    let groupIdSet = this.groupGraph.getDescendentSet(groupId);
    foundProxys = [];
    for (let i = 0; i < productProxys.length; ++i) {
      let productProxy = productProxys[i];
      if (productProxy.groupIds) {
        for (let j = 0; j < productProxy.groupIds.length; ++j) {
          let groupId = productProxy.groupIds[j];
          if (groupIdSet[groupId]) {
            foundProxys.push(productProxy);
          }
        }
      }
    }
    return foundProxys;
  }

	getAllProducts() {
		let productProxys = this.productTable.getAll();
		for (let i = 0; i < productProxys.length; ++i) {
			let productProxy = productProxys[i];
			if (productProxy.groupIds) {
				productProxy.groups = this.groupTable.findNamesById(productProxy.groupIds);
			} else {
        productProxy.groups = null;
      }
		}
    
    productProxys.sort((a, b) => {
      let value = a.name.localeCompare(b.name);
      return value;
    });

		return productProxys;
	}

  getAllProductNames() {
    return this.productTable.getAllNames();
  }

  filterProducts(name, group) {
    let initialProxys;
    if (group) {
      initialProxys = this.findProductsByGroup(group);
    } else {
      initialProxys = this.getAllProducts();
    }

    let filteredProxys = [];
    for(let i = 0; i < initialProxys.length; ++i) {
      let proxy = initialProxys[i];
      if (name && proxy.name !== name) {
        continue;
      }
      filteredProxys.push(proxy);
    }

    return filteredProxys;
  }
	
  
  addLocation(locationProxy) {
    let id = generator.generateUUID();
		locationProxy.id = id;

    let changes = []
		changes.push(this.locationTable.makeAddChange(locationProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 location');
	}
	
	updateLocation(locationProxy) {
    let changes = []
		changes.push(this.locationTable.makeUpdateChange(locationProxy));
    change_helper.runChanges(changes);
    writeChange('updated 1 location');
	}
	
  removeLocation(id) {
    let itemProxys = this.itemTable.findByLocationId(id);
    if (itemProxys.length > 0) {
      throw new DependencyError('Items depend on location');
    }

    let changes = []
		changes.push(this.locationTable.makeRemoveChange(id));
    change_helper.runChanges(changes);
    writeChange('removed 1 location');
	}

	findLocation(name) {
		let locationProxy = this.locationTable.getByName(name);
		return locationProxy;
	}

	getAllLocations() {
		let locationProxys = this.locationTable.getAll();
    
    locationProxys.sort((a, b) => {
      let value = a.name.localeCompare(b.name);
      return value;
    });
		
    return locationProxys;
	}
  
  getAllLocationNames() {
    return this.locationTable.getAllNames();
  }
  
  filterLocations(name) {
    let locationProxys = this.getAllLocations();
    
    let filteredProxys;
    filteredProxys = [];
    for (let i = 0; i < locationProxys.length; ++i) {
      let locationProxy = locationProxys[i];
      if (name && (locationProxy.name !== name)) {
        continue
      }
      filteredProxys.push(locationProxy);
    }
    return filteredProxys;
  }


	addItem(itemProxy) {
    let id = generator.generateUUID();
		itemProxy.id = id;
    itemProxy.productId = this.productTable.findIdByName(itemProxy.product);
    itemProxy.locationId = this.locationTable.findIdByName(itemProxy.location);
    itemProxy.acquireDate = itemProxy.acquired.toISOString();
    if (itemProxy.disposed) {
      itemProxy.disposeDate = itemProxy.disposed.toISOString();
    } else {
      itemProxy.disposeDate = null;
    }

    let changes = []
		changes.push(this.itemTable.makeAddChange(itemProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 item');
	}
	
  updateItem(itemProxy) {
    itemProxy.productId = this.productTable.findIdByName(itemProxy.product);
    itemProxy.locationId = this.locationTable.findIdByName(itemProxy.location);
    itemProxy.acquireDate = itemProxy.acquired.toISOString();
    if (itemProxy.disposed) {
      itemProxy.disposeDate = itemProxy.disposed.toISOString();
    } else {
      itemProxy.disposeDate = null;
    }
    
    let changes = []
		changes.push(this.itemTable.makeUpdateChange(itemProxy));
    change_helper.runChanges(changes);
    writeChange('updated 1 item');
	}
  
  removeItem(id) {
    let changes = []
    let purchaseProxy = this.purchaseTable.findByItemId(id);
    if (purchaseProxy) {
      delete purchaseProxy.itemId;
      changes.push(this.purchaseTable.makeUpdateChange(purchaseProxy));
    }
		changes.push(this.itemTable.makeRemoveChange(id));
    change_helper.runChanges(changes);
    if (purchaseProxy) {
      writeChange('updated 1 purchase');
    }
    writeChange('removed 1 item');
	}
  
  getAllItems() {
		let itemProxys = this.itemTable.getAll();
		for (let i = 0; i < itemProxys.length; ++i) {
			let itemProxy = itemProxys[i];
			itemProxy.product = this.productTable.findNameById(itemProxy.productId);
			itemProxy.location = this.locationTable.findNameById(itemProxy.locationId);
      itemProxy.acquired = new Date(itemProxy.acquireDate);
      if (itemProxy.disposeDate) {
        itemProxy.disposed = new Date(itemProxy.disposeDate);
      } else {
        itemProxy.disposed = null;
      }
		}
    
    itemProxys.sort((a, b) => {
      let value = a.product.localeCompare(b.product);
      if (value === 0) {
        value = compareDates(a.acquired, b.acquired);
      }
      return value;
    });
		
    return itemProxys;
	}
  
  filterItems(product, location, disposed) {
    let itemProxys = this.getAllItems();
    
    let filteredProxys;
    let productId;
    let locationId;
    if (product) {
      productId = this.productTable.findIdByName(product);
    }
    if (location) {
      locationId = this.locationTable.findIdByName(location);
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
      if (location && (itemProxy.locationId !== locationId)) {
        continue
      }
      filteredProxys.push(itemProxy);
    }
    return filteredProxys;
  }
 
  getItemCountWithGroup(group) {
    let itemProxys = this.getAllItems();

    let productProxys = this.findProductsByGroup(group);
    let productIdSet = {};
    productProxys.forEach(proxy => {
      productIdSet[proxy.id] = true;
    });
    let count = 0;
    for (let i = 0; i < itemProxys.length; ++i) {
      let itemProxy = itemProxys[i];
      if (!productIdSet[itemProxy.productId]) {
        continue
      }
      count += itemProxy.remain;
    }
    return count;
  }

  getItemCountWithProduct(product) {
    let itemProxys = this.getAllItems();
    
    let productId = this.productTable.findIdByName(product);
    let count = 0;
    for (let i = 0; i < itemProxys.length; ++i) {
      let itemProxy = itemProxys[i];
      if (product && (itemProxy.productId !== productId)) {
        continue
      }
      count += itemProxy.remain;
    }
    return count;
  }
  
  
  addVendor(vendorProxy) {
    let id = generator.generateUUID();
		vendorProxy.id = id;

    let changes = []
		changes.push(this.vendorTable.makeAddChange(vendorProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 vendor');
	}
	
	updateVendor(vendorProxy) {
    let changes = []
		changes.push(this.vendorTable.makeUpdateChange(vendorProxy));
    change_helper.runChanges(changes);
    writeChange('updated 1 vendor');
	}
	
  removeVendor(id) {
    let transactionProxys = this.transactionTable.findByVendorId(id);
    if (transactionProxys.length > 0) {
      throw new DependencyError('Transactions depend on vendor');
    }

    let changes = []
		changes.push(this.vendorTable.makeRemoveChange(id));
    change_helper.runChanges(changes);
    writeChange('removed 1 vendor');
	}

	findVendor(name) {
		let vendorProxy = this.vendorTable.getByName(name);
		return vendorProxy;
	}

	getAllVendors() {
		let vendorProxys = this.vendorTable.getAll();
		return vendorProxys;
	}
  
  getAllVendorNames() {
    return this.vendorTable.getAllNames();
  }
  
  filterVendors(name) {
    let vendorProxys = this.getAllVendors();
    
    let filteredProxys;
    filteredProxys = [];
    for (let i = 0; i < vendorProxys.length; ++i) {
      let vendorProxy = vendorProxys[i];
      if (name && (vendorProxy.name !== name)) {
        continue
      }
      filteredProxys.push(vendorProxy);
    }
    return filteredProxys;
  }
	
  
  addTransaction(transactionProxy) {
    let id = generator.generateUUID();
		transactionProxy.id = id;
    transactionProxy.vendorId = this.vendorTable.findIdByName(transactionProxy.vendor);
    if (transactionProxy.entered) {
      transactionProxy.enterDate = transactionProxy.entered.toISOString();
    }

    let changes = []
		changes.push(this.transactionTable.makeAddChange(transactionProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 transaction');
	}
	
  updateTransaction(transactionProxy) {
    transactionProxy.vendorId = this.vendorTable.findIdByName(transactionProxy.vendor);
    if (transactionProxy.entered) {
      transactionProxy.enterDate = transactionProxy.entered.toISOString();
    }
    
    let changes = []
		changes.push(this.transactionTable.makeUpdateChange(transactionProxy));
    change_helper.runChanges(changes);
    writeChange('updated 1 transaction');
	}
  
  removeTransaction(id) {
    let changes = []
		changes.push(this.transactionTable.makeRemoveChange(id));
    change_helper.runChanges(changes);
    writeChange('removed 1 transaction');
	}
	
  findTransaction(id) {
		let transactionProxy = this.transactionTable.getById(id);
    transactionProxy.vendor = this.vendorTable.findNameById(transactionProxy.vendorId);
    transactionProxy.entered = new Date(transactionProxy.enterDate);
		return transactionProxy;
	}
  
  getAllTransactions() {
		let transactionProxys = this.transactionTable.getAll();
		for (let i = 0; i < transactionProxys.length; ++i) {
			let transactionProxy = transactionProxys[i];
			transactionProxy.vendor = this.vendorTable.findNameById(transactionProxy.vendorId);
      transactionProxy.entered = new Date(transactionProxy.enterDate);
		}
		return transactionProxys;
	}
  
  filterTransactions(vendor) {
    let transactionProxys = this.getAllTransactions();
    
    let filteredProxys;
    let vendorId;
    if (vendor) {
      vendorId = this.vendorTable.findIdByName(vendor);
    }
    filteredProxys = [];
    for (let i = 0; i < transactionProxys.length; ++i) {
      let transactionProxy = transactionProxys[i];
      if (vendor && (transactionProxy.vendorId !== vendorId)) {
        continue
      }
      filteredProxys.push(transactionProxy);
    }
    return filteredProxys;
  }
	
  
  addPurchase(purchaseProxy) {
    let id = generator.generateUUID();
		purchaseProxy.id = id;
    purchaseProxy.productId = this.productTable.findIdByName(purchaseProxy.product);

    let changes = []
		changes.push(this.purchaseTable.makeAddChange(purchaseProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 purchase');
	}
	
  updatePurchase(purchaseProxy) {
    purchaseProxy.productId = this.productTable.findIdByName(purchaseProxy.product);
    
    let changes = []
		changes.push(this.purchaseTable.makeUpdateChange(purchaseProxy));
    change_helper.runChanges(changes);
    writeChange('updated 1 purchase');
	}
  
  removePurchase(id) {
    let changes = []
		changes.push(this.purchaseTable.makeRemoveChange(id));
    change_helper.runChanges(changes);
    writeChange('removed 1 purchase');
	}
  
  getAllPurchases(transactionId) {
		let purchaseProxys = this.purchaseTable.findByTransactionId(transactionId);
		for (let i = 0; i < purchaseProxys.length; ++i) {
			let purchaseProxy = purchaseProxys[i];
			purchaseProxy.product = this.productTable.findNameById(purchaseProxy.productId);
		}
		return purchaseProxys;
	}
  
  filterPurchases(transactionId, product) {
    let purchaseProxys = this.getAllPurchases(transactionId);
    
    let filteredProxys;
    let productId;
    if (product) {
      productId = this.productTable.findIdByName(product);
    }
    filteredProxys = [];
    for (let i = 0; i < purchaseProxys.length; ++i) {
      let purchaseProxy = purchaseProxys[i];
      if (product && (purchaseProxy.productId !== productId)) {
        continue
      }
      filteredProxys.push(purchaseProxy);
    }
    return filteredProxys;
  }

  convertPurchaseToItem(purchaseProxy, itemProxy) {
    let id = generator.generateUUID();
		itemProxy.id = id;
    itemProxy.productId = this.productTable.findIdByName(itemProxy.product);
    itemProxy.locationId = this.locationTable.findIdByName(itemProxy.location);
    if (itemProxy.acquired) {
      itemProxy.acquireDate = itemProxy.acquired.toISOString();
    }

    purchaseProxy.itemId = id;
    
    let changes = [];
		changes.push(this.itemTable.makeAddChange(itemProxy));
		changes.push(this.purchaseTable.makeUpdateChange(purchaseProxy));
    change_helper.runChanges(changes);
    writeChange('added 1 item');
    writeChange('updated 1 purchase');
  }
}

module.exports = Project;
