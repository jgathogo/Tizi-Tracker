package com.tizitracker.healthsync

import android.app.Application
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.tizitracker.healthsync.data.AppDatabase
import com.tizitracker.healthsync.data.createAppDatabase
import com.tizitracker.healthsync.worker.SyncWorker
import java.util.concurrent.TimeUnit

class TiziHealthSyncApp : Application() {
    val appDatabase: AppDatabase by lazy { createAppDatabase(this) }

    override fun onCreate() {
        super.onCreate()
        schedulePeriodicSync()
    }

    private fun schedulePeriodicSync() {
        val request = PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.HOURS)
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "tizi_health_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            request
        )
    }
}
