package gh.civic.civicgh.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val CivicGreen = Color(0xFF0D4F3C)
val CivicGold = Color(0xFFD4A017)
val CivicCream = Color(0xFFF4F1EA)
val CivicCard = Color(0xFFFFFCF7)
val CivicCharcoal = Color(0xFF1C211C)

private val Light = lightColorScheme(
    primary = CivicGreen,
    onPrimary = Color(0xFFF7F4EC),
    secondary = CivicGold,
    onSecondary = Color(0xFF3A2D0A),
    background = CivicCream,
    onBackground = CivicCharcoal,
    surface = CivicCard,
    onSurface = CivicCharcoal,
)

private val Dark = darkColorScheme(
    primary = Color(0xFF7DCA9F),
    onPrimary = Color(0xFF102018),
    secondary = CivicGold,
    background = Color(0xFF121814),
    onBackground = Color(0xFFF3EEE4),
    surface = Color(0xFF1B221D),
    onSurface = Color(0xFFF3EEE4),
)

@Composable
fun CivicGHTheme(darkTheme: Boolean = false, content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) Dark else Light,
        content = content,
    )
}
