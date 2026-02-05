package expo.modules.latexview

import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.LruCache
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import ru.noties.jlatexmath.JLatexMathDrawable


sealed class RenderResult {
    data class Success(val bitmap: Bitmap) : RenderResult()
    data class Error(val message: String) : RenderResult()
}


object LatexRenderTask {
    
    
    private val cache: LruCache<String, Bitmap> = object : LruCache<String, Bitmap>(20 * 1024 * 1024) {
        override fun sizeOf(key: String, bitmap: Bitmap): Int {
            return bitmap.byteCount
        }
    }
    
    
    suspend fun render(
        latex: String,
        textSize: Float,
        textColor: Int,
        maxWidth: Int
    ): RenderResult = withContext(Dispatchers.Default) {
        
        val cacheKey = generateCacheKey(latex, textSize, textColor, maxWidth)
        
        
        cache.get(cacheKey)?.let { cachedBitmap ->
            return@withContext RenderResult.Success(cachedBitmap)
        }
        
        try {
            
            val drawable = JLatexMathDrawable.builder(latex)
                .textSize(textSize)
                .color(textColor)
                .build()
            
            
            val width = drawable.intrinsicWidth
            val height = drawable.intrinsicHeight
            
            if (width <= 0 || height <= 0) {
                return@withContext RenderResult.Error("Invalid dimensions: ${width}x${height}")
            }
            
            
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, width, height)
            drawable.draw(canvas)
            
            
            cache.put(cacheKey, bitmap)
            
            RenderResult.Success(bitmap)
            
        } catch (e: Exception) {
            
            val errorMessage = when {
                e.message?.contains("Unknown symbol") == true -> "Unknown LaTeX command"
                e.message?.contains("Missing") == true -> "Incomplete expression"
                e.message?.contains("expected") == true -> "Syntax error: ${e.message}"
                else -> e.message ?: "Unknown rendering error"
            }
            RenderResult.Error(errorMessage)
        }
    }
    
    
    fun clearCache() {
        cache.evictAll()
    }
    
    
    fun getCacheSize(): Int {
        return cache.size()
    }
    
    
    private fun generateCacheKey(
        latex: String,
        textSize: Float,
        textColor: Int,
        maxWidth: Int
    ): String {
        return "${latex.hashCode()}_${textSize}_${textColor}_${maxWidth}"
    }
}
