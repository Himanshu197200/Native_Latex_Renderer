package expo.modules.latexview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LatexViewModule : Module() {
    override fun definition() = ModuleDefinition {
        
        Name("LatexView")

        
        View(LatexNativeView::class) {
            
            Prop("latex") { view: LatexNativeView, latex: String ->
                view.setLatex(latex)
            }
            
            
            Prop("textSize") { view: LatexNativeView, textSize: Float ->
                view.setTextSize(textSize)
            }
            
            
            Prop("textColor") { view: LatexNativeView, textColor: Int ->
                view.setTextColor(textColor)
            }
            
            
            Prop("displayMode") { view: LatexNativeView, displayMode: Boolean ->
                view.setDisplayMode(displayMode)
            }

            
            Events("onRenderComplete", "onRenderError")
        }
    }
}
