package com.noor.islamicapp

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

class PrayerNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val CHANNEL_COUNTDOWN_ID = "noor_prayer_countdown"
        const val CHANNEL_ADZAN_ID = "noor_adzan_alerts"
        const val NOTIFICATION_COUNTDOWN_ID = 1001
        const val NOTIFICATION_ADZAN_ID = 1002
    }

    init {
        createNotificationChannels()
    }

    override fun getName(): String {
        return "PrayerNotification"
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager =
                reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

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

            // Channel 2: Adzan Arrived (High priority alert)
            val adzanChannel = NotificationChannel(
                CHANNEL_ADZAN_ID,
                "Panggilan Adzan & Sholat Tiba",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifikasi saat waktu sholat dan adzan tiba"
                setShowBadge(true)
                enableVibration(true)
            }

            notificationManager.createNotificationChannel(countdownChannel)
            notificationManager.createNotificationChannel(adzanChannel)
        }
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
                setTextViewText(R.id.notif_expanded_prayer_time, "Pukul $validTime WIB")
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
            val pendingIntent = getMainActivityPendingIntent()
            val smallIcon = R.mipmap.ic_launcher

            val title = "Waktu Sholat $prayerName Telah Tiba!"
            val message = "Panggilan sholat $prayerName ($prayerTime WIB) untuk wilayah $cityName dan sekitarnya."

            val builder = NotificationCompat.Builder(reactContext, CHANNEL_ADZAN_ID)
                .setSmallIcon(smallIcon)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)

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

