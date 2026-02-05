package expo.modules.latexview

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class LatexNativeView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    
    
    private val onRenderComplete by EventDispatcher()
    private val onRenderError by EventDispatcher()
    
    
    private val imageView: ImageView
    private val errorView: TextView
    
    
    private var currentLatex: String = ""
    private var textSize: Float = 40f
    private var textColor: Int = Color.BLACK
    private var displayMode: Boolean = false
    private var hasRendered: Boolean = false
    
    
    private var renderJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Main)
    
    init {
        
        imageView = ImageView(context).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
            scaleType = ImageView.ScaleType.FIT_START
            adjustViewBounds = true
            visibility = View.GONE
        }
        
        
        errorView = TextView(context).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
            setTextColor(Color.RED)
            textSize = 14f
            setPadding(16, 8, 16, 8)
            setBackgroundColor(Color.parseColor("#FFEBEE"))
            visibility = View.GONE
        }
        
        addView(imageView)
        addView(errorView)
    }
    
    fun setLatex(latex: String) {
        if (latex != currentLatex || !hasRendered) {
            currentLatex = latex
            render()
        }
    }
    
    fun setTextSize(size: Float) {
        if (size != textSize) {
            textSize = size
            if (currentLatex.isNotEmpty()) {
                render()
            }
        }
    }
    
    fun setTextColor(color: Int) {
        if (color != textColor) {
            textColor = color
            if (currentLatex.isNotEmpty()) {
                render()
            }
        }
    }
    
    fun setDisplayMode(mode: Boolean) {
        if (mode != displayMode) {
            displayMode = mode
            updateAlignment()
        }
    }
    
    private fun updateAlignment() {
        val params = imageView.layoutParams as? FrameLayout.LayoutParams ?: return
        params.gravity = if (displayMode) Gravity.CENTER_HORIZONTAL else Gravity.START
        imageView.layoutParams = params
    }
    
    private fun render() {
        if (currentLatex.isEmpty()) {
            showEmpty()
            return
        }
        
        
        renderJob?.cancel()
        
        
        val maxWidth = if (width > 0) width else resources.displayMetrics.widthPixels
        
        renderJob = scope.launch {
            val result = LatexRenderTask.render(
                latex = currentLatex,
                textSize = textSize,
                textColor = textColor,
                maxWidth = maxWidth
            )
            
            when (result) {
                is RenderResult.Success -> showBitmap(result.bitmap)
                is RenderResult.Error -> showError(result.message)
            }
        }
    }
    
    private fun showBitmap(bitmap: Bitmap) {
        hasRendered = true
        errorView.visibility = View.GONE
        imageView.visibility = View.VISIBLE
        imageView.setImageBitmap(bitmap)
        updateAlignment()
        
        
        imageView.requestLayout()
        requestLayout()
        invalidate()
        
        
        val widthSpec = MeasureSpec.makeMeasureSpec(bitmap.width, MeasureSpec.EXACTLY)
        val heightSpec = MeasureSpec.makeMeasureSpec(bitmap.height, MeasureSpec.EXACTLY)
        measure(widthSpec, heightSpec)
        
        
        onRenderComplete(mapOf(
            "width" to bitmap.width,
            "height" to bitmap.height
        ))
    }
    
    private fun showError(message: String) {
        hasRendered = true
        imageView.visibility = View.GONE
        errorView.visibility = View.VISIBLE
        errorView.text = " $message"
        
        
        errorView.requestLayout()
        requestLayout()
        invalidate()
        
        
        onRenderError(mapOf(
            "error" to message,
            "latex" to currentLatex
        ))
    }
    
    private fun showEmpty() {
        imageView.visibility = View.GONE
        errorView.visibility = View.GONE
    }
    
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        
        
        val bitmap = (imageView.drawable as? android.graphics.drawable.BitmapDrawable)?.bitmap
        if (bitmap != null && imageView.visibility == View.VISIBLE) {
            val width = MeasureSpec.getSize(widthMeasureSpec)
            val bitmapWidth = minOf(bitmap.width, width)
            val bitmapHeight = bitmap.height
            setMeasuredDimension(bitmapWidth, bitmapHeight)
        } else if (errorView.visibility == View.VISIBLE) {
            measureChild(errorView, widthMeasureSpec, heightMeasureSpec)
            setMeasuredDimension(errorView.measuredWidth, errorView.measuredHeight)
        }
    }
    
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        renderJob?.cancel()
    }
    
    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        
        if (w > 0 && oldw > 0 && oldw != w && currentLatex.isNotEmpty()) {
            render()
        }
    }
    
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        
        if (currentLatex.isNotEmpty() && !hasRendered) {
            render()
        }
    }
}
