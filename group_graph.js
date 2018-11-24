var GraphError = require('./errors').GraphError;

class GroupGraph {
  constructor() {
    this.vertexMap = {}
  }

  addGroup(id) {
		if (this.vertexMap[id]) {
			throw new GraphError('Group already exists in graph');
		}
    
		let vertex = {
      id: id,
			parentMap: {},
      childMap: {},
    };
    this.vertexMap[id] = vertex;
  }
  
  removeGroup(id) {
		if (!this.vertexMap[id]) {
			throw new GraphError('Group does not exist in graph');
		}
  
		this.clearAllParents(id);
    delete this.vertexMap[id];
  }

  relate(parentId, childId) {
		if (!this.vertexMap[parentId]) {
			throw new GraphError('Parent does not exist in graph');
		}
		if (!this.vertexMap[childId]) {
			throw new GraphError('Child does not exist in graph');
		}
		if (this.isChild(parentId, childId)) {
			throw new GraphError('Desired parent already has child');
		}
    if (this.isDescendent(childId, parentId)) {
      throw new GraphError('Desired parent is a descendent of child');
    }

    let parentVert = this.vertexMap[parentId];
    let childVert = this.vertexMap[childId];
    parentVert.childMap[childId] = childVert;
		childVert.parentMap[parentId] = parentVert;
  }

  clearAllParents(childId) {
		if (!this.vertexMap[childId]) {
			throw new GraphError('Child does not exist in graph');
		}
    
    let childVert = this.vertexMap[childId];
		for (let parentId in childVert.parentMap) {
			let parentVert = this.vertexMap[parentId];
			delete parentVert.childMap[childId];
		}
		childVert.parentMap = {};
  }

  relateParents(childId, parentIds) {
    for (let i = 0; i < parentIds.length; ++i) {
      this.relate(parentIds[i], childId);
    }
  }

	isChild(parentId, checkId) {
		if (!this.vertexMap[parentId]) {
			throw new GraphError('Parent does not exist in graph');
		}

		let parentVert = this.vertexMap[parentId];
    for (let childId in parentVert.childMap) {
			if (childId === checkId) {
				return true;
			}
		}
		return false;
	}

  isDescendent(parentId, checkId) {
  	return this.isDescendentImpl(parentId, checkId, {});
	}

  getDescendentSet(parentId) {
  	let descendentSet = {};
		this.getDescendentSetImpl(parentId, descendentSet);
		return descendentSet;
	}

	isDescendentImpl(currentId, checkId, visitedSet) {
		visitedSet[currentId] = true;
    if (currentId === checkId) {
			return true;
		}
		
		let currentVert = this.vertexMap[currentId];
    for (let childId in currentVert.childMap) {
      if (visitedSet[childId]) {
				continue;
			}
			if (this.isDescendentImpl(childId, checkId, visitedSet)) {
				return true;
			}
    }
    return false;
	}

	getDescendentSetImpl(currentId, visitedSet) {
    visitedSet[currentId] = true;
		
		let currentVert = this.vertexMap[currentId];
    for (let childId in currentVert.childMap) {
      if (visitedSet[childId]) {
				continue;
			}
			this.getDescendentSetImpl(childId, visitedSet);
    }
	}
}

module.exports = GroupGraph;
