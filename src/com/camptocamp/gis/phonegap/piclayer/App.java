package com.camptocamp.gis.phonegap.piclayer;

import android.os.Bundle;

import com.phonegap.DroidGap;

public class App extends DroidGap {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.init();
        super.appView.clearCache(true);
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        super.setBooleanProperty("keepRunning", false);
        loadUrl("file:///android_asset/www/index.html", 1000);
    }
}
