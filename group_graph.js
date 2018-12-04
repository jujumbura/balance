var GraphError = require('./errors').GraphError;

class AddGroupChange {
  constructor(graph, id) { this.graph = graph; this.id = id; }

  check() { this.graph.checkAddGroup_(this.id); }

  execute() { this.graph.executeAddGroup_(this.id); }
}

class RemoveGroupChange {
  constructor(graph, id) { this.graph = graph; this.id = id; }

  check() { this.graph.checkRemoveGroup_(this.id); }

  execute() { this.graph.executeRemoveGroup_(this.id); }
}

class SetParentsChange {
  constructor(graph, childId, parentIds) { 
      this.graph = graph; this.childId = childId; this.parentIds = parentIds; }

  check() { this.graph.checkSetParents_(this.childId, this.parentIds); }

  execute() { this.graph.executeSetParents_(this.childId, this.parentIds); }
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
    let change = new RemoveGroupChange(this, childId, parentIds);
    return change;
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
  
  checkAddGroup_(id) {
		if (this.vertexMap[id]) {
			throw new GraphError('Group already exists in graph');
		}
  }
   
  executeAddGroup_(id) {
		let vertex = {
      id: id,
			parentMap: {},
      childMap: {},
    };
    this.vertexMap[id] = vertex;
  }
  
  checkRemoveGroup_(id) {
		if (!this.vertexMap[id]) {
			throw new GraphError('Group does not exist in graph');
		}
  }

  executeRemoveGroup_(id) {
		this.executeSetParents_(id, []);
    delete this.vertexMap[id];
  }
  
  checkSetParents_(childId, parentIds) {
		if (!this.vertexMap[childId]) {
			throw new GraphError('Child does not exist in graph');
		}
    parentIds.foreach(parentId => {
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
  }

  executeSetParents_(childId, parentIds) {
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
