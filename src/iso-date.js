const parseIsoDate = str => {
  const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/;
  const months = [
    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const [, year, month, day, time] = regex.exec(str) || [];
  const monthNum = parseInt(month);
  const monthName = months[monthNum];
  const dayNum = parseInt(day);

  // 2 Jan 2020 14:24 UTC"
  return `${dayNum} ${monthName} ${year} ${time} UTC`;
}

module.exports = parseIsoDate;
