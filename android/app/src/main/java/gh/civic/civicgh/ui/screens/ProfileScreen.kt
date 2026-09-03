package gh.civic.civicgh.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import gh.civic.civicgh.data.label
import gh.civic.civicgh.ui.CivicViewModel
import gh.civic.civicgh.ui.theme.CivicCard
import gh.civic.civicgh.ui.theme.CivicGreen

@Composable
fun ProfileScreen(vm: CivicViewModel, onOpen: (String) -> Unit) {
    var email by rememberSaveable { mutableStateOf("ama@civicgh.gh") }
    var password by rememberSaveable { mutableStateOf("civic2026") }
    var error by rememberSaveable { mutableStateOf<String?>(null) }
    val user = vm.user

    Column(Modifier.fillMaxSize().padding(20.dp)) {
        if (user == null) {
            Text("Sign in", style = MaterialTheme.typography.headlineSmall)
            Text(
                "Demo citizen: ama@civicgh.gh / civic2026",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            error?.let {
                Spacer(Modifier.height(8.dp))
                Text(it, color = MaterialTheme.colorScheme.error)
            }
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = { error = vm.login(email, password) },
                colors = ButtonDefaults.buttonColors(containerColor = CivicGreen),
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Continue") }
            TextButton(
                onClick = {
                    email = "ama@civicgh.gh"
                    password = "civic2026"
                    error = vm.login(email, password)
                },
            ) { Text("Use demo citizen") }
        } else {
            Text(user.name, style = MaterialTheme.typography.headlineSmall)
            Text(user.email, style = MaterialTheme.typography.bodyMedium)
            Text(if (user.role == "agency") "Agency account" else "Citizen", style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.height(12.dp))
            RowToggle(
                label = "Show my name on reports I file",
                checked = user.recognition == "named",
                onCheckedChange = vm::setRecognition,
            )
            RowToggle(
                label = "Dark mode",
                checked = vm.dark,
                onCheckedChange = { vm.toggleDark() },
            )
            OutlinedButton(onClick = vm::logout) { Text("Sign out") }
            Spacer(Modifier.height(16.dp))
            Text("My reports", style = MaterialTheme.typography.titleMedium)
            if (vm.myReports.isEmpty()) {
                Text(
                    "You have not filed a report on this device yet.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(vm.myReports, key = { it.id }) { issue ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CivicCard),
                        modifier = Modifier.fillMaxWidth().clickable { onOpen(issue.id) },
                    ) {
                        Column(Modifier.padding(12.dp)) {
                            Text(issue.title, style = MaterialTheme.typography.titleSmall)
                            Text(issue.status.label(), style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun RowToggle(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    androidx.compose.foundation.layout.Row(
        Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, modifier = Modifier.weight(1f).padding(end = 12.dp))
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
