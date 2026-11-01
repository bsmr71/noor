package com.noor.islamicapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

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
    fun showCountdown(title: String, message: String, isOngoing: Boolean) {
        try {
            val pendingIntent = getMainActivityPendingIntent()
            val smallIcon = R.mipmap.ic_launcher

            val builder = NotificationCompat.Builder(reactContext, CHANNEL_COUNTDOWN_ID)
                .setSmallIcon(smallIcon)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_STATUS)
                .setOngoing(isOngoing)
                .setOnlyAlertOnce(true)
                .setShowWhen(false)
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

