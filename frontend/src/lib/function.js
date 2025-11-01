export function convertDateToDateTimeString(dateObject) {
  const date =
    dateObject.getDate() < 10
      ? "0" + dateObject.getDate()
      : dateObject.getDate();
  const month =
    dateObject.getMonth() < 10
      ? "0" + dateObject.getMonth()
      : dateObject.getMonth();
  const year = dateObject.getFullYear() + 543;

  const hour =
    dateObject.getHours() < 10
      ? "0" + dateObject.getHours()
      : dateObject.getHours();

  const minute =
    dateObject.getMinutes() < 10
      ? "0" + dateObject.getMinutes()
      : dateObject.getMinutes();

  return date + "/" + month + "/" + year + " " + hour + ":" + minute;
}
