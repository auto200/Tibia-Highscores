export const sortArrayByObjectProperty = (
  array,
  property,
  direction = "desc"
) => {
  if (direction === "asc") {
    return array.sort((a, b) => {
      if (a[property] < b[property]) {
        return -1;
      }
      if (a[property] > b[property]) {
        return 1;
      }
      return 0;
    });
  } else if (direction === "desc") {
    return array.sort((a, b) => {
      if (a[property] > b[property]) {
        return -1;
      }
      if (a[property] < b[property]) {
        return 1;
      }
      return 0;
    });
  }
};
