package com.mindskip.xzs.utility;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.*;

/**
 * @version 3.5.0
 * @description: The type Date time util.
 * @date 2021/12/25 9:45
 */
public class DateTimeUtil {

    private static final Logger logger = LoggerFactory.getLogger(DateTimeUtil.class);
    public static final String APP_TIME_ZONE = "Asia/Shanghai";
    public static final TimeZone CHINA_TIME_ZONE = TimeZone.getTimeZone(APP_TIME_ZONE);
    /**
     * The constant STANDER_FORMAT.
     */
    public static final String STANDER_FORMAT = "yyyy-MM-dd HH:mm:ss";
    /**
     * The constant STANDER_SHORT_FORMAT.
     */
    public static final String STANDER_SHORT_FORMAT = "yyyy-MM-dd";

    /**
     * Add duration date.
     *
     * @param date     the date
     * @param duration the duration
     * @return the date
     */
    public static Date addDuration(Date date, Duration duration) {
        Calendar ca = Calendar.getInstance(CHINA_TIME_ZONE);
        ca.setTime(date);
        ca.add(Calendar.SECOND, (int) duration.getSeconds());
        return ca.getTime();
    }

    /**
     * Date format string.
     *
     * @param date the date
     * @return the string
     */
    public static String dateFormat(Date date) {
        if (null == date) {
            return "";
        }
        DateFormat dateFormat = formatter(STANDER_FORMAT);
        return dateFormat.format(date);
    }

    /**
     * Date short format string.
     *
     * @param date the date
     * @return the string
     */
    public static String dateShortFormat(Date date) {
        if (null == date) {
            return "";
        }
        DateFormat dateFormat = formatter(STANDER_SHORT_FORMAT);
        return dateFormat.format(date);
    }

    public static String dateFormat(Date date, String format) {
        if (null == date) {
            return "";
        }
        return formatter(format).format(date);
    }

    /**
     * Parse date.
     *
     * @param dateStr the date str
     * @param format  the format
     * @return the date
     */
    public static Date parse(String dateStr, String format) {
        try {
            return formatter(format).parse(dateStr);
        } catch (ParseException e) {
            logger.error(e.getMessage(), e);
        }
        return null;
    }

    /**
     * Gets month start day.
     *
     * @return the month start day
     */
    public static Date getMonthStartDay() {
        SimpleDateFormat formatter = formatter("yyyy-MM-dd 00:00:00");
        Calendar cale = Calendar.getInstance(CHINA_TIME_ZONE);
        cale.add(Calendar.MONTH, 0);
        cale.set(Calendar.DAY_OF_MONTH, 1);
        String dateStr = formatter.format(cale.getTime());
        return parse(dateStr, "yyyy-MM-dd HH:mm:ss");
    }

    /**
     * Gets month end day.
     *
     * @return the month end day
     */
    public static Date getMonthEndDay() {
        SimpleDateFormat formatter = formatter("yyyy-MM-dd 23:59:59");
        Calendar cale = Calendar.getInstance(CHINA_TIME_ZONE);
        cale.add(Calendar.MONTH, 1);
        cale.set(Calendar.DAY_OF_MONTH, 0);
        String dateStr = formatter.format(cale.getTime());
        return parse(dateStr, STANDER_FORMAT);
    }

    /**
     * Moth start to now format list.
     *
     * @return the list
     */
    public static List<String> MothStartToNowFormat() {
        Date startTime = getMonthStartDay();
        Calendar nowCalendar = Calendar.getInstance(CHINA_TIME_ZONE);
        nowCalendar.setTime(new Date());
        int mothDayCount = nowCalendar.get(Calendar.DAY_OF_MONTH);
        List<String> mothDays = new ArrayList<>(mothDayCount);
        Calendar startCalendar = new GregorianCalendar(CHINA_TIME_ZONE);
        startCalendar.setTime(startTime);
        SimpleDateFormat formatter = formatter("yyyy-MM-dd");
        mothDays.add(formatter.format(startTime));
        for (int i = 0; i < mothDayCount - 1; i++) {
            startCalendar.add(Calendar.DATE, 1);
            Date end_date = startCalendar.getTime();
            mothDays.add(formatter.format(end_date));
        }
        return mothDays;
    }

    /**
     * Moth day list.
     *
     * @return the list
     */
    public static List<String> MothDay() {
        Calendar endCalendar = Calendar.getInstance(CHINA_TIME_ZONE);
        endCalendar.setTime(getMonthEndDay());
        int endMothDay = endCalendar.get(Calendar.DAY_OF_MONTH);
        List<String> list = new ArrayList<>(endMothDay);
        for (int i = 1; i <= endMothDay; i++) {
            list.add(String.valueOf(i));
        }
        return list;
    }

    private static SimpleDateFormat formatter(String format) {
        SimpleDateFormat formatter = new SimpleDateFormat(format);
        formatter.setTimeZone(CHINA_TIME_ZONE);
        return formatter;
    }
}
