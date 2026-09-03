package gh.civic.civicgh

import android.app.Application
import java.io.File
import org.osmdroid.config.Configuration

class CivicApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val base = File(cacheDir, "osmdroid").apply { mkdirs() }
        Configuration.getInstance().apply {
            userAgentValue = packageName
            osmdroidBasePath = base
            osmdroidTileCache = File(base, "tiles").apply { mkdirs() }
            load(this@CivicApp, getSharedPreferences("osmdroid", MODE_PRIVATE))
        }
    }
}
