package com.tizitracker.healthsync.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.tizitracker.healthsync.data.FirebaseRepository
import com.tizitracker.healthsync.data.HealthConnectRepository
import com.tizitracker.healthsync.data.SyncManager
import com.tizitracker.healthsync.data.createAppDatabase

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = runCatching {
        val auth = FirebaseAuth.getInstance()
        if (auth.currentUser == null) return@runCatching Result.success()

        val db = createAppDatabase(applicationContext)
        val firebaseRepository = FirebaseRepository(auth, FirebaseFirestore.getInstance())
        val healthConnectRepository = HealthConnectRepository(applicationContext)

        if (!healthConnectRepository.isAvailable()) return@runCatching Result.success()
        if (!healthConnectRepository.hasAllPermissions()) return@runCatching Result.success()

        val syncManager = SyncManager(
            firebaseRepository,
            healthConnectRepository,
            db.syncRecordDao()
        )
        syncManager.syncNow().getOrThrow()
        Result.success()
    }.getOrElse { Result.failure() }
}
