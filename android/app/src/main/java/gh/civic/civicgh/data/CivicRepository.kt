package gh.civic.civicgh.data

import java.time.Instant
import java.util.UUID

class CivicRepository {
    private val issues = Seed.issues.toMutableList()
    var user: User? = null
        private set

    fun all(): List<Issue> = issues.toList()

    fun completed(): List<Issue> = issues.filter { it.status.layer() == "completed" }
        .sortedByDescending { it.timeline.lastOrNull()?.timestamp ?: it.reportedAt }

    fun find(id: String): Issue? = issues.find { it.id == id }

    fun login(email: String, password: String): String? {
        val account = ACCOUNTS.find { it.first == email && it.second == password } ?: return "Email or password is incorrect."
        user = account.third
        return null
    }

    fun logout() {
        user = null
    }

    fun setRecognition(named: Boolean) {
        user = user?.copy(recognition = if (named) "named" else "anonymous")
    }

    fun addReport(title: String, category: Category, description: String): Issue {
        val now = Instant.parse("2026-09-03T12:00:00Z").toString()
        val issue = Issue(
            id = "CGH-2026-${(issues.size + 1).toString().padStart(4, '0')}",
            title = title,
            category = category,
            description = description,
            photoKey = category.name,
            location = IssueLocation(5.6037, -0.187, "Accra", "Accra Central", "Accra (approximate)"),
            reportedAt = now,
            agencyId = "ama",
            agencyName = "Accra Metropolitan Assembly",
            status = IssueStatus.reported,
            reporterCount = 1,
            timeline = listOf(TimelineEvent(UUID.randomUUID().toString(), "reported", "Reported", now, user?.name ?: "Citizen")),
            evidence = listOf(Evidence("new-before", "before", "before", now, "Citizen Reporter", "Original report")),
            createdByMe = true,
            reporterVisibility = user?.recognition ?: "anonymous",
        )
        issues.add(0, issue)
        return issue
    }

    fun verify(id: String) {
        val index = issues.indexOfFirst { it.id == id }
        if (index < 0) return
        val current = issues[index]
        if (current.status != IssueStatus.resolved) return
        issues[index] = current.copy(
            status = IssueStatus.verified,
            timeline = current.timeline + TimelineEvent(
                UUID.randomUUID().toString(),
                "verified",
                "Citizen verified",
                Instant.parse("2026-09-03T12:00:00Z").toString(),
                user?.name ?: "Citizen",
            ),
        )
    }

    fun dispute(id: String) {
        val index = issues.indexOfFirst { it.id == id }
        if (index < 0) return
        val current = issues[index]
        if (current.status != IssueStatus.resolved) return
        issues[index] = current.copy(
            status = IssueStatus.disputed,
            timeline = current.timeline + TimelineEvent(
                UUID.randomUUID().toString(),
                "disputed",
                "Citizen said this is not fixed",
                Instant.parse("2026-09-03T12:00:00Z").toString(),
                user?.name ?: "Citizen",
            ),
        )
    }

    companion object {
        val ACCOUNTS = listOf(
            Triple("ama@civicgh.gh", "civic2026", User("Ama Mensah", "ama@civicgh.gh", "citizen")),
            Triple("officer@ama.gov.gh", "agency2026", User("Kwame Asante", "officer@ama.gov.gh", "agency")),
            Triple("roads@dur.gov.gh", "agency2026", User("Efua Boateng", "roads@dur.gov.gh", "agency")),
        )
    }
}
