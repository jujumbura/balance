function runChanges(changes) {
  let lastApplyIndex = -1;
  try {
    for (let i = 0; i < changes.length; ++i) {
      let change = changes[i];
      change.apply();
      lastApplyIndex = i;
    }
  } catch (e) {
    for (let i = lastApplyIndex; i >= 0; --i) {
      let change = changes[i];
      change.revert();
    }
    throw e;
  }
}

module.exports = {}
module.exports.runChanges = runChanges;
