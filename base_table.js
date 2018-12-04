var TableError = require('./errors').TableError;

class AddChange {
  constructor(table, proxy) { this.table = table; this.proxy = proxy; }

  check() { this.table.checkAdd_(this.proxy); }

  execute() { this.table.executeAdd_(this.proxy); }
}

class UpdateChange {
  constructor(table, id, proxy) { 
      this.table = table; this.id = id; this.proxy = proxy; }

  check() { this.table.checkUdate_(this.id, this.proxy); }

  execute() { this.table.executeUpdate_(this.id, this.proxy); }
}

class RemoveChange {
  constructor(table, id) { this.table = table; this.id = id; }

  check() { this.table.checkRemove_(this.id); }

  execute() { this.table.executeRemove_(this.id); }
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
	
  makeUpdateChange(proxy) {
    let change = new UpdateChange(this, proxy);
    return change;
	}

  makeRemoveChange(id) {
    let change = new RemoveChange(this, id);
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

  checkAdd_(proxy) {
		if (this.idEntryMap[proxy.id]) {
			throw new TableError('Id already exists in table');
		}
    if (this.named) {
      if (this.nameEntryMap[proxy.name]) {
        throw new TableError('Name: ' + proxy.name + ' already exists in table');
      }
    }
  }

  executeAdd_(proxy) {
    let entry = this.formEntry(proxy.id, proxy);
    this.entries.push(entry);
    this.idEntryMap[entry.id] = entry;
    if (this.named) {
      this.nameEntryMap[entry.name] = entry;
    }
  }
  
  checkUpdate_(proxy) {
		if (!this.idEntryMap[proxy.id]) {
			throw new TableError('Id not present in table');
		}
    if (this.named) {
      let namedEntry = this.nameEntryMap[proxy.name];
      if (namedEntry && namedEntry.id != id) {
        throw new TableError('Name: ' + proxy.name + ' already exists in table');
      }
    }
  }
		
  executeUpdate_(proxy) {
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

  checkRemove_(id) {
		if (!this.idEntryMap[id]) {
			throw new TableError('Id not present in table');
		}
  }

  executeRemove_(id) {
		let entry = this.idEntryMap[id];
    let index = this.entries.indexOf(entry);
    delete this.idEntryMap[id];
    if (this.named) {
      delete this.nameEntryMap[entry.name];
    }
    this.entries.splice(index, 1);
  }
}

module.exports = BaseTable;
