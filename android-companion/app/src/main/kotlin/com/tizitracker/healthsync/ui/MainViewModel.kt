package com.tizitracker.healthsync.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.tizitracker.healthsync.TiziHealthSyncApp
import com.tizitracker.healthsync.data.FirebaseRepository
import com.tizitracker.healthsync.data.HealthConnectRepository
import com.tizitracker.healthsync.data.SyncManager
import com.tizitracker.healthsync.data.SyncResult
import com.tizitracker.healthsync.data.SyncState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as TiziHealthSyncApp
    private val firebaseRepository = FirebaseRepository(
        FirebaseAuth.getInstance(),
        FirebaseFirestore.getInstance()
    )
    private val healthConnectRepository = HealthConnectRepository(application)
    private val syncManager = SyncManager(
        firebaseRepository,
        healthConnectRepository,
        app.appDatabase.syncRecordDao()
    )

    val isSignedIn: StateFlow<Boolean> = firebaseRepository.authStateFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), firebaseRepository.isSignedIn)

    val syncState: StateFlow<SyncState> = syncManager.syncState

    private val _hasHealthPermissions = MutableStateFlow(false)
    val hasHealthPermissions: StateFlow<Boolean> = _hasHealthPermissions.asStateFlow()

    val healthConnectAvailable: Boolean
        get() = healthConnectRepository.isAvailable()

    fun getRequiredHealthPermissions() = healthConnectRepository.getRequiredPermissions()

    fun initGoogleSignIn(activity: android.app.Activity) {
        val clientId = activity.getString(com.tizitracker.healthsync.R.string.default_web_client_id)
        if (clientId != "YOUR_WEB_CLIENT_ID") {
            firebaseRepository.initGoogleSignIn(clientId, activity)
        }
    }

    fun getGoogleSignInClient() = firebaseRepository.getGoogleSignInClient()

    fun signInWithIdToken(idToken: String) {
        viewModelScope.launch {
            firebaseRepository.signInWithGoogleIdToken(idToken)
            refreshSyncState()
        }
    }

    fun signOut() {
        firebaseRepository.signOut()
    }

    fun refreshSyncState() {
        viewModelScope.launch {
            syncManager.refreshState()
            _hasHealthPermissions.value = healthConnectRepository.hasAllPermissions()
        }
    }

    fun syncNow(onResult: (Result<SyncResult>) -> Unit) {
        viewModelScope.launch {
            val result = syncManager.syncNow()
            onResult(result)
        }
    }

    fun requestHealthConnectPermissions(launcher: androidx.activity.result.ActivityResultLauncher<Set<androidx.health.connect.client.permission.HealthPermission>>) {
        launcher.launch(healthConnectRepository.getRequiredPermissions())
    }
}
