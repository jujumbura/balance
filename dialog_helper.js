var io = require('./console_io');
var stateCommand = require('./state_command');

function checkQuit(value) {
	switch (value) {
		case 'quit':
		case 'q':
			return true;
		default:
			return false;
	}
}

function checkBack(value) {
	switch (value) {
		case 'back':
		case 'b':
			return true;
		default:
			return false;
	}
}

async function choose(message) {
	io.writeMessage(message);
	let values = await io.readValues();
	if (values.length != 1) {
		io.writeMessage('Expected 1 value');
		continue;
	}
	let value = values[0];

	let result = null;
	if (checkQuit(value)) {
		let command = new StateCommand(StateCommand.Type.Quit);
		result = {
			command: command
		};
	}
	else if (checkBack(value)) {
		let command = new StateCommand(StateCommand.Type.Back);
		result = {
			command: command
		};
	}
	else {
		result = {
			choice: value
		};
	}
	return result;
}

module.exports = {};
module.exports.choose = choose;
