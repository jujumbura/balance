class InputError extends Error {
	constructor(message) {
		super(message);
	}
}

const AbortType = {
	BACK: 'back',
	QUIT: 'quit',
};
class AbortError extends Error {
	constructor(type) {
		super('User aborted sequence');
		this.type = type;
	}
}
AbortError.Type = AbortType;

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
module.exports.InputError = InputError;
module.exports.AbortError = AbortError;
module.exports.DataError = DataError;
module.exports.TableError = TableError;
module.exports.GraphError = GraphError;
