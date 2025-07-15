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
    name : pred?.tableData[0]?.subject,
    id : pred?.tableData[0]?.subject,
    type : ROOT,
    value : pred.count,
    children : []
  }

  let uniqueObjects = [];

  pred?.tableData?.forEach( child => {
    let newChild = { name : getName(child.object), id : child.object, type : OBJECT};

    let getExistingObject = uniqueObjects?.find( c => c.id === child.object );
    if ( getExistingObject ) {
      // Object already exists, just add it to the predicate's children
      let getExistingPredicate = data.children?.find( c => c.id === child.predicate );
      if ( getExistingPredicate ) {
        getExistingPredicate.children.push(newChild)
      }
    } else {
      // New object, add it to uniqueObjects and process normally
      uniqueObjects.push(newChild);
      
      let getExistingPredicate = data?.children?.find( c => c.id === child.predicate );
      if ( getExistingPredicate ) {
        getExistingPredicate.children.push(newChild)
      } else {
        let newPredicate = {
          name : getName(child.predicate),
          id : child.predicate,
          type : PREDICATE,
          children : [newChild]
        }

        data.children.push(newPredicate)
      }
    }
  })

  return data;
}
