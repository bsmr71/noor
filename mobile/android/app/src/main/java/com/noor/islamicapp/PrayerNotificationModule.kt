package com.noor.islamicapp

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.util.Calendar

class PrayerNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val CHANNEL_COUNTDOWN_ID = "noor_prayer_countdown"
        const val CHANNEL_ADZAN_ID = "noor_adzan_alerts"
        const val NOTIFICATION_COUNTDOWN_ID = 1001
        const val NOTIFICATION_ADZAN_ID = 1002

        fun ensureChannels(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val notificationManager =
                    context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

                // Channel 1: Countdown (Silent & ongoing in status bar)
                val countdownChannel = NotificationChannel(
                    CHANNEL_COUNTDOWN_ID,
                    "Hitung Mundur Waktu Sholat",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Menampilkan status waktu menuju adzan berikutnya di status bar"
                    setShowBadge(false)
                    enableVibration(false)
                    setSound(null, null)
                }

                // Channel 2: Adzan Arrived (High priority alert & alarm)
                val adzanChannel = NotificationChannel(
                    CHANNEL_ADZAN_ID,
                    "Panggilan Adzan & Sholat Tiba",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Notifikasi saat waktu sholat dan adzan tiba"
                    setShowBadge(true)
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 800, 400, 800, 400, 800)
                    lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
                }

                notificationManager.createNotificationChannel(countdownChannel)
                notificationManager.createNotificationChannel(adzanChannel)
            }
        }

        fun rescheduleSavedAlarms(context: Context) {
            try {
                val prefs = context.getSharedPreferences("noor_alarms", Context.MODE_PRIVATE)
                val isEnabled = prefs.getBoolean("enabled", true)
                if (!isEnabled) return

                val cityName = prefs.getString("cityName", "Jakarta") ?: "Jakarta"
                val muadzinId = prefs.getString("muadzinId", "mulla") ?: "mulla"
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

                val prayerList = listOf(
                    Triple("subuh", "Subuh", 2001),
                    Triple("dzuhur", "Dzuhur", 2002),
                    Triple("ashar", "Ashar", 2003),
                    Triple("maghrib", "Maghrib", 2004),
                    Triple("isya", "Isya", 2005)
                )

                val now = System.currentTimeMillis()

                for ((key, label, requestCode) in prayerList) {
                    val timeStr = prefs.getString("timing_$key", null) ?: continue
                    val parts = timeStr.split(":")
                    if (parts.size < 2) continue
                    val hour = parts[0].toIntOrNull() ?: continue
                    val min = parts[1].toIntOrNull() ?: continue

                    // Calculate target trigger time
                    val cal = Calendar.getInstance().apply {
                        set(Calendar.HOUR_OF_DAY, hour)
                        set(Calendar.MINUTE, min)
                        set(Calendar.SECOND, 0)
                        set(Calendar.MILLISECOND, 0)
                    }

                    // If time has already passed today, schedule for tomorrow
                    if (cal.timeInMillis <= now) {
                        cal.add(Calendar.DAY_OF_YEAR, 1)
                    }

                    val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
                        action = PrayerAlarmReceiver.ACTION_ALARM_PRAYER
                        putExtra(PrayerAlarmReceiver.EXTRA_PRAYER_NAME, label)
                        putExtra(PrayerAlarmReceiver.EXTRA_PRAYER_KEY, key)
                        putExtra(PrayerAlarmReceiver.EXTRA_PRAYER_TIME, timeStr)
                        putExtra(PrayerAlarmReceiver.EXTRA_CITY_NAME, cityName)
                        putExtra(PrayerAlarmReceiver.EXTRA_MUADZIN_ID, muadzinId)
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        requestCode,
                        intent,
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
                    )

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            cal.timeInMillis,
                            pendingIntent
                        )
                    } else {
                        alarmManager.setExact(
                            AlarmManager.RTC_WAKEUP,
                            cal.timeInMillis,
                            pendingIntent
                        )
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        fun cancelAllAlarms(context: Context) {
            try {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                val requestCodes = listOf(2001, 2002, 2003, 2004, 2005)
                for (code in requestCodes) {
                    val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
                        action = PrayerAlarmReceiver.ACTION_ALARM_PRAYER
                    }
                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        code,
                        intent,
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
                    )
                    alarmManager.cancel(pendingIntent)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    init {
        ensureChannels(reactContext)
    }

    override fun getName(): String {
        return "PrayerNotification"
    }

    private fun getMainActivityPendingIntent(): PendingIntent {
        val intent = Intent(reactContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        return PendingIntent.getActivity(reactContext, 0, intent, flags)
    }

    @ReactMethod
    fun schedulePrayerTimes(timings: ReadableMap, cityName: String, muadzinId: String, isEnabled: Boolean) {
        try {
            val context = reactContext.applicationContext
            val prefs = context.getSharedPreferences("noor_alarms", Context.MODE_PRIVATE)
            val editor = prefs.edit()
            editor.putBoolean("enabled", isEnabled)
            editor.putString("cityName", cityName)
            editor.putString("muadzinId", muadzinId)

            val keys = listOf("subuh", "dzuhur", "ashar", "maghrib", "isya")
            for (k in keys) {
                if (timings.hasKey(k)) {
                    editor.putString("timing_$k", timings.getString(k))
                }
            }
            editor.apply()

            if (!isEnabled) {
                cancelAllAlarms(context)
            } else {
                rescheduleSavedAlarms(context)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun stopAdzanAudio() {
        PrayerAlarmReceiver.stopAdzan()
    }

    @ReactMethod
    fun showCountdown(
        title: String,
        message: String,
        isOngoing: Boolean,
        targetTimestampMillis: Double,
        progressPercent: Int,
        prayerName: String?,
        prayerTime: String?,
        cityName: String?,
        timings: ReadableMap?
    ) {
        try {
            val pendingIntent = getMainActivityPendingIntent()
            val smallIcon = R.mipmap.ic_launcher
            val targetTimeLong = targetTimestampMillis.toLong()
            val validCity = cityName ?: "Jakarta"
            val validPrayer = prayerName ?: "Sholat"
            val validTime = prayerTime ?: "14:54"

            val remainingMillis = targetTimeLong - System.currentTimeMillis()
            val chronometerBase = android.os.SystemClock.elapsedRealtime() + remainingMillis

            // 1. Collapsed View
            val collapsedView = RemoteViews(reactContext.packageName, R.layout.notification_prayer_collapsed).apply {
                setTextViewText(R.id.notif_collapsed_title, title)
                setTextViewText(R.id.notif_collapsed_subtitle, message)
                setProgressBar(R.id.notif_collapsed_progress, 100, progressPercent.coerceIn(0, 100), false)
                if (remainingMillis > 0) {
                    setChronometer(R.id.notif_collapsed_chronometer, chronometerBase, "%s", true)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        setChronometerCountDown(R.id.notif_collapsed_chronometer, true)
                    }
                }
            }

            // 2. Expanded View
            val expandedView = RemoteViews(reactContext.packageName, R.layout.notification_prayer_expanded).apply {
                setTextViewText(R.id.notif_expanded_city, "📍 $validCity")
                setTextViewText(R.id.notif_expanded_prayer_name, "Adzan $validPrayer")
                setTextViewText(R.id.notif_expanded_prayer_time, "($validTime WIB)")
                setTextViewText(R.id.notif_expanded_subtitle, message)
                setProgressBar(R.id.notif_expanded_progress, 100, progressPercent.coerceIn(0, 100), false)
                if (remainingMillis > 0) {
                    setChronometer(R.id.notif_expanded_chronometer, chronometerBase, "%s", true)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        setChronometerCountDown(R.id.notif_expanded_chronometer, true)
                    }
                }

                if (timings != null) {
                    if (timings.hasKey("subuh")) setTextViewText(R.id.time_subuh, timings.getString("subuh"))
                    if (timings.hasKey("dzuhur")) setTextViewText(R.id.time_dzuhur, timings.getString("dzuhur"))
                    if (timings.hasKey("ashar")) setTextViewText(R.id.time_ashar, timings.getString("ashar"))
                    if (timings.hasKey("maghrib")) setTextViewText(R.id.time_maghrib, timings.getString("maghrib"))
                    if (timings.hasKey("isya")) setTextViewText(R.id.time_isya, timings.getString("isya"))

                    val nextKey = if (timings.hasKey("nextKey")) timings.getString("nextKey")?.lowercase() else "ashar"
                    val pillMap = mapOf(
                        "subuh" to Pair(R.id.pill_subuh, R.id.time_subuh),
                        "dzuhur" to Pair(R.id.pill_dzuhur, R.id.time_dzuhur),
                        "ashar" to Pair(R.id.pill_ashar, R.id.time_ashar),
                        "maghrib" to Pair(R.id.pill_maghrib, R.id.time_maghrib),
                        "isya" to Pair(R.id.pill_isya, R.id.time_isya)
                    )

                    for ((key, pair) in pillMap) {
                        val (pillId, timeId) = pair
                        if (key == nextKey) {
                            setInt(pillId, "setBackgroundResource", R.drawable.bg_notif_badge_active)
                            setTextColor(timeId, android.graphics.Color.parseColor("#002721"))
                        } else {
                            setInt(pillId, "setBackgroundResource", R.drawable.bg_notif_badge)
                            setTextColor(timeId, android.graphics.Color.WHITE)
                        }
                    }
                }
            }

            val builder = NotificationCompat.Builder(reactContext, CHANNEL_COUNTDOWN_ID)
                .setSmallIcon(smallIcon)
                .setColor(android.graphics.Color.parseColor("#0F3E36"))
                .setColorized(true)
                .setContentTitle(title)
                .setContentText(message)
                .setCustomContentView(collapsedView)
                .setCustomBigContentView(expandedView)
                .setStyle(NotificationCompat.DecoratedCustomViewStyle())
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_STATUS)
                .setOngoing(isOngoing)
                .setOnlyAlertOnce(true)
                .setContentIntent(pendingIntent)

            NotificationManagerCompat.from(reactContext).notify(NOTIFICATION_COUNTDOWN_ID, builder.build())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun showAdzanAlert(prayerName: String, cityName: String, prayerTime: String) {
        try {
            ensureChannels(reactContext)

            val openAppIntent = Intent(reactContext, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("from_adzan", true)
                putExtra("prayer_name", prayerName)
                putExtra("prayer_time", prayerTime)
            }
            val openAppPendingIntent = PendingIntent.getActivity(
                reactContext,
                1002,
                openAppIntent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
            )

            val stopIntent = Intent(reactContext, PrayerAlarmReceiver::class.java).apply {
                action = PrayerAlarmReceiver.ACTION_STOP_ADZAN
            }
            val stopPendingIntent = PendingIntent.getBroadcast(
                reactContext,
                1003,
                stopIntent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
            )

            val title = "🕌 Waktu Sholat $prayerName Telah Tiba!"
            val timeText = if (prayerTime.isNotEmpty()) " ($prayerTime WIB)" else ""
            val message = "Allahu Akbar! Saatnya menunaikan ibadah sholat $prayerName$timeText untuk wilayah $cityName dan sekitarnya."

            val builder = NotificationCompat.Builder(reactContext, CHANNEL_ADZAN_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setDefaults(NotificationCompat.DEFAULT_VIBRATE or NotificationCompat.DEFAULT_LIGHTS)
                .setVibrate(longArrayOf(0, 800, 400, 800, 400, 800))
                .setColor(android.graphics.Color.parseColor("#0F3E36"))
                .setColorized(true)
                .setAutoCancel(true)
                .setContentIntent(openAppPendingIntent)
                .setFullScreenIntent(openAppPendingIntent, true)
                .addAction(android.R.drawable.ic_media_pause, "Hentikan Adzan", stopPendingIntent)
                .addAction(android.R.drawable.ic_menu_view, "Buka Aplikasi", openAppPendingIntent)

            NotificationManagerCompat.from(reactContext).notify(NOTIFICATION_ADZAN_ID, builder.build())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun cancelCountdown() {
        try {
            NotificationManagerCompat.from(reactContext).cancel(NOTIFICATION_COUNTDOWN_ID)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
