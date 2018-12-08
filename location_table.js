var BaseTable = require('./base_table');

class LocationTable extends BaseTable {
	constructor() {
		super();

    this.named = true;
	}
	
	getName() { return 'Locations'; }

	formEntry(id, proxy) {
		let entry = {
			id: id,
			name: proxy.name,
		};
		return entry;	
	}

	formProxy(entry) {
		let proxy = {
			id: entry.id,
			name: entry.name,
		};
		return proxy;
	}
}

module.exports = LocationTable;
