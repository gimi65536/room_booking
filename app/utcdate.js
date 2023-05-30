import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
dayjs.extend(utcPlugin);

export function getUTCDate(date) {
	// Give "YYYY-mMM-DD hh:mm:ss+N", return "YYYY-MM-DD 00:00:00Z"
	return date.utc(true).hour(0).minute(0).second(0).millisecond(0);
}