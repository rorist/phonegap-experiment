package com.camptocamp.gis.phonegap;

import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebSettings.LayoutAlgorithm;
import android.widget.LinearLayout;

import com.phonegap.CallbackServer;
import com.phonegap.DroidGap;
import com.phonegap.WebViewReflect;
import com.phonegap.api.PluginManager;

public class App extends DroidGap {

    private static final String EVT_START = "{start: {type: 'start',touches: [{clientX: %f,clientY: %f}, {clientX: %f,clientY: %f}]}}";
    private static final String EVT_MOVE = "{move: {type: 'move',touches: [{clientX: %f,clientY: %f}, {clientX: %f,clientY: %f}]}}";
    private static final String EVT_END = "{done: {type: 'done',touches: []}}";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void init() {

        // Create web container
        this.appView = new WebView(App.this) {
            @Override
            public boolean onTouchEvent(MotionEvent ev) {

                if (ev.getAction() == MotionEvent.ACTION_POINTER_2_DOWN) {
                    // Gesture start
                    
                    // String start = String.format(EVT_START, ev.getX(0), ev.getY(0), ev.getX(1),
                    // ev
                    // .getY(1));
                    // appView.loadUrl("javascript:pinch.touchstart(" + start + ")");
                    // Log.e("TEST", "start="+start);
                    return true;
                }
                if (ev.getAction() == MotionEvent.ACTION_POINTER_1_UP
                        || ev.getAction() == MotionEvent.ACTION_POINTER_2_UP) {
                    // Gesture End
                    
                    // appView.loadUrl("javascript:pinch.touchend(" + EVT_END + ")");
                    return true;
                }

                if (ev.getPointerCount() > 1) {
                    // Gesture Move
                    
                    // String move = String.format(EVT_MOVE, ev.getX(0), ev.getY(0), ev.getX(1), ev
                    // .getY(1));
                    // appView.loadUrl("javascript:pinch.touchmove(" + move + ")");
                    // Log.e("TEST", "move="+move);
                }
                return super.onTouchEvent(ev);
            }
        };
        this.appView.setId(100);

        this.appView.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.FILL_PARENT, ViewGroup.LayoutParams.FILL_PARENT, 1.0F));

        WebViewReflect.checkCompatibility();

        if (android.os.Build.VERSION.RELEASE.startsWith("1.")) {
            this.appView.setWebChromeClient(new GapClient(App.this));
        }
        else {
            this.appView.setWebChromeClient(new EclairClient(App.this));
        }

        this.setWebViewClient(this.appView, new GapViewClient(this));

        this.appView.setInitialScale(100);
        this.appView.setVerticalScrollBarEnabled(false);
        this.appView.requestFocusFromTouch();

        // Enable JavaScript
        WebSettings settings = this.appView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setLayoutAlgorithm(LayoutAlgorithm.NORMAL);

        // Enable database
        Package pack = this.getClass().getPackage();
        String appPackage = pack.getName();
        WebViewReflect.setStorage(settings, true, "/data/data/" + appPackage + "/app_database/");

        // Enable DOM storage
        WebViewReflect.setDomStorage(settings);

        // Enable built-in geolocation
        WebViewReflect.setGeolocationEnabled(settings, true);

        // Bind PhoneGap objects to JavaScript
        // this.bindBrowser(this.appView);
        this.callbackServer = new CallbackServer();
        this.pluginManager = new PluginManager(appView, this);
        this.addService("App", "com.phonegap.App");
        this.addService("Geolocation", "com.phonegap.GeoBroker");
        this.addService("Device", "com.phonegap.Device");
        this.addService("Accelerometer", "com.phonegap.AccelListener");
        this.addService("Compass", "com.phonegap.CompassListener");
        this.addService("Media", "com.phonegap.AudioHandler");
        this.addService("Camera", "com.phonegap.CameraLauncher");
        this.addService("Contacts", "com.phonegap.ContactManager");
        this.addService("Crypto", "com.phonegap.CryptoHandler");
        this.addService("File", "com.phonegap.FileUtils");
        this.addService("Location", "com.phonegap.GeoBroker");
        this.addService("Network Status", "com.phonegap.NetworkManager");
        this.addService("Notification", "com.phonegap.Notification");
        this.addService("Storage", "com.phonegap.Storage");
        this.addService("Temperature", "com.phonegap.TempListener");
        this.addService("FileTransfer", "com.phonegap.FileTransfer");
        this.addService("Capture", "com.phonegap.Capture");

        // Add web view but make it invisible while loading URL
        this.appView.setVisibility(View.INVISIBLE);
        root.addView(this.appView);
        setContentView(root);

        // Clear cancel flag
        this.cancelLoadUrl = false;

        // If url specified, then load it
        String url = this.getStringProperty("url", null);
        if (url != null) {
            System.out.println("Loading initial URL=" + url);
            this.loadUrl(url);
        }
    }
}
