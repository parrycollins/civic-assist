package gh.civic.civicgh.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import gh.civic.civicgh.data.icon
import gh.civic.civicgh.data.label
import gh.civic.civicgh.ui.CivicViewModel
import gh.civic.civicgh.ui.theme.CivicCard

@Composable
fun CompletedScreen(vm: CivicViewModel, onOpen: (String) -> Unit) {
    val completed = vm.completed
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Text("Completed work", style = MaterialTheme.typography.headlineSmall)
            Text(
                "Public archive of finished civic work. Years without records stay at 0 — we do not invent history.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                if (completed.isEmpty()) {
                    "No completed work in this dataset yet."
                } else {
                    "${completed.size} completed ${if (completed.size == 1) "record" else "records"}"
                },
                style = MaterialTheme.typography.titleMedium,
            )
        }
        items(completed, key = { it.id }) { issue ->
            Card(
                colors = CardDefaults.cardColors(containerColor = CivicCard),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpen(issue.id) },
            ) {
                Column(Modifier.padding(14.dp)) {
                    Text("${issue.category.icon()}  ${issue.title}", style = MaterialTheme.typography.titleMedium)
                    Text("${issue.location.area} · ${issue.agencyName}", style = MaterialTheme.typography.bodySmall)
                    Text(issue.status.label(), style = MaterialTheme.typography.bodySmall)
                    Text("Reported by ${vm.reporterLabel(issue)}", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}
