package com.tizitracker.healthsync.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun MainScreen(
    viewModel: MainViewModel,
    onRequestHealthPermissions: () -> Unit,
    onLaunchGoogleSignIn: () -> Unit
) {
    val isSignedIn by viewModel.isSignedIn.collectAsState(initial = viewModel.isSignedIn.value)
    val syncState by viewModel.syncState.collectAsState()
    val hasHealthPermissions by viewModel.hasHealthPermissions.collectAsState(initial = false)

    if (!isSignedIn) {
        LoginScreen(
            onSignInClick = onLaunchGoogleSignIn
        )
        return
    }

    LaunchedEffect(Unit) {
        viewModel.refreshSyncState()
    }

    Scaffold(
        topBar = {
            TopBar(
                onSignOut = { viewModel.signOut() }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            if (!viewModel.healthConnectAvailable) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Health Connect is not installed or not available. Install from Play Store if needed.",
                        modifier = Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            } else {
                SyncStatusCard(
                    syncState = syncState,
                    onSyncNow = {
                        viewModel.syncNow { result ->
                            result.onFailure { }
                        }
                    },
                    onRequestPermissions = onRequestHealthPermissions,
                    hasPermissions = hasHealthPermissions
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TopBar(onSignOut: () -> Unit) {
    TopAppBar(
        title = { Text("Tizi Health Sync") },
        actions = {
            OutlinedButton(onClick = onSignOut) {
                Text("Sign out")
            }
        }
    )
}

@Composable
private fun SyncStatusCard(
    syncState: com.tizitracker.healthsync.data.SyncState,
    onSyncNow: () -> Unit,
    onRequestPermissions: () -> Unit,
    hasPermissions: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                "Sync status",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            if (!hasPermissions) {
                Text(
                    "Grant Health Connect permissions to sync workouts.",
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = onRequestPermissions) {
                    Text("Grant permissions")
                }
            } else {
                syncState.lastSyncTime?.let { ts ->
                    val dateStr = SimpleDateFormat("MMM d, HH:mm", Locale.getDefault()).format(Date(ts))
                    Text(
                        "Last sync: $dateStr",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                Text(
                    "Synced: ${syncState.syncedCount} • Pending: ${syncState.pendingCount}",
                    style = MaterialTheme.typography.bodyMedium
                )
                syncState.error?.let { err ->
                    Text(
                        err,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                if (syncState.isSyncing) {
                    CircularProgressIndicator(modifier = Modifier.height(24.dp))
                } else {
                    Button(
                        onClick = onSyncNow,
                        enabled = !syncState.isSyncing
                    ) {
                        Text("Sync now")
                    }
                }
            }
        }
    }
}

@Composable
fun LoginScreen(onSignInClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(
                "Tizi Health Sync",
                style = MaterialTheme.typography.headlineMedium
            )
            Text(
                "Sign in with the same Google account you use in Tizi Tracker to sync your completed workouts to Health Connect.",
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center
            )
            Button(
                onClick = onSignInClick
            ) {
                Text("Sign in with Google")
            }
        }
    }
}
