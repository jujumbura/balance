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
}

module.exports = ProductTable;
