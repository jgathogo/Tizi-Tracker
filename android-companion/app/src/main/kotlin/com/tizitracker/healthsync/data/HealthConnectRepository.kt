package com.tizitracker.healthsync.data

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.units.Energy
import com.tizitracker.healthsync.model.WorkoutSessionData
import java.time.Instant
import java.time.ZoneOffset

class HealthConnectRepository(
    private val context: Context
) {
    private val healthConnectClient: HealthConnectClient? by lazy {
        if (HealthConnectClient.getSdkStatus(context, HEALTH_CONNECT_PACKAGE) == HealthConnectClient.SDK_AVAILABLE) {
            HealthConnectClient.getOrCreate(context)
        } else null
    }

    fun isAvailable(): Boolean = healthConnectClient != null

    fun getRequiredPermissions(): Set<HealthPermission> = setOf(
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
        HealthPermission.getWritePermission(ExerciseSessionRecord::class),
        HealthPermission.getWritePermission(TotalCaloriesBurnedRecord::class)
    )

    suspend fun hasAllPermissions(): Boolean {
        val client = healthConnectClient ?: return false
        val granted = client.permissionController.getGrantedPermissions()
        return granted.containsAll(getRequiredPermissions())
    }

    /**
     * Maps a Tizi WorkoutSessionData to Health Connect ExerciseSessionRecord and optionally
     * TotalCaloriesBurnedRecord, then inserts them.
     */
    suspend fun writeWorkout(
        workout: WorkoutSessionData,
        estimatedCalories: Int,
        unit: String
    ): Result<Unit> = runCatching {
        val client = healthConnectClient ?: throw IllegalStateException("Health Connect not available")
        val endTimeMs = workout.endTime ?: (workout.startTime + 30 * 60 * 1000L)
        val startInstant = Instant.ofEpochMilli(workout.startTime)
        val endInstant = Instant.ofEpochMilli(endTimeMs)
        val zoneOffset = ZoneOffset.systemDefault()

        val exerciseType = mapExerciseType(workout)
        val title = workoutTitle(workout)

        val metadata = Metadata.manualEntry(
            device = Device(type = Device.TYPE_PHONE)
        )

        val exerciseRecord = ExerciseSessionRecord(
            startTime = startInstant,
            startZoneOffset = zoneOffset,
            endTime = endInstant,
            endZoneOffset = zoneOffset,
            metadata = metadata,
            exerciseType = exerciseType,
            title = title,
            notes = workout.notes.ifBlank { null },
            segments = emptyList(),
            laps = emptyList(),
            exerciseRoute = null,
            plannedExerciseSessionId = null
        )
        client.insertRecords(listOf(exerciseRecord))

        if (estimatedCalories > 0) {
            val energy = Energy.kilocalories(estimatedCalories.toDouble())
            val caloriesRecord = TotalCaloriesBurnedRecord(
                startTime = startInstant,
                startZoneOffset = zoneOffset,
                endTime = endInstant,
                endZoneOffset = zoneOffset,
                energy = energy,
                metadata = metadata
            )
            client.insertRecords(listOf(caloriesRecord))
        }
    }

    private fun mapExerciseType(workout: WorkoutSessionData): Int {
        return when (workout.type) {
            "A", "B" -> ExerciseSessionRecord.EXERCISE_TYPE_WEIGHTLIFTING
            "Custom" -> mapCustomExerciseType(workout.customName ?: "")
            else -> ExerciseSessionRecord.EXERCISE_TYPE_WEIGHTLIFTING
        }
    }

    private fun mapCustomExerciseType(customName: String): Int {
        val lower = customName.lowercase()
        return when {
            lower.contains("skip") || lower.contains("rope") -> ExerciseSessionRecord.EXERCISE_TYPE_OTHER_WORKOUT
            lower.contains("run") -> ExerciseSessionRecord.EXERCISE_TYPE_RUNNING
            lower.contains("yoga") -> ExerciseSessionRecord.EXERCISE_TYPE_YOGA
            lower.contains("cardio") || lower.contains("cycle") || lower.contains("bike") -> ExerciseSessionRecord.EXERCISE_TYPE_BIKING
            lower.contains("walk") -> ExerciseSessionRecord.EXERCISE_TYPE_WALKING
            lower.contains("swim") -> ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL
            else -> ExerciseSessionRecord.EXERCISE_TYPE_OTHER_WORKOUT
        }
    }

    private fun workoutTitle(workout: WorkoutSessionData): String {
        return when (workout.type) {
            "A" -> "5x5 Workout A"
            "B" -> "5x5 Workout B"
            "Custom" -> workout.customName ?: "Custom Workout"
            else -> "Workout"
        }
    }

    companion object {
        private const val HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata"
    }
}
