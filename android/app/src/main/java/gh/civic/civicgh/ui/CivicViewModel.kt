package gh.civic.civicgh.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import gh.civic.civicgh.data.Category
import gh.civic.civicgh.data.CivicRepository
import gh.civic.civicgh.data.Issue
import gh.civic.civicgh.data.IssueStatus
import gh.civic.civicgh.data.User
import gh.civic.civicgh.data.layer

class CivicViewModel : ViewModel() {
    private val repo = CivicRepository()

    var issues by mutableStateOf(repo.all())
        private set
    var user by mutableStateOf<User?>(repo.user)
        private set
    var dark by mutableStateOf(false)
        private set
    var completedLayer by mutableStateOf(false)
        private set

    val completed: List<Issue> get() = repo.completed()
    val myReports: List<Issue> get() = issues.filter { it.createdByMe }
    val nearby get() = issues.size
    val inProgress get() = issues.count { it.status.layer() == "progress" }
    val resolvedNearby get() = issues.count { it.status.layer() == "completed" }

    fun refresh() {
        issues = repo.all()
        user = repo.user
    }

    fun login(email: String, password: String): String? {
        val err = repo.login(email, password)
        refresh()
        return err
    }

    fun logout() {
        repo.logout()
        refresh()
    }

    fun setRecognition(named: Boolean) {
        repo.setRecognition(named)
        refresh()
    }

    fun report(title: String, category: Category, description: String): Issue {
        val issue = repo.addReport(title, category, description)
        refresh()
        return issue
    }

    fun verify(id: String) {
        repo.verify(id)
        refresh()
    }

    fun dispute(id: String) {
        repo.dispute(id)
        refresh()
    }

    fun setCompletedLayer(enabled: Boolean) {
        completedLayer = enabled
    }

    fun find(id: String) = repo.find(id)

    fun reporterLabel(issue: Issue): String {
        val named = issue.reporterVisibility == "named" || (issue.createdByMe && user?.recognition == "named")
        return if (named) user?.name ?: "Citizen Reporter" else "Citizen Reporter"
    }

    fun toggleDark() {
        dark = !dark
    }

    fun statusColor(status: IssueStatus) = when (status) {
        IssueStatus.reported -> 0xFFB91C1C
        IssueStatus.under_review -> 0xFFC2410C
        IssueStatus.assigned -> 0xFF5B21B6
        IssueStatus.in_progress -> 0xFF1D4ED8
        IssueStatus.resolved -> 0xFF15803D
        IssueStatus.verified -> 0xFF065F46
        IssueStatus.disputed -> 0xFF92400E
    }
}
