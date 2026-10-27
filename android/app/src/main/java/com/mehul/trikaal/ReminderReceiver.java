package com.mehul.trikaal;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import java.util.Calendar;

/** Daily remedy reminders. Each fires once a day at the set time and shows only on the chosen weekdays. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String CH = "remedies";

    static void channel(Context c) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm.getNotificationChannel(CH) == null) nm.createNotificationChannel(new NotificationChannel(CH, "Remedy reminders", NotificationManager.IMPORTANCE_DEFAULT));
            if (nm.getNotificationChannel("daily") == null) nm.createNotificationChannel(new NotificationChannel("daily", "Daily briefing", NotificationManager.IMPORTANCE_DEFAULT));
            if (nm.getNotificationChannel("transits") == null) nm.createNotificationChannel(new NotificationChannel("transits", "Transit and dasha alerts", NotificationManager.IMPORTANCE_HIGH));
        }
    }

    /* one-time notifications (daily briefings, transit alerts): stored so they survive a reboot */
    static PendingIntent piOnce(Context c, String id, String title, String body, String route, boolean create) {
        Intent i = new Intent(c, ReminderReceiver.class).setAction("trikaal.once." + id);
        i.putExtra("id", id).putExtra("title", title).putExtra("body", body).putExtra("route", route).putExtra("once", true);
        int flags = PendingIntent.FLAG_IMMUTABLE | (create ? PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_NO_CREATE);
        return PendingIntent.getBroadcast(c, ("o" + id).hashCode(), i, flags);
    }

    static void scheduleOnce(Context c, String id, String title, String body, long at, String route) {
        if (at <= System.currentTimeMillis()) return;
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent p = piOnce(c, id, title, body, route, true);
        if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p); else am.set(AlarmManager.RTC_WAKEUP, at, p);
        c.getSharedPreferences("once", Context.MODE_PRIVATE).edit().putString(id, at + "\u0001" + title + "\u0001" + body + "\u0001" + route).apply();
    }

    static void clearOnce(Context c, String prefix) {
        SharedPreferences sp = c.getSharedPreferences("once", Context.MODE_PRIVATE);
        SharedPreferences.Editor ed = sp.edit();
        for (String id : sp.getAll().keySet()) {
            if (!id.startsWith(prefix)) continue;
            PendingIntent p = piOnce(c, id, "", "", "", false);
            if (p != null) { ((AlarmManager) c.getSystemService(Context.ALARM_SERVICE)).cancel(p); p.cancel(); }
            ed.remove(id);
        }
        ed.apply();
    }

    static PendingIntent pi(Context c, String id, String title, String body, String days, boolean create) {
        Intent i = new Intent(c, ReminderReceiver.class).setAction("trikaal.remind." + id);
        i.putExtra("id", id).putExtra("title", title).putExtra("body", body).putExtra("days", days);
        int flags = PendingIntent.FLAG_IMMUTABLE | (create ? PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_NO_CREATE);
        return PendingIntent.getBroadcast(c, id.hashCode(), i, flags);
    }

    static void schedule(Context c, String id, String title, String body, int hour, int minute, String days) {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, hour); cal.set(Calendar.MINUTE, minute); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis()) cal.add(Calendar.DAY_OF_YEAR, 1);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        am.setRepeating(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), AlarmManager.INTERVAL_DAY, pi(c, id, title, body, days, true));
        SharedPreferences sp = c.getSharedPreferences("reminders", Context.MODE_PRIVATE);
        sp.edit().putString(id, title + "\u0001" + body + "\u0001" + hour + "\u0001" + minute + "\u0001" + days).apply();
    }

    static void cancel(Context c, String id) {
        PendingIntent p = pi(c, id, "", "", "", false);
        if (p != null) { ((AlarmManager) c.getSystemService(Context.ALARM_SERVICE)).cancel(p); p.cancel(); }
        c.getSharedPreferences("reminders", Context.MODE_PRIVATE).edit().remove(id).apply();
    }

    @Override
    public void onReceive(Context c, Intent i) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(i.getAction())) {
            SharedPreferences sp = c.getSharedPreferences("reminders", Context.MODE_PRIVATE);
            for (String id : sp.getAll().keySet()) {
                try { String[] v = sp.getString(id, "").split("\u0001", -1); schedule(c, id, v[0], v[1], Integer.parseInt(v[2]), Integer.parseInt(v[3]), v[4]); } catch (Exception e) { }
            }
            SharedPreferences so = c.getSharedPreferences("once", Context.MODE_PRIVATE);
            for (String id : so.getAll().keySet()) {
                try { String[] v = so.getString(id, "").split("\u0001", -1); scheduleOnce(c, id, v[1], v[2], Long.parseLong(v[0]), v[3]); } catch (Exception e) { }
            }
            return;
        }
        if (i.getBooleanExtra("once", false)) {
            String id = i.getStringExtra("id"), route = i.getStringExtra("route");
            c.getSharedPreferences("once", Context.MODE_PRIVATE).edit().remove(id).apply();
            channel(c);
            Intent open = new Intent(c, MainActivity.class).putExtra("route", route == null ? "" : route).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent cp = PendingIntent.getActivity(c, id.hashCode(), open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            String chan = id.startsWith("t|") ? "transits" : "daily";
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, chan) : new Notification.Builder(c);
            String body = i.getStringExtra("body");
            b.setSmallIcon(android.R.drawable.ic_popup_reminder).setContentTitle(i.getStringExtra("title")).setContentText(body).setStyle(new Notification.BigTextStyle().bigText(body)).setContentIntent(cp).setAutoCancel(true);
            ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(id.hashCode(), b.build());
            return;
        }
        String days = i.getStringExtra("days");
        int dow = Calendar.getInstance().get(Calendar.DAY_OF_WEEK) - 1;
        if (days != null && !days.isEmpty()) {
            boolean ok = false;
            for (String d : days.split(",")) if (d.trim().equals(String.valueOf(dow))) ok = true;
            if (!ok) return;
        }
        channel(c);
        Intent open = new Intent(c, MainActivity.class).putExtra("route", "remedies").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent cp = PendingIntent.getActivity(c, 7, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CH) : new Notification.Builder(c);
        b.setSmallIcon(android.R.drawable.ic_popup_reminder).setContentTitle(i.getStringExtra("title")).setContentText(i.getStringExtra("body")).setStyle(new Notification.BigTextStyle().bigText(i.getStringExtra("body"))).setContentIntent(cp).setAutoCancel(true);
        ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(i.getStringExtra("id").hashCode(), b.build());
    }
}
