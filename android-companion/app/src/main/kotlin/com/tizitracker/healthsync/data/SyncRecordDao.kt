package com.tizitracker.healthsync.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.tizitracker.healthsync.model.SyncRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface SyncRecordDao {
    @Query("SELECT workoutId FROM sync_records")
    fun getAllSyncedIds(): Flow<List<String>>

    @Query("SELECT workoutId FROM sync_records")
    suspend fun getSyncedIdsOnce(): List<String>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: SyncRecord)

    @Query("SELECT * FROM sync_records ORDER BY syncedAt DESC LIMIT :limit")
    fun getRecentSyncs(limit: Int): Flow<List<SyncRecord>>

    @Query("SELECT syncedAt FROM sync_records ORDER BY syncedAt DESC LIMIT 1")
    suspend fun getLastSyncTime(): Long?
}
