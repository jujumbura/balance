var BaseTable = require('./base_table');

class TransactionTable extends BaseTable {
	constructor() {
		super();
	}

	getName() { return 'Transactions'; }

	formEntry(id, proxy) {
		let entry = {
			id: id,
			vendorId: proxy.vendorId,
      enterDate: proxy.enterDate,
		};
		return entry;	
	}

	formProxy(entry) {
		let proxy = {
			id: entry.id,
			vendorId: entry.vendorId,
      enterDate: entry.enterDate,
		};
		return proxy;
	}
  
  findByVendorId(vendorId) {
		let proxys = [];
    this.entries.forEach(entry => {
      if (entry.vendorId === vendorId) {
			  let proxy = this.formProxy(entry);
        proxys.push(proxy);
      }
    });
    return proxys;
  }
}

module.exports = TransactionTable;
