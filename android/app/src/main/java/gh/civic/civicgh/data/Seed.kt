package gh.civic.civicgh.data

object Seed {
    val agencies = mapOf(
        "ayawaso" to "Ayawaso West Municipal Assembly",
        "dur" to "Department of Urban Roads",
        "nadmo" to "National Disaster Management Organisation",
        "ecg" to "Electricity Company of Ghana",
        "zoomlion" to "Zoomlion Ghana Limited",
        "ama" to "Accra Metropolitan Assembly",
        "gha" to "Ghana Highway Authority",
    )

    val issues: List<Issue> = listOf(
        issue(
            id = "CGH-2026-0001",
            title = "Blocked Drain",
            category = Category.drainage,
            description = "The roadside drain on East Legon Avenue is fully silted. Stormwater spills onto the carriageway after even short rains.",
            photoKey = "drain",
            lat = 5.6362,
            lng = -0.1589,
            area = "East Legon",
            municipality = "Ayawaso West",
            publicLabel = "East Legon Avenue, East Legon",
            reportedAt = "2026-08-28T08:00:00Z",
            agencyId = "ayawaso",
            status = IssueStatus.verified,
            reporterCount = 14,
            events = listOf(
                "2026-08-28T08:00:00Z" to "Reported",
                "2026-08-28T15:00:00Z" to "Assigned",
                "2026-08-30T07:00:00Z" to "Work started",
                "2026-09-01T17:00:00Z" to "Resolved",
                "2026-09-02T16:00:00Z" to "Citizen verified",
            ),
        ),
        issue(
            id = "CGH-2026-0002",
            title = "Deep pothole on N1 eastbound",
            category = Category.roads,
            description = "A wide pothole on the Tema Motorway eastbound lanes near Spintex is catching vehicles.",
            photoKey = "pothole",
            lat = 5.641,
            lng = -0.092,
            area = "Spintex",
            municipality = "Ledzokuku",
            publicLabel = "N1 Tema Motorway, Spintex",
            reportedAt = "2026-08-26T07:00:00Z",
            agencyId = "dur",
            status = IssueStatus.in_progress,
            reporterCount = 9,
            events = listOf(
                "2026-08-26T07:00:00Z" to "Reported",
                "2026-08-27T09:00:00Z" to "Assigned",
                "2026-08-29T11:00:00Z" to "Work started",
            ),
        ),
        issue(
            id = "CGH-2026-0003",
            title = "Flooded carriageway after rain",
            category = Category.flooding,
            description = "Standing water covers the inner lane near the Circle underpass after rainfall.",
            photoKey = "flood",
            lat = 5.56,
            lng = -0.205,
            area = "Kwame Nkrumah Circle",
            municipality = "Accra Central",
            publicLabel = "Circle underpass, Accra Central",
            reportedAt = "2026-08-29T18:00:00Z",
            agencyId = "nadmo",
            status = IssueStatus.assigned,
            reporterCount = 7,
            events = listOf(
                "2026-08-29T18:00:00Z" to "Reported",
                "2026-08-30T08:00:00Z" to "Assigned",
            ),
        ),
        issue(
            id = "CGH-2026-0005",
            title = "Uncollected waste at Dansoman High Street",
            category = Category.waste,
            description = "Skip containers have overflowed for four days beside the market.",
            photoKey = "waste",
            lat = 5.541,
            lng = -0.268,
            area = "Dansoman",
            municipality = "Ablekuma West",
            publicLabel = "Dansoman High Street, Dansoman",
            reportedAt = "2026-08-30T11:00:00Z",
            agencyId = "zoomlion",
            status = IssueStatus.resolved,
            reporterCount = 11,
            events = listOf(
                "2026-08-30T11:00:00Z" to "Reported",
                "2026-08-30T16:00:00Z" to "Assigned",
                "2026-09-01T08:00:00Z" to "Work started",
                "2026-09-02T14:00:00Z" to "Resolved",
            ),
        ),
        issue(
            id = "CGH-2026-0009",
            title = "Streetlight repaired on Liberation Road",
            category = Category.streetlights,
            description = "The signal and streetlight at the 37 Hospital junction were restored.",
            photoKey = "light",
            lat = 5.5848,
            lng = -0.1804,
            area = "Airport Residential",
            municipality = "La Dade Kotopon",
            publicLabel = "Liberation Road, 37 Hospital junction",
            reportedAt = "2026-08-18T21:00:00Z",
            agencyId = "ecg",
            status = IssueStatus.verified,
            reporterCount = 6,
            events = listOf(
                "2026-08-18T21:00:00Z" to "Reported",
                "2026-08-19T08:00:00Z" to "Assigned",
                "2026-08-19T14:00:00Z" to "Work started",
                "2026-08-20T18:00:00Z" to "Resolved",
                "2026-08-21T20:00:00Z" to "Citizen verified",
            ),
        ),
        issue(
            id = "CGH-2026-0010",
            title = "Collapsed drain wall in Nima",
            category = Category.drainage,
            description = "A section of the Nima drain wall has collapsed, backing water toward nearby shops.",
            photoKey = "drain",
            lat = 5.586,
            lng = -0.196,
            area = "Nima",
            municipality = "Ayawaso East",
            publicLabel = "Nima Highway, Nima",
            reportedAt = "2026-08-25T12:00:00Z",
            agencyId = "ama",
            status = IssueStatus.assigned,
            reporterCount = 16,
            events = listOf(
                "2026-08-25T12:00:00Z" to "Reported",
                "2026-08-27T10:00:00Z" to "Assigned",
            ),
        ),
    )

    private fun issue(
        id: String,
        title: String,
        category: Category,
        description: String,
        photoKey: String,
        lat: Double,
        lng: Double,
        area: String,
        municipality: String,
        publicLabel: String,
        reportedAt: String,
        agencyId: String,
        status: IssueStatus,
        reporterCount: Int,
        events: List<Pair<String, String>>,
    ): Issue {
        val timeline = events.mapIndexed { index, (time, label) ->
            TimelineEvent("$id-t$index", label.lowercase(), label, time, if (index == 0) "Citizen Reporter" else agencies[agencyId] ?: "Agency")
        }
        val stages = listOf("before", "during", "after").take(
            when (status) {
                IssueStatus.verified, IssueStatus.resolved -> 3
                IssueStatus.in_progress -> 2
                else -> 1
            },
        )
        return Issue(
            id = id,
            title = title,
            category = category,
            description = description,
            photoKey = photoKey,
            location = IssueLocation(lat, lng, area, municipality, publicLabel),
            reportedAt = reportedAt,
            agencyId = agencyId,
            agencyName = agencies[agencyId] ?: "Agency",
            status = status,
            reporterCount = reporterCount,
            timeline = timeline,
            evidence = stages.map { stage ->
                Evidence("$id-$stage", stage, "$photoKey-$stage", reportedAt, if (stage == "before") "Citizen Reporter" else agencies[agencyId] ?: "Agency")
            },
        )
    }
}
