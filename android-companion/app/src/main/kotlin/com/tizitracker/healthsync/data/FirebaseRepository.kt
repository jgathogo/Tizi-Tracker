package com.tizitracker.healthsync.data

import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import com.tizitracker.healthsync.model.UserProfileData
import com.tizitracker.healthsync.model.WorkoutSessionData
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
class FirebaseRepository(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore
) {
    private var googleSignInClient: GoogleSignInClient? = null

    fun initGoogleSignIn(serverClientId: String, activity: android.app.Activity) {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(serverClientId)
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(activity, gso)
    }

    fun getGoogleSignInClient(): GoogleSignInClient? = googleSignInClient

    val currentUserId: String?
        get() = auth.currentUser?.uid

    val isSignedIn: Boolean
        get() = auth.currentUser != null

    fun authStateFlow(): Flow<Boolean> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { trySend(it.currentUser != null) }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    suspend fun signInWithGoogleIdToken(idToken: String): Result<Unit> = runCatching {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential).await()
    }.map { }

    fun signOut() {
        auth.signOut()
        googleSignInClient?.signOut()
    }

    /**
     * Fetches the user profile from Firestore (users/{uid}) and returns workout history.
     */
    suspend fun getWorkoutHistory(): Result<List<WorkoutSessionData>> = runCatching {
        val uid = auth.currentUser?.uid ?: throw IllegalStateException("Not signed in")
        val doc = firestore.collection("users").document(uid).get().await()
        val profile = doc.toObject(UserProfileData::class.java)
            ?: return@runCatching emptyList<WorkoutSessionData>()
        profile.history
    }

    /**
     * Returns only completed workouts, in reverse chronological order (newest first).
     */
    suspend fun getCompletedWorkouts(): Result<List<WorkoutSessionData>> = runCatching {
        getWorkoutHistory().getOrThrow()
            .filter { it.completed }
            .sortedByDescending { it.startTime }
    }

    /**
     * Fetches the full user profile from Firestore (for unit and history).
     */
    suspend fun getUserProfile(): Result<UserProfileData?> = runCatching {
        val uid = auth.currentUser?.uid ?: throw IllegalStateException("Not signed in")
        val doc = firestore.collection("users").document(uid).get().await()
        doc.toObject(UserProfileData::class.java)
    }
}
