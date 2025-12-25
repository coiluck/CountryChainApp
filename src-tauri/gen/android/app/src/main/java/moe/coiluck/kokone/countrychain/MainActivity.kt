package moe.coiluck.kokone.countrychain

import android.os.Bundle
import android.view.View
import android.view.ViewTreeObserver
import android.graphics.Rect
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.hide(WindowInsetsCompat.Type.systemBars())
    controller.systemBarsBehavior =
      WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    
    // キーボード表示時の対応
    setupKeyboardListener()
  }
  
  private fun setupKeyboardListener() {
    val rootView = window.decorView.findViewById<View>(android.R.id.content)
    
    rootView.viewTreeObserver.addOnGlobalLayoutListener(object : ViewTreeObserver.OnGlobalLayoutListener {
      private var isKeyboardShowing = false
      
      override fun onGlobalLayout() {
        val rect = Rect()
        rootView.getWindowVisibleDisplayFrame(rect)
        val screenHeight = rootView.height
        val keypadHeight = screenHeight - rect.bottom
        
        // キーボードが画面の10%以上を占める場合、表示されていると判定
        val isKeyboardNowShowing = keypadHeight > screenHeight * 0.10
        
        if (isKeyboardNowShowing != isKeyboardShowing) {
          isKeyboardShowing = isKeyboardNowShowing
          
          if (isKeyboardShowing) {
            // キーボードが表示された時
            rootView.setPadding(0, 0, 0, keypadHeight)
          } else {
            // キーボードが非表示になった時
            rootView.setPadding(0, 0, 0, 0)
          }
        }
      }
    })
  }
}