package com.tizitracker.healthsync

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.health.connect.client.PermissionController
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException
import com.tizitracker.healthsync.ui.MainScreen
import com.tizitracker.healthsync.ui.theme.TiziHealthSyncTheme
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    private val viewModel: com.tizitracker.healthsync.ui.MainViewModel by viewModels()

    private val healthConnectPermissionLauncher = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract()
    ) { granted ->
        if (granted.containsAll(viewModel.getRequiredHealthPermissions())) {
            viewModel.refreshSyncState()
        }
    }

    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            account?.idToken?.let { token ->
                CoroutineScope(Dispatchers.Main).launch {
                    viewModel.signInWithIdToken(token)
                }
            }
        } catch (_: ApiException) {
            // Sign-in failed or cancelled
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.initGoogleSignIn(this)
        setContent {
            TiziHealthSyncTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    MainScreen(
                        viewModel = viewModel,
                        onRequestHealthPermissions = {
                            healthConnectPermissionLauncher.launch(viewModel.getRequiredHealthPermissions())
                        },
                        onLaunchGoogleSignIn = {
                            viewModel.getGoogleSignInClient()?.signInIntent?.let { intent ->
                                googleSignInLauncher.launch(intent)
                            }
                        }
                    )
                }
            }
        }
    }
}
