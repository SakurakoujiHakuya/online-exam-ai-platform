import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const APP_TIME_ZONE = 'Asia/Shanghai';

const HAS_TIME_ZONE = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;

export const chinaDayjs = value => {
    if (!value) {
        return null;
    }
    if (typeof value === 'string' && !HAS_TIME_ZONE.test(value)) {
        return dayjs.tz(value, APP_TIME_ZONE);
    }
    return dayjs(value).tz(APP_TIME_ZONE);
};

export const formatChinaDateTime = (value, fallback = '-') => {
    const date = chinaDayjs(value);
    return date && date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : fallback;
};

export const formatChinaDate = (value, fallback = '-') => {
    const date = chinaDayjs(value);
    return date && date.isValid() ? date.format('YYYY-MM-DD') : fallback;
};
