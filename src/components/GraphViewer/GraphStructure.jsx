export const OBJECT = "object";
export const PREDICATE = "predicate";
export const SUBJECT = "subject";
export const ROOT = "root";

// TODO : Temporary until we get real data for predicates, right now parsing to make URLs
// fit on Graph
const getName = (nodeName) => {
  let name = nodeName

  if ( name == undefined ) {
    return "name";
  }

  return name;
}

export const getGraphStructure = (pred) => {
  let data = {
    name : pred.title,
    id : pred.title,
    type : ROOT,
    value : pred.count,
    children : []
  }

  let uniqueObjects = [];

  pred?.tableData?.forEach( child => {
    let newChild = { name : getName(child.subject), id : child.subject, type : SUBJECT};

    let getExistingObject = uniqueObjects?.find( c => c.id === child.object );
    if ( getExistingObject ) {
      let getExistingPredicate = getExistingObject.children?.find( c => c.id === child.predicate );
      if ( getExistingPredicate ) {
        getExistingPredicate.children.push(newChild)
      }
    } else {
      let newPredicate = {
        name : getName(child.predicate),
        id : child.predicate,
        type : PREDICATE,
        children : [newChild]
      }

      let newObject = {
        name : getName(child.object),
        id : child.object,
        type : OBJECT,
        children : [newPredicate]
      }

      uniqueObjects.push(newObject)
    }
  })


  if ( uniqueObjects.length > 1 ) {
    data.children = uniqueObjects;
  } else {
    data = uniqueObjects[0];
    data.type = ROOT;
  }

  return data;
}
