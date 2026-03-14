package com.tizitracker.healthsync.data

import com.tizitracker.healthsync.model.SyncRecord
import com.tizitracker.healthsync.model.WorkoutSessionData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class SyncState(
    val lastSyncTime: Long? = null,
    val syncedCount: Int = 0,
    val pendingCount: Int = 0,
    val isSyncing: Boolean = false,
    val error: String? = null
)

class SyncManager(
    private val firebaseRepository: FirebaseRepository,
    private val healthConnectRepository: HealthConnectRepository,
    private val syncRecordDao: SyncRecordDao
) {
    private val _syncState = MutableStateFlow(SyncState())
    val syncState: StateFlow<SyncState> = _syncState.asStateFlow()

    /**
     * Runs a full sync: fetch completed workouts from Firestore, diff against synced IDs,
     * write unsynced workouts to Health Connect, mark them as synced in Room.
     */
    suspend fun syncNow(): Result<SyncResult> = runCatching {
        _syncState.value = _syncState.value.copy(isSyncing = true, error = null)
        try {
            if (!firebaseRepository.isSignedIn) {
                return@runCatching SyncResult(0, 0, "Not signed in")
            }
            if (!healthConnectRepository.isAvailable()) {
                return@runCatching SyncResult(0, 0, "Health Connect not available")
            }
            if (!healthConnectRepository.hasAllPermissions()) {
                return@runCatching SyncResult(0, 0, "Health Connect permissions not granted")
            }

            val profileResult = firebaseRepository.getUserProfile().getOrElse {
                return@runCatching SyncResult(0, 0, "Failed to load profile: ${it.message}")
            }
            val profile = profileResult ?: return@runCatching SyncResult(0, 0, "No profile data")
            val completed = profile.history.filter { it.completed }.sortedByDescending { it.startTime }
            val syncedIds = syncRecordDao.getSyncedIdsOnce().toSet()
            val toSync = completed.filter { it.id !in syncedIds }

            var written = 0
            for (workout in toSync) {
                val calories = CalorieEstimator.estimateCalories(workout, profile.unit)
                healthConnectRepository.writeWorkout(workout, calories, profile.unit)
                    .onSuccess {
                        syncRecordDao.insert(SyncRecord(workout.id, System.currentTimeMillis()))
                        written++
                    }
                    .onFailure { throw it }
            }

            val lastSync = syncRecordDao.getLastSyncTime()
            _syncState.value = _syncState.value.copy(
                isSyncing = false,
                lastSyncTime = lastSync,
                syncedCount = syncedIds.size + written,
                pendingCount = (completed.size - syncedIds.size - written).coerceAtLeast(0),
                error = null
            )
            SyncResult(written, completed.size, null)
        } catch (e: Exception) {
            _syncState.value = _syncState.value.copy(
                isSyncing = false,
                error = e.message ?: "Sync failed"
            )
            SyncResult(0, 0, e.message)
        }
    }

    suspend fun refreshState() {
        if (!firebaseRepository.isSignedIn) {
            _syncState.value = SyncState()
            return
        }
        val completed = firebaseRepository.getCompletedWorkouts().getOrNull() ?: emptyList()
        val syncedIds = syncRecordDao.getSyncedIdsOnce().toSet()
        val lastSync = syncRecordDao.getLastSyncTime()
        _syncState.value = _syncState.value.copy(
            lastSyncTime = lastSync,
            syncedCount = (completed.map { it.id }.toSet() intersect syncedIds).size,
            pendingCount = completed.count { it.id !in syncedIds },
            error = null
        )
    }

    fun getRecentSyncs() = syncRecordDao.getRecentSyncs(20)
}

data class SyncResult(
    val written: Int,
    val totalCompleted: Int,
    val error: String?
)
