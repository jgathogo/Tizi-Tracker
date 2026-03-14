package com.tizitracker.healthsync.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.tizitracker.healthsync.model.SyncRecord

@Database(entities = [SyncRecord::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun syncRecordDao(): SyncRecordDao
}

fun createAppDatabase(context: Context): AppDatabase =
    Room.databaseBuilder(
        context.applicationContext,
        AppDatabase::class.java,
        "tizi_health_sync_db"
    ).build()
