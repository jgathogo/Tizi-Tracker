package com.tizitracker.healthsync.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Tracks which Tizi workout IDs have already been written to Health Connect.
 */
@Entity(tableName = "sync_records")
data class SyncRecord(
    @PrimaryKey val workoutId: String,
    val syncedAt: Long
)
