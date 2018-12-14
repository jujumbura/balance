class InputError extends Error {
	constructor(message) {
		super(message);
	}
}

const AbortType = {
	BACK: 'back',
	QUIT: 'quit',
  MAIN: 'main',
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

class ConversionError extends DataError {
	constructor(message) {
		super(message);
	}
}

class DependencyError extends DataError {
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
module.exports.ConversionError = ConversionError;
module.exports.DependencyError = DependencyError;
