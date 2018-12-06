var TableError = require('./errors').TableError;

class AddChange {
  constructor(table, proxy) { this.table = table; this.proxy = proxy; }

  apply() { this.table.add_(this.proxy); }

  revert() { this.table.remove_(this.proxy.id); }
}

class RemoveChange {
  constructor(table, proxy) { this.table = table; this.proxy = proxy; }

  apply() { this.table.remove_(this.proxy.id); }

  revert() { this.table.add_(this.proxy); }
}

class UpdateChange {
  constructor(table, oldProxy, newProxy) { 
      this.table = table; this.oldProxy = oldProxy; this.newProxy = newProxy; }

  apply() { this.table.update_(this.newProxy); }

  revert() { this.table.update_(this.oldProxy); }
}

class BaseTable {
	constructor() {
		this.entries = [];
		this.idEntryMap = {};
		this.nameEntryMap = {};
	}

	receiveEntries() {
		return this.entries;
	}

	assignEntries(entries) {
		this.entries = entries;
		this.idEntryMap = {};
		if (this.named) {
      this.nameEntryMap = {};
    }
		for (let i = 0; i < entries.length; ++i) {
			let entry = entries[i];
			this.idEntryMap[entry.id] = entry;
      if (entry.name) {
			  this.nameEntryMap[entry.name] = entry;
      }
		}
	}

	makeAddChange(proxy) {
    let change = new AddChange(this, proxy);
    return change;
	}
	
  makeRemoveChange(id) {
    let proxy = this.getById(id);
    let change = new RemoveChange(this, proxy);
    return change;
  }
  
  makeUpdateChange(proxy) {
    let oldProxy = this.getById(proxy.id);
    let change = new UpdateChange(this, oldProxy, proxy);
    return change;
	}
  
	getById(id) {
		if (!this.idEntryMap[id]) {
			throw new TableError('Id not present in table');
		}

		let entry = this.idEntryMap[id];
		let proxy = this.formProxy(entry);
		return proxy;
	}
	
	getByName(name) {
		if (!this.nameEntryMap[name]) {
			throw new TableError('Name: ' + name + ' not present in table');
		}
		
		let entry = this.nameEntryMap[name];
		let proxy = this.formProxy(entry);
		return proxy;
	}

	getAll() {
		let proxys = [];
		for (let i = 0; i < this.entries.length; ++i) {
			let entry = this.entries[i];
			let proxy = this.formProxy(entry);
			proxys.push(proxy);
		}
		return proxys;
	}

  getAllIds() {
    let ids = [];
		for (let i = 0; i < this.entries.length; ++i) {
			let entry = this.entries[i];
			ids.push(entry.id);
		}
    return ids;
  }

  findIdByName(name) {
    if (!this.nameEntryMap[name]) {
      throw new TableError('Name: ' + name + ' not present in table');
    }

	  let entry = this.nameEntryMap[name];
    return entry.id
  }

	findIdsByName(names) {
		let ids = [];
		for (let i = 0; i < names.length; ++i) {
			let name = names[i];
			if (!this.nameEntryMap[name]) {
				throw new TableError('Name: ' + name + ' not present in table');
			}
			
			let entry = this.nameEntryMap[name];
			ids.push(entry.id);
		}
		return ids;
	}
	
  findNameById(id) {
    if (!this.idEntryMap[id]) {
      throw new TableError('Id not present in table');
    }
    
    let entry = this.idEntryMap[id];
		return entry.name;
	}
	
	findNamesById(ids) {
		let names = [];
		for (let i = 0; i < ids.length; ++i) {
			let id = ids[i];
			if (!this.idEntryMap[id]) {
				throw new TableError('Id not present in table');
			}
			
			let entry = this.idEntryMap[id];
			names.push(entry.name);
		}
		return names;
	}

  add_(proxy) {
		if (this.idEntryMap[proxy.id]) {
			throw new TableError('Id already exists in table');
		}
    if (this.named) {
      if (this.nameEntryMap[proxy.name]) {
        throw new TableError('Name: ' + proxy.name + ' already exists in table');
      }
    }
    
    let entry = this.formEntry(proxy.id, proxy);
    this.entries.push(entry);
    this.idEntryMap[entry.id] = entry;
    if (this.named) {
      this.nameEntryMap[entry.name] = entry;
    }
  }
  
  remove_(id) {
		if (!this.idEntryMap[id]) {
			throw new TableError('Id not present in table');
		}
		
    let entry = this.idEntryMap[id];
    let index = this.entries.indexOf(entry);
    delete this.idEntryMap[id];
    if (this.named) {
      delete this.nameEntryMap[entry.name];
    }
    this.entries.splice(index, 1);
  }
  
  update_(proxy) {
		if (!this.idEntryMap[proxy.id]) {
			throw new TableError('Id not present in table');
		}
    if (this.named) {
      let namedEntry = this.nameEntryMap[proxy.name];
      if (namedEntry && namedEntry.id != proxy.id) {
        throw new TableError('Name: ' + proxy.name + ' already exists in table');
      }
    }
		
    let oldEntry = this.idEntryMap[proxy.id];
		if (this.named) {
      delete this.nameEntryMap[oldEntry.name];
    }
		let index = this.entries.indexOf(oldEntry);
		let newEntry = this.formEntry(proxy.id, proxy);
		this.entries[index] = newEntry;
		this.idEntryMap[newEntry.id] = newEntry;
		if (this.named) {
      this.nameEntryMap[newEntry.name] = newEntry;
    }
	}
}

module.exports = BaseTable;
