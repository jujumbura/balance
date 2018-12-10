var prompt = require('prompt');
prompt.message = '';

var logger = require('./logger');

function parseValues(result) {
  let values = [];
  let quoteBegin = -1;
  let strBegin = -1;
  
  const checkEndString = function(i) {
    if (strBegin !== -1) {
      let str = result.substring(strBegin, i);
      values.push(str);
      strBegin = -1;
    }
  }
  
  for (let i = 0; i < result.length; ++i) {
    let c = result.charAt(i);
    if (c === '\"') {
      if (quoteBegin === -1) {
        quoteBegin = i;
      } else {
        checkEndString(i);
        quoteBegin = -1;
      }
    } else {
      if (quoteBegin !== -1) {
        if (strBegin === -1) {
          strBegin = i;
        }
      } else {
        if (c === ' ' || c === '\t' || c === '\n') {
          checkEndString(i);
        } else {
          if (strBegin === -1) {
            strBegin = i;
          }
        }
      }
    }
  }
  checkEndString(result.lengt);

  console.log(values);
  return values;
}

parseValues('Bob bat brown fox');

function getValues() {
	return new Promise(resolve => {
		logger.trace('logger.getValues');
		prompt.get('input', function(err, result) {
			//let values = result.input.split(/\s+/);
      let values = parseValues(result);  
      resolve(values);
		});
	});
}

function writeMessage(message) {
	console.log(message);
}

async function readValues() {
	let values = await getValues();
	return values;
}

module.exports = {}
module.exports.writeMessage = writeMessage;
module.exports.readValues = readValues;
