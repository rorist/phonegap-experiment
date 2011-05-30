package com.camptocamp.gis.phonegap;

import android.os.Bundle;

import com.phonegap.DroidGap;

public class App extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        clearCache();
        loadUrl("file:///android_asset/www/index.html");
    }
    
}
