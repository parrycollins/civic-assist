package gh.civic.civicgh.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import gh.civic.civicgh.data.IssueStatus
import gh.civic.civicgh.data.icon
import gh.civic.civicgh.data.label
import gh.civic.civicgh.ui.CivicViewModel
import gh.civic.civicgh.ui.theme.CivicGreen

@Composable
fun DetailScreen(vm: CivicViewModel, id: String, onBack: () -> Unit) {
    val issue = vm.find(id)
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        OutlinedButton(onClick = onBack) { Text("Back") }
        Spacer(Modifier.height(12.dp))
        if (issue == null) {
            Text("This report is no longer available.", style = MaterialTheme.typography.titleLarge)
            return
        }
        Text("${issue.category.icon()}  ${issue.title}", style = MaterialTheme.typography.headlineSmall)
        Text("${issue.location.publicLabel} · ${issue.agencyName}", style = MaterialTheme.typography.bodyMedium)
        Text(issue.status.label(), style = MaterialTheme.typography.labelLarge, color = CivicGreen)
        Spacer(Modifier.height(8.dp))
        Text("Reported by ${vm.reporterLabel(issue)}", style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(12.dp))
        Text(issue.description, style = MaterialTheme.typography.bodyLarge)
        Spacer(Modifier.height(16.dp))
        Text("Status journey", style = MaterialTheme.typography.titleMedium)
        IssueStatus.entries.forEach { step ->
            if (step == IssueStatus.disputed && issue.status != IssueStatus.disputed) return@forEach
            val reached = issue.status.ordinal >= step.ordinal && issue.status != IssueStatus.disputed || issue.status == step
            Text(
                "${if (reached) "●" else "○"}  ${step.label()}",
                color = if (reached) CivicGreen else MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        if (issue.timeline.isNotEmpty()) {
            Spacer(Modifier.height(16.dp))
            Text("Timeline", style = MaterialTheme.typography.titleMedium)
            issue.timeline.forEach { event ->
                Text("${event.timestamp.take(10)} · ${event.label} · ${event.actor}", style = MaterialTheme.typography.bodySmall)
            }
        }
        if (issue.evidence.isNotEmpty()) {
            Spacer(Modifier.height(16.dp))
            Text("Evidence on record", style = MaterialTheme.typography.titleMedium)
            issue.evidence.forEach { item ->
                Text("${item.stage.replaceFirstChar { it.uppercase() }} · ${item.uploadedBy}", style = MaterialTheme.typography.bodySmall)
            }
        }
        if (issue.status == IssueStatus.resolved && vm.user?.role == "citizen") {
            Spacer(Modifier.height(16.dp))
            Text("Awaiting citizen verification", style = MaterialTheme.typography.titleSmall)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { vm.verify(issue.id) },
                    colors = ButtonDefaults.buttonColors(containerColor = CivicGreen),
                    modifier = Modifier.weight(1f),
                ) { Text("Confirm fixed") }
                OutlinedButton(onClick = { vm.dispute(issue.id) }, modifier = Modifier.weight(1f)) {
                    Text("Not fixed")
                }
            }
        }
    }
}
