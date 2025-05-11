import dayjs from 'dayjs';

export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function capitalize(name: string) {
  return String(name).charAt(0).toUpperCase() + String(name).slice(1);
}

export const dateHelper = (date: any) => {
  return dayjs(date).format('YYYY/MM/DD');
};
export const timeHelper = (time: any) => {
  return dayjs(time).format('HH:mm');
};

export const getTimeOffset = () => {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;

  return offsetHours;
};

export const timeFormat = (time: string, offest?: boolean) => {
  if (offest) {
    const date = new Date(time);
    const offsetHours = getTimeOffset();

    // Adjust the date by adding the offset in milliseconds
    const adjustedDate = new Date(
      date.getTime() + offsetHours * 60 * 60 * 1000,
    );

    return dayjs(adjustedDate.toISOString()).format('MMM DD, YYYY hh:mm A');
  }
  return dayjs(time).format('MMM DD, YYYY hh:mm A');
};
