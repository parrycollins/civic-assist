package gh.civic.civicgh.data

enum class IssueStatus { reported, under_review, assigned, in_progress, resolved, verified, disputed }
enum class Category { roads, flooding, drainage, waste, streetlights, water, public_infrastructure, other }

data class GeoPoint(val lat: Double, val lng: Double)

data class IssueLocation(
    val lat: Double,
    val lng: Double,
    val area: String,
    val municipality: String,
    val publicLabel: String,
)

data class TimelineEvent(
    val id: String,
    val status: String,
    val label: String,
    val timestamp: String,
    val actor: String,
)

data class Evidence(
    val id: String,
    val stage: String,
    val photoKey: String,
    val timestamp: String,
    val uploadedBy: String,
    val description: String? = null,
)

data class Issue(
    val id: String,
    val title: String,
    val category: Category,
    val description: String,
    val photoKey: String,
    val location: IssueLocation,
    val reportedAt: String,
    val agencyId: String,
    val agencyName: String,
    val status: IssueStatus,
    val reporterCount: Int,
    val timeline: List<TimelineEvent>,
    val evidence: List<Evidence>,
    val createdByMe: Boolean = false,
    val reporterVisibility: String = "anonymous",
)

data class User(
    val name: String,
    val email: String,
    val role: String,
    val recognition: String = "anonymous",
)

fun IssueStatus.layer(): String = when (this) {
    IssueStatus.resolved, IssueStatus.verified -> "completed"
    IssueStatus.assigned, IssueStatus.in_progress -> "progress"
    else -> "problems"
}

fun IssueStatus.label(): String = when (this) {
    IssueStatus.reported -> "Reported"
    IssueStatus.under_review -> "Under Review"
    IssueStatus.assigned -> "Assigned"
    IssueStatus.in_progress -> "In Progress"
    IssueStatus.resolved -> "Awaiting Citizen Verification"
    IssueStatus.verified -> "Citizen Verified"
    IssueStatus.disputed -> "Disputed"
}

fun Category.label(): String = when (this) {
    Category.roads -> "Roads"
    Category.flooding -> "Flooding"
    Category.drainage -> "Drainage"
    Category.waste -> "Waste"
    Category.streetlights -> "Streetlights"
    Category.water -> "Water"
    Category.public_infrastructure -> "Public infrastructure"
    Category.other -> "Other"
}

fun Category.icon(): String = when (this) {
    Category.roads -> "🕳️"
    Category.flooding -> "🌊"
    Category.drainage -> "🚰"
    Category.waste -> "🗑️"
    Category.streetlights -> "💡"
    Category.water -> "💧"
    Category.public_infrastructure -> "🏛️"
    Category.other -> "📍"
}
