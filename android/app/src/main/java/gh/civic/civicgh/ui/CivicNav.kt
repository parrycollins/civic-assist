package gh.civic.civicgh.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.WorkspacePremium
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import gh.civic.civicgh.ui.screens.CompletedScreen
import gh.civic.civicgh.ui.screens.DetailScreen
import gh.civic.civicgh.ui.screens.HomeScreen
import gh.civic.civicgh.ui.screens.MapScreen
import gh.civic.civicgh.ui.screens.ProfileScreen
import gh.civic.civicgh.ui.screens.ReportScreen

@Composable
fun CivicNav(vm: CivicViewModel) {
    val nav = rememberNavController()
    val back by nav.currentBackStackEntryAsState()
    val route = back?.destination?.route.orEmpty()
    val tabs = listOf(
        "home" to ("Home" to Icons.Outlined.Home),
        "map" to ("Map" to Icons.Outlined.Map),
        "report" to ("Report" to Icons.Outlined.Add),
        "completed" to ("Done" to Icons.Outlined.WorkspacePremium),
        "profile" to ("Profile" to Icons.Outlined.Person),
    )
    Scaffold(
        bottomBar = {
            if (!route.startsWith("detail")) {
                NavigationBar {
                    tabs.forEach { (id, meta) ->
                        NavigationBarItem(
                            selected = route == id,
                            onClick = {
                                nav.navigate(id) {
                                    popUpTo("home") { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(meta.second, contentDescription = meta.first) },
                            label = { Text(meta.first) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(navController = nav, startDestination = "home", modifier = Modifier.padding(padding)) {
            composable("home") { HomeScreen(vm, onOpen = { nav.navigate("detail/$it") }, onReport = { nav.navigate("report") }, onMap = { nav.navigate("map") }, onCompleted = { nav.navigate("completed") }) }
            composable("map") { MapScreen(vm, onOpen = { nav.navigate("detail/$it") }) }
            composable("report") { ReportScreen(vm, onDone = { nav.navigate("detail/$it") }) }
            composable("completed") { CompletedScreen(vm, onOpen = { nav.navigate("detail/$it") }) }
            composable("profile") { ProfileScreen(vm, onOpen = { nav.navigate("detail/$it") }) }
            composable("detail/{id}", arguments = listOf(navArgument("id") { type = NavType.StringType })) { entry ->
                DetailScreen(vm, entry.arguments?.getString("id").orEmpty(), onBack = { nav.popBackStack() })
            }
        }
    }
}
