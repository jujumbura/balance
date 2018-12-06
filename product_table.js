var BaseTable = require('./base_table');

class ProductTable extends BaseTable {
	constructor() {
		super();
   
    this.named = true;
	}

	getName() { return 'Products'; }

	formEntry(id, proxy) {
		let entry = {
			id: id,
			name: proxy.name,
			groupIds: proxy.groupIds,
		};
		return entry;	
	}

	formProxy(entry) {
		let proxy = {
			id: entry.id,
			name: entry.name,
			groupIds: entry.groupIds,
		};
		return proxy;
	}
  
  findWithGroupId(groupId) {
		let proxys = [];
    this.entries.forEach(entry => {
      if (entry.groupIds && entry.groupIds.includes(groupId)) {
			  let proxy = this.formProxy(entry);
        proxys.push(proxy);
      }
    });
    return proxys;
  }
}

module.exports = ProductTable;
