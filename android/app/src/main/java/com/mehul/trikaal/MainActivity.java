package com.mehul.trikaal;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

/** Trikaal: the whole app is one offline web page in a WebView, with a small bridge for files, sharing, printing and HTTP. */
public class MainActivity extends Activity {
    private static final int REQ_SAVE = 11, REQ_OPEN = 12, REQ_CHOOSER = 13;
    private static final int BG = 0xFFF6F4EF;
    private WebView web;
    private String pendingSave = null;
    private ValueCallback<Uri[]> chooserCb = null;
    private final Handler ui = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        Window w = getWindow();
        w.setStatusBarColor(BG);
        w.setNavigationBarColor(BG);
        int flags = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        w.getDecorView().setSystemUiVisibility(flags);

        web = new WebView(this);
        web.setBackgroundColor(BG);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(true);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("file".equals(u.getScheme())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (chooserCb != null) chooserCb.onReceiveValue(null);
                chooserCb = cb;
                try { startActivityForResult(p.createIntent(), REQ_CHOOSER); } catch (Exception e) { chooserCb = null; return false; }
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "Android");
        setContentView(web);
        String route = getIntent() != null ? getIntent().getStringExtra("route") : null;
        web.loadUrl("file:///android_asset/www/index.html" + (route != null ? "#/" + route : ""));
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.trikaalBack ? window.trikaalBack() : 'false')", r -> {
            if (r == null || !r.contains("true")) finish();
        });
    }

    private void js(final String code) { ui.post(() -> web.evaluateJavascript(code, null)); }

    private File stateFile() { return new File(getFilesDir(), "trikaal-state.json"); }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == REQ_CHOOSER) {
            if (chooserCb != null) chooserCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            chooserCb = null;
            return;
        }
        if (res != RESULT_OK || data == null || data.getData() == null) { pendingSave = null; return; }
        Uri uri = data.getData();
        if (req == REQ_SAVE && pendingSave != null) {
            try (OutputStream o = getContentResolver().openOutputStream(uri, "wt")) {
                o.write(pendingSave.getBytes(StandardCharsets.UTF_8));
                Toast.makeText(this, "Backup saved", Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
                Toast.makeText(this, "Could not save: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
            pendingSave = null;
        } else if (req == REQ_OPEN) {
            try (InputStream in = getContentResolver().openInputStream(uri)) {
                String text = readAll(in);
                js("window.onFileOpened(" + JSONObject.quote(text) + ")");
            } catch (Exception e) {
                Toast.makeText(this, "Could not open: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        }
    }

    private static String readAll(InputStream in) throws Exception {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
        return new String(bo.toByteArray(), StandardCharsets.UTF_8);
    }

    private class Bridge {
        @JavascriptInterface
        public String loadState() {
            File f = stateFile();
            if (!f.exists()) return null;
            try (InputStream in = new java.io.FileInputStream(f)) { return readAll(in); } catch (Exception e) { return null; }
        }

        @JavascriptInterface
        public void saveState(String json) {
            try {
                File tmp = new File(getFilesDir(), "trikaal-state.tmp");
                try (FileOutputStream o = new FileOutputStream(tmp)) { o.write(json.getBytes(StandardCharsets.UTF_8)); o.getFD().sync(); }
                if (!tmp.renameTo(stateFile())) { stateFile().delete(); tmp.renameTo(stateFile()); }
            } catch (Exception e) { }
        }

        @JavascriptInterface
        public void shareText(String title, String text) {
            ui.post(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_SUBJECT, title);
                i.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(i, "Share"));
            });
        }

        @JavascriptInterface
        public void saveFile(String name, String mime, String text) {
            ui.post(() -> {
                pendingSave = text;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType(mime);
                i.putExtra(Intent.EXTRA_TITLE, name);
                try { startActivityForResult(i, REQ_SAVE); } catch (Exception e) { Toast.makeText(MainActivity.this, "No file manager found", Toast.LENGTH_LONG).show(); }
            });
        }

        @JavascriptInterface
        public void openFile() {
            ui.post(() -> {
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try { startActivityForResult(i, REQ_OPEN); } catch (Exception e) { Toast.makeText(MainActivity.this, "No file manager found", Toast.LENGTH_LONG).show(); }
            });
        }

        @JavascriptInterface
        public void scheduleReminder(String id, String title, String body, int hour, int minute, String days) {
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED)
                ui.post(() -> requestPermissions(new String[] { "android.permission.POST_NOTIFICATIONS" }, 21));
            ReminderReceiver.schedule(MainActivity.this, id, title, body, hour, minute, days);
        }

        @JavascriptInterface
        public void cancelReminder(String id) { ReminderReceiver.cancel(MainActivity.this, id); }

        @JavascriptInterface
        public void scheduleOnce(String id, String title, String body, double at, String route) {
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED)
                ui.post(() -> requestPermissions(new String[] { "android.permission.POST_NOTIFICATIONS" }, 21));
            ReminderReceiver.scheduleOnce(MainActivity.this, id, title, body, (long) at, route);
        }

        @JavascriptInterface
        public void clearOnce(String prefix) { ReminderReceiver.clearOnce(MainActivity.this, prefix); }

        @JavascriptInterface
        public void print(String title) {
            ui.post(() -> {
                PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter ad = web.createPrintDocumentAdapter(title == null ? "Trikaal" : title);
                pm.print(title == null ? "Trikaal" : title, ad, new PrintAttributes.Builder().build());
            });
        }

        /* Server-sent events: each "data:" line goes to window.__httpChunk(id, json); the end goes to __httpCb(id, status, errorText) */
        @JavascriptInterface
        public void httpStream(final String id, final String url, final String headersJson, final String body) {
            new Thread(() -> {
                int status = 0;
                String text = "";
                HttpURLConnection c = null;
                try {
                    c = (HttpURLConnection) new URL(url).openConnection();
                    c.setRequestMethod("POST");
                    c.setConnectTimeout(20000);
                    c.setReadTimeout(150000);
                    JSONObject h = new JSONObject(headersJson == null || headersJson.isEmpty() ? "{}" : headersJson);
                    Iterator<String> it = h.keys();
                    while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, h.getString(k)); }
                    c.setDoOutput(true);
                    try (OutputStream o = c.getOutputStream()) { o.write(body.getBytes(StandardCharsets.UTF_8)); }
                    status = c.getResponseCode();
                    if (status >= 400) {
                        InputStream in = c.getErrorStream();
                        text = in == null ? "" : readAll(in);
                    } else {
                        BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8));
                        String line;
                        while ((line = r.readLine()) != null) {
                            if (line.startsWith("data:")) js("window.__httpChunk(" + JSONObject.quote(id) + "," + JSONObject.quote(line.substring(5).trim()) + ")");
                        }
                    }
                } catch (Exception e) {
                    status = 0;
                    text = e.getClass().getSimpleName() + ": " + e.getMessage();
                } finally {
                    if (c != null) c.disconnect();
                }
                js("window.__httpCb(" + JSONObject.quote(id) + "," + status + "," + JSONObject.quote(text) + ")");
            }).start();
        }

        @JavascriptInterface
        public void http(final String id, final String method, final String url, final String headersJson, final String body) {
            new Thread(() -> {
                int status = 0;
                String text;
                HttpURLConnection c = null;
                try {
                    c = (HttpURLConnection) new URL(url).openConnection();
                    c.setRequestMethod(method);
                    c.setConnectTimeout(20000);
                    c.setReadTimeout(120000);
                    JSONObject h = new JSONObject(headersJson == null || headersJson.isEmpty() ? "{}" : headersJson);
                    Iterator<String> it = h.keys();
                    while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, h.getString(k)); }
                    if (body != null && !body.isEmpty() && !"GET".equals(method)) {
                        c.setDoOutput(true);
                        try (OutputStream o = c.getOutputStream()) { o.write(body.getBytes(StandardCharsets.UTF_8)); }
                    }
                    status = c.getResponseCode();
                    InputStream in = status >= 400 ? c.getErrorStream() : c.getInputStream();
                    text = in == null ? "" : readAll(in);
                } catch (Exception e) {
                    status = 0;
                    text = e.getClass().getSimpleName() + ": " + e.getMessage();
                } finally {
                    if (c != null) c.disconnect();
                }
                js("window.__httpCb(" + JSONObject.quote(id) + "," + status + "," + JSONObject.quote(text) + ")");
            }).start();
        }
    }
}
