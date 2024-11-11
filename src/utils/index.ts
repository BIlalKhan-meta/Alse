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

export const timeFormat = (time: string) => {
  return dayjs(time).format('hh:mm A');
};
