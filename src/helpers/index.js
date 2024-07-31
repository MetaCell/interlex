import {useLocation} from "react-router-dom";

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}


export function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export function getSearchTermsFilter(filtersArray) {
  let attributes = [];
  let values = [];
  let conditions = [];

  filtersArray.forEach(item => {
    attributes.push(item.attribute);
    values.push(item.value);
    conditions.push(item.condition);
  });

  return {
    attribute: attributes.join(", "),
    value: values.join(", "),
    condition: conditions.join(", ")
  };
}
export function formatDate(inputString) {
  // Split the input string to get the second part
  const dateString = inputString.split(' ')[1];
  
  // Parse the date using Date constructor
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  // Extract the components
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[date.getDay()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  
  // Format the date string
  return `${day} ${formattedHours}:${formattedMinutes}${ampm}`;
}
