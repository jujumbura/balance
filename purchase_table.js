var BaseTable = require('./base_table');

class PurchaseTable extends BaseTable {
	constructor() {
		super();
	}

	getName() { return 'Purchases'; }

	formEntry(id, proxy) {
		let entry = {
			id: id,
      transactionId: proxy.transactionId,
			productId: proxy.productId,
      price: proxy.price,
      quantity: proxy.quantity,
      size: proxy.size,
      itemId: proxy.itemId,
		};
		return entry;	
	}

	formProxy(entry) {
		let proxy = {
			id: entry.id,
      transactionId: entry.transactionId,
			productId: entry.productId,
      price: entry.price,
      quantity: entry.quantity,
      size: entry.size,
      itemId: entry.itemId,
		};
		return proxy;
	}

  findByTransactionId(transactionId) {
		let proxys = [];
    this.entries.forEach(entry => {
      if (entry.transactionId === transactionId) {
			  let proxy = this.formProxy(entry);
        proxys.push(proxy);
      }
    });
    return proxys;
  }
 
  findByItemId(itemId) {
		let proxy = null;
    this.entries.some(entry => {
      if (entry.itemId === itemId) {
			  proxy = this.formProxy(entry);
        return true;
      }
    });
    return proxy;
  }
}

module.exports = PurchaseTable;
