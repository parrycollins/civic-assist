package gh.civic.civicgh.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import gh.civic.civicgh.data.icon
import gh.civic.civicgh.data.label
import gh.civic.civicgh.ui.CivicViewModel
import gh.civic.civicgh.ui.theme.CivicGold
import gh.civic.civicgh.ui.theme.CivicGreen

@Composable
fun HomeScreen(
    vm: CivicViewModel,
    onOpen: (String) -> Unit,
    onReport: () -> Unit,
    onMap: () -> Unit,
    onCompleted: () -> Unit,
) {
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Surface(shape = RoundedCornerShape(28.dp), color = CivicGreen, modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Good day ${vm.user?.name?.substringBefore(" ") ?: "there"} 👋", color = CivicGold)
                Text("Make your community better.", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.onPrimary)
                Text("Report problems, track progress and explore what is happening around you.", color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f))
                Button(onClick = onReport, colors = ButtonDefaults.buttonColors(containerColor = CivicGold, contentColor = MaterialTheme.colorScheme.onSecondary)) {
                    Text("Report an Issue")
                }
                TextButton(onClick = onMap) { Text("Explore Civic Map", color = MaterialTheme.colorScheme.onPrimary) }
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Stat("Reports", vm.nearby.toString(), Modifier.weight(1f))
            Stat("In Progress", vm.inProgress.toString(), Modifier.weight(1f))
            Stat("Resolved", vm.resolvedNearby.toString(), Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Surface(Modifier.weight(1f).clickable(onClick = onMap), shape = RoundedCornerShape(22.dp), tonalElevation = 2.dp) {
                Column(Modifier.padding(16.dp)) {
                    Text("🚗")
                    Text("Road Assist", fontWeight = FontWeight.Bold)
                    Text("Safer Accra routes", style = MaterialTheme.typography.bodySmall)
                }
            }
            Surface(Modifier.weight(1f).clickable(onClick = onCompleted), shape = RoundedCornerShape(22.dp), tonalElevation = 2.dp) {
                Column(Modifier.padding(16.dp)) {
                    Text("🏆")
                    Text("Completed Work", fontWeight = FontWeight.Bold)
                    Text("What was actually fixed", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        Text("Recently Completed", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        vm.completed.take(3).forEach { issue ->
            Surface(Modifier.fillMaxWidth().clickable { onOpen(issue.id) }, shape = RoundedCornerShape(22.dp), tonalElevation = 1.dp) {
                Column(Modifier.padding(16.dp)) {
                    Text("${issue.category.icon()} ${issue.title}", fontWeight = FontWeight.Bold)
                    Text("📍 ${issue.location.area} · ${issue.status.label()}", style = MaterialTheme.typography.bodySmall)
                    Text("Reported by ${vm.reporterLabel(issue)}", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        TextButton(onClick = onCompleted) { Text("See all completed work") }
    }
}

@Composable
private fun Stat(label: String, value: String, modifier: Modifier = Modifier) {
    Surface(modifier, shape = RoundedCornerShape(20.dp), tonalElevation = 1.dp) {
        Column(Modifier.padding(12.dp)) {
            Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
            Text(label, style = MaterialTheme.typography.bodySmall)
        }
    }
}
