var io = require('./console_io');
var StateCommand = require('./state_command');

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

async function choose(message, options) {
	let choiceMessage = message + ': ( ';
	for (let i = 0; i < options.length; ++i) {
		let option = options[i];
		choiceMessage += option.label;
		if (i < options.length - 1) {
			choiceMessage += ', ';
		} else {
			choiceMessage += ' )';
		}
	}
	io.writeMessage(choiceMessage);

	let result = null;
	let values = await io.readValues();
	if (values.length != 1) {
		io.writeMessage('Expected 1 value');
		return {};
	} 

	let value = values[0];
	if (checkQuit(value)) {
		let command = new StateCommand(StateCommand.Type.Quit);
		return { command: command };
	}
	if (checkBack(value)) {
    let command = new StateCommand(StateCommand.Type.Back);
		return { command: command };
	}

	for (let i = 0; i < options.length; ++i) {
		let option = options[i];
		if ((value === option.label) || 
				value == option.label.charAt(0))  {
			return { choice: i };
		}
	}
  io.writeMessage('Unknown option: ' + value);
	return {};
}

async function submit(message, fields) {
	let addMessage = message + ': ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		if (field.usage == 'r') {
			addMessage += field.label;
			addMessage += ' ';
		}
	}
	io.writeMessage(addMessage);

	let values = await io.readValues();
	
	if (values.length < 1) {
		io.writeMessage('-Expected at least 1 value');
		return {};
	}

	let checkValue = values[0];
	if (checkQuit(checkValue)) {
		let command = new StateCommand(StateCommand.Type.Quit);
		return { command: command };
	}
	if (checkBack(checkValue)) {
		let command = new StateCommand(StateCommand.Type.Back);
		return { command: command };
	}

	let fieldValues = [];
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		if (field.usage == 'r') {
			let value = null;
			let skip = false;
			if (i < values.length) {
				value = values[i];
				skip = value == '~';
			}
			if (!value || skip) {
				io.writeMessage('-Field: ' + field.label + ' is required');
				return {};
			}

			fieldValues[i] = values[i];
		}
	}
	return { fieldValues: fieldValues };
}

function list(message, fields, descs) {
	io.writeMessage(message);

	let header = '# ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		header += field.label + ' ';
	}
	io.writeMessage(header);
}

module.exports = {};
module.exports.choose = choose;
module.exports.submit = submit;
