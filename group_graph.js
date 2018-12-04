var GraphError = require('./errors').GraphError;

class AddGroupChange {
  constructor(graph, id) { this.graph = graph; this.id = id; }

  apply() { this.graph.addGroup_(this.id); }

  revert() { this.table.removeGroup_(this.id); }
}

class RemoveGroupChange {
  constructor(graph, id) { this.graph = graph; this.id = id; }

  apply() { this.graph.removeGroup_(this.id); }

  revert() { this.table.addGroup_(this.id); }
}

class SetParentsChange {
  constructor(graph, childId, oldParentIds, newParentIds) { 
      this.graph = graph; this.childId = childId; 
      this.oldParentIds = oldParentIds; this.newParentIds = newParentIds; }

  apply() { this.graph.setParents_(this.childId, this.newParentIds); }

  revert() { this.graph.setParents_(this.childId, this.oldParentIds); }
}

class GroupGraph {
  constructor() {
    this.vertexMap = {}
  }
	
  makeAddGroupChange(id) {
    let change = new AddGroupChange(this, id);
    return change;
	}
  
  makeRemoveGroupChange(id) {
    let change = new RemoveGroupChange(this, id);
    return change;
	}
  
  makeSetParentsChange(childId, parentIds) {
		let oldParentIds = this.getParents(childId);
    let change = new SetParentsChange(this, childId, oldParentIds, newParentIds);
    return change;
	}

  getParents(childId) {
		if (!this.vertexMap[childId]) {
			throw new GraphError('Child does not exist in graph');
		}

    let childVert = this.vertexMap[childId];
    let parentIds = [];
    for (let parentId in childVert.parentMap) {
      parentIds.push(parentId);
    }
    return parentIds;
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
  
  addGroup_(id) {
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
  
  removeGroup_(id) {
		if (!this.vertexMap[id]) {
			throw new GraphError('Group does not exist in graph');
		}
		
    delete this.vertexMap[id];
  }
  
  setParents_(childId, parentIds) {
		if (!this.vertexMap[childId]) {
			throw new GraphError('Child does not exist in graph');
		}
    parentIds.forEach(parentId => {
      if (!this.vertexMap[parentId]) {
        throw new GraphError('Parent does not exist in graph');
      }
      if (this.isChild(parentId, childId)) {
        throw new GraphError('Desired parent already has child');
      }
      if (this.isDescendent(childId, parentId)) {
        throw new GraphError('Desired parent is a descendent of child');
      }
    });
    
    let childVert = this.vertexMap[childId];
		for (let parentId in childVert.parentMap) {
			let parentVert = this.vertexMap[parentId];
			delete parentVert.childMap[childId];
		}
		childVert.parentMap = {};
		
    for (let parentId in childVert.parentMap) {
      let parentVert = this.vertexMap[parentId];
      parentVert.childMap[childId] = childVert;
      childVert.parentMap[parentId] = parentVert;
		}
  }
}

module.exports = GroupGraph;
