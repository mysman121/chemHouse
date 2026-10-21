package com.chemhouse.study;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.print.PrintManager;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import org.json.JSONObject;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class MainActivity extends Activity {
    private static final String ORIGIN = "https://chemhouse.ponlavat10.workers.dev";
    private static final int SAVE_NOTES = 21;
    private WebView web;
    private LinearLayout offline;
    private String pendingExport;
    private String lastStudyUrl = ORIGIN + "/";
    private boolean failed;
    private boolean exportBridge;

    private boolean trusted(Uri uri) {
        return uri != null && "https".equals(uri.getScheme()) &&
            "chemhouse.ponlavat10.workers.dev".equals(uri.getHost()) &&
            (uri.getPort() == -1 || uri.getPort() == 443) && uri.getUserInfo() == null;
    }
    private void external(Uri uri) {
        if (uri == null || !"https".equals(uri.getScheme()) || uri.getUserInfo() != null) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
        catch (ActivityNotFoundException ignored) { }
    }
    private void showOffline() { failed = true; offline.setVisibility(View.VISIBLE); web.setVisibility(View.GONE); }
    private void openStudy() {
        failed = false; offline.setVisibility(View.GONE); web.setVisibility(View.VISIBLE); web.loadUrl(lastStudyUrl);
    }
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        FrameLayout root = new FrameLayout(this);
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        offline = new LinearLayout(this); offline.setOrientation(LinearLayout.VERTICAL);
        offline.setGravity(Gravity.CENTER); offline.setPadding(32, 32, 32, 32);
        TextView message = new TextView(this); message.setText(R.string.offline); message.setTextSize(18);
        message.setGravity(Gravity.CENTER); offline.addView(message);
        Button retry = new Button(this); retry.setText(R.string.retry); retry.setOnClickListener(v -> openStudy()); offline.addView(retry);
        root.addView(offline, new FrameLayout.LayoutParams(-1, -1)); offline.setVisibility(View.GONE);
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars() | android.view.WindowInsets.Type.ime());
                v.setPadding(bars.left, 0, bars.right, bars.bottom);
            }
            return insets;
        });
        setContentView(root);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false); settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false); settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSafeBrowsingEnabled(true);
        web.setWebChromeClient(new WebChromeClient());
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            exportBridge = true;
            WebViewCompat.addWebMessageListener(web, "ChemHouseAndroid", Collections.singleton(ORIGIN),
                (view, msg, source, isMainFrame, reply) -> {
                    if (!isMainFrame || !trusted(source) || msg.getData() == null || msg.getData().length() > 250000) return;
                    try {
                        JSONObject data = new JSONObject(msg.getData());
                        if ("print".equals(data.optString("type"))) { printPage(); return; }
                        if (!"export-notes".equals(data.optString("type")) || pendingExport != null) return;
                        String text = data.getString("text");
                        if (text.length() > 200000) return;
                        pendingExport = text;
                        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                        intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("text/plain");
                        intent.putExtra(Intent.EXTRA_TITLE, "ChemHouse-notes.txt");
                        startActivityForResult(intent, SAVE_NOTES);
                    } catch (Exception ignored) { pendingExport = null; Toast.makeText(this, R.string.export_failed, Toast.LENGTH_LONG).show(); }
                });
        }
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (trusted(request.getUrl())) return false;
                if (request.isForMainFrame()) external(request.getUrl());
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, Bitmap icon) {
                if (trusted(Uri.parse(url))) { lastStudyUrl = url; failed = false; }
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (!trusted(Uri.parse(url)) || failed) return;
                offline.setVisibility(View.GONE); web.setVisibility(View.VISIBLE);
                if (exportBridge) view.evaluateJavascript("window.print=function(){window.ChemHouseAndroid.postMessage(JSON.stringify({type:'print'}));};", null);
                view.evaluateJavascript("(function(){try{new Function('return ({a:1})?.a ?? 0');return typeof fetch==='function'&&typeof AbortController==='function'&&typeof TextEncoder==='function';}catch(e){return false;}})()",
                    result -> { if (!"true".equals(result)) Toast.makeText(MainActivity.this, R.string.webview_old, Toast.LENGTH_LONG).show(); });
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOffline();
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel(); showOffline();
            }
        });
        if (saved == null || web.restoreState(saved) == null) openStudy();
    }
    private void printPage() {
        if (!trusted(Uri.parse(web.getUrl() == null ? "" : web.getUrl()))) return;
        PrintManager manager = (PrintManager) getSystemService(PRINT_SERVICE);
        manager.print("ChemHouse", web.createPrintDocumentAdapter("ChemHouse"), null);
    }
    @Override public boolean onCreateOptionsMenu(Menu menu) {
        menu.add(0, 1, 0, R.string.home); menu.add(0, 2, 1, R.string.reload);
        menu.add(0, 3, 2, R.string.open_browser); menu.add(0, 4, 3, R.string.print); return true;
    }
    @Override public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case 1: lastStudyUrl = ORIGIN + "/"; openStudy(); return true;
            case 2: if (failed) openStudy(); else web.reload(); return true;
            case 3: external(Uri.parse(lastStudyUrl)); return true;
            case 4: printPage(); return true;
            default: return super.onOptionsItemSelected(item);
        }
    }
    @Override protected void onSaveInstanceState(Bundle out) { web.saveState(out); super.onSaveInstanceState(out); }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != SAVE_NOTES) return;
        String text = pendingExport; pendingExport = null;
        if (result != RESULT_OK || data == null || data.getData() == null || text == null) return;
        try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
            if (output == null) throw new java.io.IOException("No destination");
            output.write(("\uFEFF" + text).getBytes(StandardCharsets.UTF_8));
            Toast.makeText(this, R.string.export_saved, Toast.LENGTH_SHORT).show();
        } catch (Exception ignored) { Toast.makeText(this, R.string.export_failed, Toast.LENGTH_LONG).show(); }
    }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() { if (web != null) { web.stopLoading(); web.destroy(); } super.onDestroy(); }
}
