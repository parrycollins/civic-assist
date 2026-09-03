package gh.civic.civicgh.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import gh.civic.civicgh.ui.CivicViewModel
import gh.civic.civicgh.ui.theme.CivicGreen
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker

@Composable
fun MapScreen(vm: CivicViewModel, onOpen: (String) -> Unit) {
    val context = LocalContext.current
    val mapView = remember {
        MapView(context).apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            controller.setZoom(12.4)
            controller.setCenter(GeoPoint(5.6037, -0.1870))
        }
    }
    DisposableEffect(Unit) {
        mapView.onResume()
        onDispose { mapView.onPause() }
    }
    val visible = if (vm.completedLayer) vm.completed else vm.issues
    Box(Modifier.fillMaxSize()) {
        AndroidView(
            factory = { mapView },
            update = { map ->
                map.overlays.removeAll { it is Marker }
                visible.forEach { issue ->
                    val marker = Marker(map)
                    marker.position = GeoPoint(issue.location.lat, issue.location.lng)
                    marker.title = issue.title
                    marker.snippet = issue.location.publicLabel
                    marker.setOnMarkerClickListener { _, _ ->
                        onOpen(issue.id)
                        true
                    }
                    map.overlays.add(marker)
                }
                map.invalidate()
            },
            modifier = Modifier.fillMaxSize(),
        )
        Row(
            Modifier
                .align(Alignment.TopStart)
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FilterChip(
                selected = !vm.completedLayer,
                onClick = { vm.setCompletedLayer(false) },
                label = { Text("All issues") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = CivicGreen,
                    selectedLabelColor = Color.White,
                ),
            )
            FilterChip(
                selected = vm.completedLayer,
                onClick = { vm.setCompletedLayer(true) },
                label = { Text("Completed (${vm.completed.size})") },
            )
        }
    }
}
