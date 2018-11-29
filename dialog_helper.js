var io = require('./console_io');
var StateCommand = require('./state_command');
var AbortError = require('./errors').AbortError;
var InputError = require('./errors').InputError;

const Usage = {
	REQUIRED: 'r',
	OPTIONAL: 'o',
	MULTIPLE: 'm',
};

const Type = {
  STRING: 's',
  NUMBER: 'n',
  DATE: 'd',
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

function parseField(field, value) {
  if (field.type == Type.NUMBER) {
    let attr = parseFloat(value);
    if (!isFinite(attr)) {
      throw new InputError('Invalid number: ' + value);
    }
    return attr;
  } else if (field.type == Type.DATE) {
    let attr = new Date(value);
    if (isNaN(attr)) {
      throw new InputError('Invalid date: ' + value);
    }
    return attr;
  } else {
    return value;
  }
}

function formatAttr(field, attr) {
  if (field.type == Type.DATE) {
    let date = attr;
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let dateStr = `${month}/${day}/${year}`;
    let hourStr = date.getHours();
    let minuteStr = date.getMinutes().toString().padStart(2, '0');
    let str = `${dateStr} ${hourStr}:${minuteStr}`;
    return str;
  } else {
    return attr.toString();
  }
}

function formatProxy(fields, proxy) {
  let str = '';
  for (let i = 0; i < fields.length; ++i) {
    let field = fields[i];
    let attr = proxy[field.label];
    let attrStr = null;
    if (field.usage === Usage.REQUIRED) {
      attrStr = formatAttr(field, attr);
    } else if (field.usage === Usage.OPTIONAL) {
      if (typeof(attr) !== 'undefined') {
        attrStr = formatAttr(field, attr);
      } else {
        attrStr = '~';
      }
    } else if (field.usage === Usage.MULTIPLE) {
      if (attr) {
        // TODO: use format attr here?
        attrStr = '';
        for (let k = 0; k < attr.length; ++k) {
          attrStr += attr[k];
          if (k < (attr.length - 1)) {
            attrStr += ',';
          } else {
            attrStr += ' ';
          }
        }
      } else {
        attrStr = '~';
      }
    }
    if (field.width) {
      str += attrStr.padEnd(field.width, ' ');
    } else {
      str += attrStr + ' ';
    }
  }
  return str;
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
			attrMap[field.label] = parseField(field, value);
		}
    else if (field.usage === Usage.OPTIONAL) {
      if (value && !skip) {
        attrMap[field.label] = parseField(field, value);
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

function printProxy(message, fields, proxy) {
	let proxyMessage = message + ': ';
	proxyMessage += formatProxy(fields, proxy);
  io.writeMessage(proxyMessage);
}

function listProxys(fields, proxys) {
	let header = '    ';
  header += '#   ';
	for (let i = 0; i < fields.length; ++i) {
		let field = fields[i];
		header += field.label.padEnd(field.width, ' ');
	}
	io.writeMessage(header);

  for (let j = 0; j < proxys.length; ++j) {
    let line = '    ';
    let proxy = proxys[j];
    line += (j + 1).toString().padEnd(4, ' ');
    line += formatProxy(fields, proxy);
    io.writeMessage(line);
  }
}

module.exports = {};
module.exports.printOptions = printOptions;
module.exports.chooseOption = chooseOption;
module.exports.printFields = printFields;
module.exports.submit = submit;
module.exports.submitFields = submitFields;
module.exports.printProxy = printProxy;
module.exports.listProxys = listProxys;
module.exports.Usage = Usage;
module.exports.Type = Type;
