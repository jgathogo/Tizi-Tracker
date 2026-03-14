package com.tizitracker.healthsync.model

import com.google.firebase.firestore.PropertyName

/**
 * Mirrors Tizi Tracker types for Firestore decoding.
 * See Tizi Tracker [types.ts] and Firestore document at users/{uid}.
 */

data class ExerciseSessionData(
    @PropertyName("name") val name: String = "",
    @PropertyName("weight") val weight: Double = 0.0,
    @PropertyName("sets") val sets: List<Double?> = emptyList(),
    @PropertyName("isCustom") val isCustom: Boolean? = null,
    @PropertyName("attempt") val attempt: Long? = null
)

data class WorkoutSessionData(
    @PropertyName("id") val id: String = "",
    @PropertyName("date") val date: String = "",
    @PropertyName("type") val type: String = "",
    @PropertyName("customName") val customName: String? = null,
    @PropertyName("exercises") val exercises: List<ExerciseSessionData> = emptyList(),
    @PropertyName("notes") val notes: String = "",
    @PropertyName("completed") val completed: Boolean = false,
    @PropertyName("startTime") val startTime: Long = 0L,
    @PropertyName("endTime") val endTime: Long? = null
)

data class UserProfileData(
    @PropertyName("currentWeights") val currentWeights: Map<String, Double>? = null,
    @PropertyName("nextWorkout") val nextWorkout: String? = null,
    @PropertyName("history") val history: List<WorkoutSessionData> = emptyList(),
    @PropertyName("unit") val unit: String = "kg",
    @PropertyName("bodyWeight") val bodyWeight: Double? = null,
    @PropertyName("name") val name: String? = null
)
