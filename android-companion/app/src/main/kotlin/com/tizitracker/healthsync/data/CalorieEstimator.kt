package com.tizitracker.healthsync.data

import com.tizitracker.healthsync.model.ExerciseSessionData
import com.tizitracker.healthsync.model.WorkoutSessionData

/**
 * Mirrors Tizi Tracker workoutUtils.calculateCalories:
 * - Base: ~5 cal/min
 * - Volume: ~0.1 cal per kg lifted per rep
 */
object CalorieEstimator {
    fun estimateCalories(workout: WorkoutSessionData, unit: String): Int {
        val totalVolume = workout.exercises.sumOf { ex -> volumeForExercise(ex, unit) }
        val durationMinutes = if (workout.endTime != null && workout.startTime > 0) {
            kotlin.math.max(1, ((workout.endTime - workout.startTime) / 1000 / 60).toInt())
        } else 30
        val baseCalories = durationMinutes * 5
        val volumeCalories = totalVolume * 0.1
        return (baseCalories + volumeCalories).toInt()
    }

    private fun volumeForExercise(ex: ExerciseSessionData, unit: String): Double {
        val totalReps = ex.sets.sumOf { (it ?: 0.0).toInt() }
        val weightKg = if (unit == "kg") ex.weight else ex.weight * 0.453592
        return totalReps * weightKg
    }
}
