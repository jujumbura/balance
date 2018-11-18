var io = require('./console_io');
var StateCommand = require('./state_command');

function checkCommonCommands(value) {
	switch (value) {
		case 'quit':
		case 'q':
			return new StateCommand(StateCommand.Type.Quit);
		case 'back':
		case 'b':
			return new StateCommand(StateCommand.Type.Back);
		default:
			return null;
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
	let command = checkCommonCommands(value);
	if (command) { return { command: command } };

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

function printFields(message, fields) {
	let fieldsMessage = message + ': ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		if (field.usage == 'r') {
			fieldsMessage += field.label;
			fieldsMessage += ' ';
		}
	}
	io.writeMessage(fieldsMessage);
}

async function submit() {
	let values = await io.readValues();
	
	if (values.length < 1) {
		io.writeMessage('-Expected 1 value');
		return {};
	}

	let value = values[0];
	let command = checkCommonCommands(value);
	if (command) { return { command: command } };

	return { value: value };
}

async function submitFields(fields) {
	let values = await io.readValues();
	
	if (values.length < 1) {
		io.writeMessage('-Expected at least 1 value');
		return {};
	}

	let checkValue = values[0];
	let command = checkCommonCommands(checkValue);
	if (command) { return { command: command } };

	let attrs = [];
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

			attrs[i] = values[i];
		}
	}
	return { attrs: attrs };
}

function printObj(message, fields, obj) {
	let objMessage = message + ': ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		let attr = obj[field.label];
		objMessage += attr + ' ';
	}
	io.writeMessage(objMessage);
}

function listObjs(message, fields, objs) {
	io.writeMessage(message);

	let header = '# ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		header += field.label + ' ';
	}
	io.writeMessage(header);

  for (let j = 0; j < objs.length; ++j) {
    let line = (j + 1).toString() + ' ';
    for (let i = 0; i < fields.length; ++i) {
      let obj = objs[j];
      let field = fields[i];
      let attr = obj[field.label];
      line += attr + ' ';
    }
    io.writeMessage(line);
  }
}

module.exports = {};
module.exports.choose = choose;
module.exports.printFields = printFields;
module.exports.submit = submit;
module.exports.submitFields = submitFields;
module.exports.printObj = printObj;
module.exports.listObjs = listObjs;
