package com.noor.islamicapp

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import java.io.File

class PrayerAlarmReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_ALARM_PRAYER = "com.noor.islamicapp.ALARM_PRAYER"
        const val ACTION_STOP_ADZAN = "com.noor.islamicapp.STOP_ADZAN"
        const val EXTRA_PRAYER_NAME = "prayer_name"
        const val EXTRA_PRAYER_KEY = "prayer_key"
        const val EXTRA_PRAYER_TIME = "prayer_time"
        const val EXTRA_CITY_NAME = "city_name"
        const val EXTRA_MUADZIN_ID = "muadzin_id"

        private var activePlayer: MediaPlayer? = null
        private var wakeLock: PowerManager.WakeLock? = null

        fun stopAdzan() {
            try {
                activePlayer?.stop()
                activePlayer?.release()
                activePlayer = null
            } catch (e: Exception) {
                e.printStackTrace()
            }
            try {
                if (wakeLock?.isHeld == true) {
                    wakeLock?.release()
                }
                wakeLock = null
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_STOP_ADZAN) {
            stopAdzan()
            try {
                NotificationManagerCompat.from(context).cancel(PrayerNotificationModule.NOTIFICATION_ADZAN_ID)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return
        }

        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            PrayerNotificationModule.rescheduleSavedAlarms(context)
            return
        }

        val prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: "Sholat"
        val prayerKey = intent.getStringExtra(EXTRA_PRAYER_KEY) ?: "ashar"
        val prayerTime = intent.getStringExtra(EXTRA_PRAYER_TIME) ?: ""
        val cityName = intent.getStringExtra(EXTRA_CITY_NAME) ?: "Jakarta"
        val muadzinId = intent.getStringExtra(EXTRA_MUADZIN_ID) ?: "mulla"

        // 1. Acquire WakeLock for 3.5 minutes so phone CPU stays awake while playing adzan
        try {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "Noor::PrayerAdzanWakeLock"
            ).apply {
                setReferenceCounted(false)
                acquire(210000L) // 3.5 mins
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 2. Play Adzan Audio
        playAdzanAudio(context, muadzinId, prayerKey)

        // 3. Show Heads-Up Notification & Alarm
        showAdzanNotification(context, prayerName, cityName, prayerTime, muadzinId)

        // 4. Reschedule upcoming prayers
        PrayerNotificationModule.rescheduleSavedAlarms(context)
    }

    private fun playAdzanAudio(context: Context, muadzinId: String, prayerKey: String) {
        stopAdzan()
        try {
            var targetMuadzin = muadzinId
            if (prayerKey == "subuh") {
                if (muadzinId == "muzammil") targetMuadzin = "muzammil_fajr"
                else if (muadzinId == "salim_bahanan") targetMuadzin = "salim_bahanan_fajr"
                else if (muadzinId == "syam_elmarusy") targetMuadzin = "syam_elmarusy_fajr"
            }

            val offlineFile = File(context.filesDir, "noor_offline/muadzin/$targetMuadzin.mp3")
            val player = if (offlineFile.exists() && offlineFile.length() > 10000) {
                MediaPlayer().apply {
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .build()
                    )
                    setDataSource(offlineFile.absolutePath)
                    prepare()
                }
            } else {
                MediaPlayer.create(context, R.raw.adzan_default)?.apply {
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .build()
                    )
                }
            }

            player?.apply {
                setOnCompletionListener {
                    stopAdzan()
                }
                start()
            }
            activePlayer = player
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun showAdzanNotification(
        context: Context,
        prayerName: String,
        cityName: String,
        prayerTime: String,
        muadzinId: String
    ) {
        try {
            PrayerNotificationModule.ensureChannels(context)

            val openAppIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("from_adzan", true)
                putExtra("prayer_name", prayerName)
                putExtra("prayer_time", prayerTime)
            }
            val openAppPendingIntent = PendingIntent.getActivity(
                context,
                1002,
                openAppIntent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
            )

            val stopIntent = Intent(context, PrayerAlarmReceiver::class.java).apply {
                action = ACTION_STOP_ADZAN
            }
            val stopPendingIntent = PendingIntent.getBroadcast(
                context,
                1003,
                stopIntent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
            )

            val title = "🕌 Waktu Sholat $prayerName Telah Tiba!"
            val timeText = if (prayerTime.isNotEmpty()) " ($prayerTime WIB)" else ""
            val message = "Allahu Akbar! Saatnya menunaikan ibadah sholat $prayerName$timeText untuk wilayah $cityName dan sekitarnya."

            val builder = NotificationCompat.Builder(context, PrayerNotificationModule.CHANNEL_ADZAN_ID)
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

            NotificationManagerCompat.from(context).notify(PrayerNotificationModule.NOTIFICATION_ADZAN_ID, builder.build())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
