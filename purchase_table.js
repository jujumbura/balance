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
      quantity: proxy.quantity,
      price: proxy.price,
      itemId: proxy.itemId,
		};
		return entry;	
	}

	formProxy(entry) {
		let proxy = {
			id: entry.id,
      transactionId: entry.transactionId,
			productId: entry.productId,
      quantity: entry.quantity,
      price: entry.price,
      itemId: entry.itemId,
		};
		return proxy;
	}

 /* 
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
 */ 
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
}

module.exports = PurchaseTable;
