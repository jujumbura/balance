var BaseTable = require('./base_table');

class ItemTable extends BaseTable {
	constructor() {
		super();
	}

	getName() { return 'Items'; }

	formEntry(id, proxy) {
		let entry = {
			id: id,
			productId: proxy.productId,
      quantity: proxy.quantity,
      remain: proxy.remain,
      acquireDate: proxy.acquireDate,
      disposeDate: proxy.disposeDate,
		};
		return entry;	
	}

	formProxy(entry) {
		let proxy = {
			id: entry.id,
			productId: entry.productId,
      quantity: entry.quantity,
      remain: entry.remain,
      acquireDate: entry.acquireDate,
      disposeDate: entry.disposeDate,
		};
		return proxy;
	}
  
  findByProductId(productId) {
		let proxys = [];
    this.entries.forEach(entry => {
      if (entry.productId === productId) {
			  let proxy = this.formProxy(entry);
        proxys.push(proxy);
      }
    });
    return proxys;
  }
}

module.exports = ItemTable;
