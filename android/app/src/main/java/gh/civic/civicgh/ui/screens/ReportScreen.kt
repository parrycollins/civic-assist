package gh.civic.civicgh.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import gh.civic.civicgh.data.Category
import gh.civic.civicgh.data.icon
import gh.civic.civicgh.data.label
import gh.civic.civicgh.ui.CivicViewModel
import gh.civic.civicgh.ui.theme.CivicGold
import gh.civic.civicgh.ui.theme.CivicGreen

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ReportScreen(vm: CivicViewModel, onDone: (String) -> Unit) {
    var categoryName by rememberSaveable { mutableStateOf<String?>(null) }
    var title by rememberSaveable { mutableStateOf("") }
    var description by rememberSaveable { mutableStateOf("") }
    var error by rememberSaveable { mutableStateOf<String?>(null) }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        Text("Report a civic issue", style = MaterialTheme.typography.headlineSmall)
        Text(
            "Choose a category first, then describe what the agency should know. Location is approximated for privacy.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(16.dp))
        Text("What is the problem?", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Category.entries.forEach { item ->
                val selected = categoryName == item.name
                Column(
                    Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (selected) CivicGreen else Color(0xFFE8E4D8))
                        .border(1.dp, if (selected) CivicGold else Color(0x1A0B1C16), RoundedCornerShape(16.dp))
                        .clickable { categoryName = item.name }
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                ) {
                    Text(item.icon())
                    Text(
                        item.label(),
                        color = if (selected) Color.White else Color(0xFF0B1C16),
                        style = MaterialTheme.typography.labelLarge,
                    )
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Short title") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("What should the agency know?") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 4,
        )
        error?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, color = MaterialTheme.colorScheme.error)
        }
        Spacer(Modifier.height(16.dp))
        Button(
            onClick = {
                val cat = Category.entries.find { it.name == categoryName }
                if (cat == null) {
                    error = "Choose a category first."
                    return@Button
                }
                if (title.trim().length < 4 || description.trim().length < 10) {
                    error = "Add a title and a description of at least 10 characters."
                    return@Button
                }
                val issue = vm.report(title.trim(), cat, description.trim())
                onDone(issue.id)
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = CivicGreen),
        ) {
            Text("Submit report")
        }
    }
}
