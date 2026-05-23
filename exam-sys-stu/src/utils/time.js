export const APP_TIME_ZONE = 'Asia/Shanghai';

const HAS_TIME_ZONE = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/;

const normalizeChinaInput = value => {
    if (typeof value === 'string' && DATE_TIME_PATTERN.test(value) && !HAS_TIME_ZONE.test(value)) {
        return `${value.replace(' ', 'T')}+08:00`;
    }
    return value;
};

export const chinaDate = value => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    return new Date(normalizeChinaInput(value));
};

export const chinaTimestamp = value => {
    const date = chinaDate(value);
    return date && !Number.isNaN(date.getTime()) ? date.getTime() : null;
};

export const formatChinaDateTime = (value, fallback = '-') => {
    const date = chinaDate(value);
    if (!date || Number.isNaN(date.getTime())) {
        return fallback;
    }

    const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: APP_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(date).reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});

    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
};
