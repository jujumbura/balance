var io = require('./console_io');
var dialogHelper = require('./dialog_helper');
var logger = require('./logger');
var match = require('./match');
var Usage = require('./dialog_helper').Usage;
var Type = require('./dialog_helper').Type;
var InputError = require('./errors').InputError;
var DataError = require('./errors').DataError;
var StateCommand = require('./state_command');

const Confirm = {
  YES: 'yes',
  NO: 'no',
};
const CONFIRM_OPTIONS = [
  { label: Confirm.YES },
  { label: Confirm.NO },
];

const SELECT_FIELDS = [ 
  { label: 'number', usage: Usage.REQUIRED, type: Type.NUMBER },
];

class BaseState {
	constructor() {
		this.context = null;
	}

	writeHeader(message) {
		io.writeMessage('[' + message + ']');
	}

	writeInfo(message) {
		io.writeMessage('- ' + message);
	}

	writeTransition(message) {
		io.writeMessage('> ' + message);
	}

  writeError(message) {
    io.writeMessage('! ' + message);
  }

  checkIndex(index, array) {
    if (index < 0 || index >= array.length) {
      return false;
    } else {
      return true;
    }
  }

  async checkConfirm() {
    dialogHelper.printOptions('? confirm', CONFIRM_OPTIONS);
    let choice = await dialogHelper.chooseOption(CONFIRM_OPTIONS);
    return choice === Confirm.YES;
  }

  async selectProxy() {
    let proxys = null;
    while (true) {
      try {
				let attrMap = null;
				if (this.filterFields) {
				  dialogHelper.printFields('? filter', this.filterFields);
					let results = await dialogHelper.submitFields(this.filterFields);
          attrMap = results.attrMap;
          if (this.makeFilterCorrectionSpecs) {
            let specs = this.makeFilterCorrectionSpecs();
            attrMap = await this.correctProxy(attrMap, specs);
          }
				}
        proxys = this.filterProxys(attrMap);
        break;
			} catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
			}
    }
   
    let proxy = null;
    if (proxys.length === 1) {
      proxy = proxys[0];
    } else {
      while (true) {
        try {
		      dialogHelper.listProxys(this.displayFields, proxys);
          dialogHelper.printFields('? select', SELECT_FIELDS);
          let results = await dialogHelper.submitFields(SELECT_FIELDS);
          let index = results.attrMap.number - 1;
          if (!this.checkIndex(index, proxys)) { continue }
          proxy = proxys[index];
          break;
        } catch (e) {
          if (e instanceof InputError || e instanceof DataError) {
            this.writeError(e.message);
          } else { throw e; }
        }
      }
    }
    return proxy;
  }

  async correctValue(value, spec) {
    console.log('value: ' + value);
    console.log('spec: ' + JSON.stringify(spec, null, 2));
    
    if (spec.allowed.includes(value)) {
      return value;
    }
    
    let matches = match.findBestMatches(value, spec.allowed, 5);
    if (matches.length <= 0) {
      throw new InputError(spec.label + ' has no matches');
    } else if (matches.length === 1) {
      return matches[0];
    }

    while (true) {
      try {
        io.writeMessage('- clarify ' + spec.label);
        dialogHelper.listValues(matches);
        dialogHelper.printFields('? select', SELECT_FIELDS);
        let results = await dialogHelper.submitFields(SELECT_FIELDS);
        let index = results.attrMap.number - 1;
        if (!this.checkIndex(index, matches)) { continue }
        return matches[index];
        break;
      } catch (e) {
        if (e instanceof InputError || e instanceof DataError) {
          this.writeError(e.message);
        } else { throw e; }
      }
    }
  }

  async correctProxy(proxy, specs) {
    let corrected = Object.assign({}, proxy);

    for (let i = 0; i < specs.length; ++i) {
      let spec = specs[i];
      if (spec.allowed.length <= 0) {
        throw new InputError(spec.label + ' has no allowed values');
      }
      
      let value = corrected[spec.label];
      if (value === null) {
        continue;
      }

      corrected[spec.label] = await this.correctValue(value, spec);
         /* 
      let matches = match.findBestMatches(value, spec.allowed, 5);
      if (matches.length <= 0) {
        throw new InputError(spec.label + ' has no matches');
      } else if (matches.length === 1) {
        corrected[spec.label] = matches[0];
        continue;
      }

      while (true) {
        try {
          io.writeMessage('- clarify ' + spec.label);
          dialogHelper.listValues(matches);
          dialogHelper.printFields('? select', SELECT_FIELDS);
          let results = await dialogHelper.submitFields(SELECT_FIELDS);
          let index = results.attrMap.number - 1;
          if (!this.checkIndex(index, matches)) { continue }
          corrected[spec.label] = matches[index];
          break;
        } catch (e) {
          if (e instanceof InputError || e instanceof DataError) {
            this.writeError(e.message);
          } else { throw e; }
        }
      }
      */
    }
    return corrected;
  }
}

class ChooseState extends BaseState {
	async run() {
		this.writeHeader(this.header);

		let choice = -1;
		while (true) {
			try {
				dialogHelper.printOptions('? choose', this.options);
				choice = await dialogHelper.chooseOption(this.options);
				break;
			} catch (e) {
				if (e instanceof InputError) {
					this.writeError(e.message);
				} else { throw e; }
			}
		}

		this.writeTransition('entering ' + choice);
		let state = this.stateMap[choice];
		return new StateCommand(StateCommand.Type.NEXT, state);
	}
}

class AddState extends BaseState {
  async run () {
		this.writeHeader(this.header);
		
    while (true) {
      try {
        dialogHelper.printFields('? add', this.addFields);
        let results = await dialogHelper.submitFields(this.addFields);
		    let proxy = this.formProxy(results.attrMap);
        if (this.makeCorrectionSpecs) {
          let specs = this.makeCorrectionSpecs();
          proxy = await this.correctProxy(proxy, specs);
        }
        dialogHelper.printProxy('- new', this.displayFields, proxy);
        if (!await this.checkConfirm()) { continue; }
        this.handleAdd(proxy);
        break;
			} catch (e) {
        if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
			}
    }

		return new StateCommand(StateCommand.Type.BACK);
	}
}

class EditState extends BaseState {
	async run () {
		this.writeHeader(this.header);

    let proxy = await this.selectProxy();

    while (true) {
      try {
		    dialogHelper.printProxy('- old', this.displayFields, proxy);
        dialogHelper.printFields('? modify', this.modifyFields, true);
        let results = await dialogHelper.submitFields(this.modifyFields, true);
		    let newProxy = this.formProxy(proxy, results.attrMap, results.skipMap);
        if (this.makeCorrectionSpecs) {
          let specs = this.makeCorrectionSpecs();
          newProxy = await this.correctProxy(newProxy, specs);
        }
        dialogHelper.printProxy('- new', this.displayFields, newProxy);
        if (!await this.checkConfirm()) { continue; }
        this.handleModify(newProxy);
        break;
      } catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
      }
    }

		return new StateCommand(StateCommand.Type.BACK);
	}
}

class RemoveState extends BaseState {
	async run () {
		this.writeHeader(this.header);
	
    let proxy = await this.selectProxy();

    while (true) {
      try {
        dialogHelper.printProxy('- remove', this.removeFields, proxy);
        if (!await this.checkConfirm()) { continue; }
        this.handleRemove(proxy);
        break;
      } catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
					this.writeError(e.message);
				} else { throw e; }
      }
    }

		return new StateCommand(StateCommand.Type.BACK);
	}
}

class ListState extends BaseState {
  async run() {
    this.writeHeader(this.header);
	   
		let proxys = null;
		while (true) {
			try {
				let attrMap = null;
				if (this.filterFields) {
				  dialogHelper.printFields('? filter', this.filterFields);
					let results = await dialogHelper.submitFields(this.filterFields);
          attrMap = results.attrMap;
          if (this.makeFilterCorrectionSpecs) {
            let specs = this.makeFilterCorrectionSpecs();
            attrMap = await this.correctProxy(attrMap, specs);
          }
				}
		  	proxys = this.filterProxys(attrMap);
				break;
			} catch (e) {
				if (e instanceof InputError || e instanceof DataError) {
          this.writeError(e.message);
				} else { throw e; }
			}
		}
      
		dialogHelper.listProxys(this.displayFields, proxys);

		return new StateCommand(StateCommand.Type.BACK);
	}
}

class TargetState extends BaseState {
	async run () {
		this.writeHeader(this.header);
	
    let proxy = await this.selectProxy();
          
    this.handleSelect(proxy);

		this.writeTransition('entering ' + this.nextName);
		return new StateCommand(StateCommand.Type.NEXT, this.nextState);
	}
}

module.exports = {};
module.exports.BaseState = BaseState;
module.exports.ChooseState = ChooseState;
module.exports.AddState = AddState;
module.exports.EditState = EditState;
module.exports.RemoveState = RemoveState;
module.exports.ListState = ListState;
module.exports.TargetState = TargetState;
