function runChanges(changes) {
  changes.forEach(change => { change.check(); });
  changes.forEach(change => { change.execute(); });
}

module.exports = {}
module.exports.runChanges = runChanges;
