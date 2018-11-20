class GroupGraph {
  constructor() {
    this.vertexMap = {}
  }

  addGroup(id) {
    let vertex = {
      id: id,
      childMap: {},
    };
    this.vertexMap[id] = vertex;
  }

  addChild(parentId, childId) {
    if (isDescendent(childId, parentId)) {
      throw new GraphError('Desired parent is already descendent of child');
    }

    let parentVert = this.vertexMap[parentId];
    let childVert = this.vertexMap[childId];
    parentVert.childMap[childId] = childVert;
  }

  removeChild(parentId, childId) {
    let parentVert = this.vertexMap[parentId];
    delete parentVert.childMap[childId];
  }

  isDescendent(parentId, checkId) {
    let parentVert = this.vertexMap[parentId];
    for (childId in parentVert.childMap) {
      if (childId === checkId) {
        return true;
      } else {
        let isBelow = this.isDescendent(childId, checkId);
        if (isBelow) {
          return true;
        }
      }
    }
    return false;
  }

  getDescendentSet(parentId) {
    let parentVert = this.vertexMap[parentId];
    let descendentSet = {};
    for (childId in parentVert.childMap) {
      if (descendentSet[childId]) {
        continue;
      }
      let belowSet = this.getDescendentSet(childId);
      let descendentSet = Object.assign(descendentSet, belowSet);
      descendentSet[childId] = true;
    }
    return descendentSet;
  }
}
