class DataError extends Error {
}

class TableError extends DataError {
	constructor(message) {
		super(message);
	}
}

class GraphError extends DataError {
	constructor(message) {
		super(message);
	}
}

module.exports = {};
module.exports.DataError = DataError;
module.exports.TableError = TableError;
module.exports.GraphError = GraphError;
