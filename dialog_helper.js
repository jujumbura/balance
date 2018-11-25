var io = require('./console_io');
var StateCommand = require('./state_command');
var AbortError = require('./errors').AbortError;
var InputError = require('./errors').InputError;

const Usage = {
	REQUIRED: 'r',
	OPTIONAL: 'o',
	MULTIPLE: 'm',
};

function checkAbort(value) {
	switch (value) {
		case 'quit':
		case 'q':
			throw new AbortError(AbortError.Type.QUIT);
		case 'back':
		case 'b':
			throw new AbortError(AbortError.Type.BACK);
	}
}

function printOptions(message, options) {
	let choiceMessage = '- ' + message + ': ( ';
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
}

async function chooseOption(options) {
	let values = await io.readValues();
	if (values.length != 1) {
		throw new InputError('Expected 1 value');
	} 
	let value = values[0];
	checkAbort(value);

	for (let i = 0; i < options.length; ++i) {
		let option = options[i];
		if ((value === option.label) || 
				value == option.label.charAt(0))  {
			return i;
		}
	}
	throw new InputError('Unknown option: ' + value);
}

function printFields(message, fields) {
	let fieldsMessage = '- ' + message + ': ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		if (field.usage === Usage.REQUIRED) {
			fieldsMessage += field.label;
			fieldsMessage += ' ';
		} else if (field.usage === Usage.OPTIONAL) {
      fieldsMessage += '[';
      fieldsMessage += field.label;
      fieldsMessage += '] ';
		} else if (field.usage === Usage.MULTIPLE) {
      fieldsMessage += '[';
      fieldsMessage += field.label;
      fieldsMessage += ',] ';
    }
	}
	io.writeMessage(fieldsMessage);
}

async function submit() {
	let values = await io.readValues();
	if (values.length < 1) {
		throw new InputError('Expected 1 value');
	}
	let value = values[0];
	checkAbort(value);

	return value;
}

async function submitFields(fields) {
	let values = await io.readValues();
	if (values.length < 1) {
		throw new InputError('Expected at least 1 value');
	}
	let checkValue = values[0];
	checkAbort(checkValue);

	let attrMap = {};
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		let value = null;
		let skip = false;
		if (i < values.length) {
			value = values[i];
			skip = value == '~';
		}
		if (field.usage === Usage.REQUIRED) {
			if (!value || skip) {
				throw new InputError('Field: ' + field.label + ' is required');
			}
			attrMap[field.label] = value;
		}
    else if (field.usage === Usage.OPTIONAL) {
      if (value && !skip) {
        attrMap[field.label] = value;
      }
    }
		else if (field.usage === Usage.MULTIPLE) {
			if (value && !skip) {
				let elems = value.split(',');
				attrMap[field.label] = elems;
			}
		}
	}
	return attrMap;
}

function printObj(message, fields, obj) {
	let objMessage = message + ': ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		let attr = obj[field.label];
		if (field.usage == Usage.REQUIRED) {
			objMessage += attr + ' ';
		} else if (field.usage == Usage.MULTIPLE) {
			if (attr) {
				for (let k = 0; k < attr.length; ++k) {
					objMessage += attr[k];
					if (k < (attr.length - 1)) {
						objMessage += ',';
					} else {
						objMessage += ' ';
					}
				}
			} else {
				objMessage += '~ ';
			}
		}
	}
	io.writeMessage(objMessage);
}

function listObjs(fields, objs) {
	let header = '    ';
  header += '# ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		header += field.label + ' ';
	}
	io.writeMessage(header);

  for (let j = 0; j < objs.length; ++j) {
    let line = '    ';
    line += (j + 1).toString() + ' ';
    for (let i = 0; i < fields.length; ++i) {
      let obj = objs[j];
      let field = fields[i];
      let attr = obj[field.label];
			if (field.usage === Usage.REQUIRED) {
      	line += attr + ' ';
      } else if (field.usage === Usage.OPTIONAL) {
		    if (attr) {
          line += attr;
          line += ' ';
        } else {
          line += '~ ';
        }
      } else if (field.usage === Usage.MULTIPLE) {
				if (attr) {
					for (let k = 0; k < attr.length; ++k) {
						line += attr[k];
						if (k < (attr.length - 1)) {
							line += ',';
						} else {
							line += ' ';
						}
					}
				} else {
					line += '~ ';
				}
			}
    }
    io.writeMessage(line);
  }
}

module.exports = {};
module.exports.printOptions = printOptions;
module.exports.chooseOption = chooseOption;
module.exports.printFields = printFields;
module.exports.submit = submit;
module.exports.submitFields = submitFields;
module.exports.printObj = printObj;
module.exports.listObjs = listObjs;
module.exports.Usage = Usage;
