use serde::Serialize;
use std::ffi::CString;
use std::os::raw::{c_char, c_int, c_long, c_void};

// ── Opaque CF/CG types ────────────────────────────────────────────────────────
type CFTypeRef    = *const c_void;
type CFStringRef  = *const c_void;
type CFArrayRef   = *const c_void;
type CFDictRef    = *const c_void;
type CFNumberRef  = *const c_void;
type CFIndex      = c_long;

const CF_STRING_ENCODING_UTF8: u32 = 0x0800_0100;
const CF_NUMBER_S_INT32_TYPE:  c_int = 3;

const CG_WINDOW_LIST_OPTION_ON_SCREEN_ONLY:       u32 = 1 << 0;
const CG_WINDOW_LIST_EXCLUDE_DESKTOP_ELEMENTS:    u32 = 1 << 4;

// ── CoreFoundation ────────────────────────────────────────────────────────────
#[link(name = "CoreFoundation", kind = "framework")]
unsafe extern "C" {
    fn CFArrayGetCount(array: CFArrayRef) -> CFIndex;
    fn CFArrayGetValueAtIndex(array: CFArrayRef, idx: CFIndex) -> CFTypeRef;
    fn CFDictionaryGetValue(dict: CFDictRef, key: CFStringRef) -> CFTypeRef;
    fn CFStringCreateWithCString(
        alloc: CFTypeRef, cStr: *const c_char, encoding: u32,
    ) -> CFStringRef;
    fn CFStringGetCString(
        str: CFStringRef, buf: *mut c_char, buf_size: CFIndex, encoding: u32,
    ) -> bool;
    fn CFNumberGetValue(
        number: CFNumberRef, the_type: c_int, value_ptr: *mut c_void,
    ) -> bool;
    fn CFRelease(cf: CFTypeRef);
}

// ── CoreGraphics ──────────────────────────────────────────────────────────────
#[link(name = "CoreGraphics", kind = "framework")]
unsafe extern "C" {
    fn CGWindowListCopyWindowInfo(option: u32, relative_to_window: u32) -> CFArrayRef;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
fn make_cf_key(s: &str) -> CFStringRef {
    let c = CString::new(s).unwrap();
    unsafe { CFStringCreateWithCString(std::ptr::null(), c.as_ptr(), CF_STRING_ENCODING_UTF8) }
}

fn cf_string_to_rust(s: CFStringRef) -> String {
    if s.is_null() {
        return String::new();
    }
    let mut buf = vec![0i8; 1024];
    let ok = unsafe {
        CFStringGetCString(s, buf.as_mut_ptr(), buf.len() as CFIndex, CF_STRING_ENCODING_UTF8)
    };
    if !ok {
        return String::new();
    }
    let cstr = unsafe { std::ffi::CStr::from_ptr(buf.as_ptr()) };
    cstr.to_string_lossy().into_owned()
}

// ── Public types ──────────────────────────────────────────────────────────────
#[derive(Serialize, Clone)]
pub struct WindowInfo {
    pub id:    u32,
    pub title: String,
    pub app:   String,
}

// ── list_windows ──────────────────────────────────────────────────────────────
pub fn list_windows_impl() -> Vec<WindowInfo> {
    let mut result = Vec::new();

    let option = CG_WINDOW_LIST_OPTION_ON_SCREEN_ONLY | CG_WINDOW_LIST_EXCLUDE_DESKTOP_ELEMENTS;

    let array = unsafe { CGWindowListCopyWindowInfo(option, 0) };
    if array.is_null() {
        return result;
    }

    let count = unsafe { CFArrayGetCount(array) };

    for i in 0..count {
        let dict = unsafe { CFArrayGetValueAtIndex(array, i) as CFDictRef };
        if dict.is_null() {
            continue;
        }

        // ── Window layer — only layer 0 = normal app windows ──────────────
        // Menu bar, Dock, status-bar icons (battery, wifi…) all live on
        // higher layers (8, 20, 25…). Keeping layer == 0 filters them out.
        let layer_key = make_cf_key("kCGWindowLayer");
        let layer_ref = unsafe { CFDictionaryGetValue(dict, layer_key) as CFNumberRef };
        unsafe { CFRelease(layer_key) };
        let mut layer: i32 = -1;
        if !layer_ref.is_null() {
            unsafe {
                CFNumberGetValue(
                    layer_ref,
                    CF_NUMBER_S_INT32_TYPE,
                    &mut layer as *mut i32 as *mut c_void,
                );
            }
        }
        if layer != 0 {
            continue; // skip menu bar, Dock, overlays, etc.
        }

        // ── Window number ──────────────────────────────────────────────────
        let num_key = make_cf_key("kCGWindowNumber");
        let num_ref = unsafe { CFDictionaryGetValue(dict, num_key) as CFNumberRef };
        unsafe { CFRelease(num_key) };
        let mut window_id: i32 = 0;
        if !num_ref.is_null() {
            unsafe {
                CFNumberGetValue(
                    num_ref,
                    CF_NUMBER_S_INT32_TYPE,
                    &mut window_id as *mut i32 as *mut c_void,
                );
            }
        }
        if window_id <= 0 {
            continue;
        }

        // ── App name ───────────────────────────────────────────────────────
        let app_key = make_cf_key("kCGWindowOwnerName");
        let app_ref = unsafe { CFDictionaryGetValue(dict, app_key) as CFStringRef };
        unsafe { CFRelease(app_key) };
        let app = cf_string_to_rust(app_ref);

        // Skip known system processes that have layer-0 helper windows
        const SKIP_APPS: &[&str] = &[
            "Window Server", "Dock", "loginwindow", "SystemUIServer",
            "Control Center", "Notification Center", "Spotlight",
            "AXVisualSupportAgent", "universalaccessd",
        ];
        if SKIP_APPS.contains(&app.as_str()) {
            continue;
        }

        // ── Window title — must be non-empty ──────────────────────────────
        let title_key = make_cf_key("kCGWindowName");
        let title_ref = unsafe { CFDictionaryGetValue(dict, title_key) as CFStringRef };
        unsafe { CFRelease(title_key) };
        let title = cf_string_to_rust(title_ref);
        if title.is_empty() {
            continue;
        }

        result.push(WindowInfo {
            id: window_id as u32,
            title,
            app,
        });
    }

    unsafe { CFRelease(array) };
    result
}

// ── capture_window ────────────────────────────────────────────────────────────
// Uses macOS's built-in `screencapture` CLI which supports capturing a single
// window by CGWindowID: `screencapture -l <id> -x <file>`
pub fn capture_window_impl(id: u32) -> Option<String> {
    use std::fs;
    use std::process::Command;

    let path = format!("/tmp/leren_win_{}.png", id);

    let status = Command::new("screencapture")
        .args([
            "-l",
            &id.to_string(),
            "-x",          // no sounds/screen flash
            "-m",          // only capture the window, not its shadow
            &path,
        ])
        .status()
        .ok()?;

    if !status.success() {
        return None;
    }

    let bytes = fs::read(&path).ok()?;
    let _ = fs::remove_file(&path);

    Some(base64_encode(&bytes))
}

fn base64_encode(data: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity((data.len() + 2) / 3 * 4);
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as usize;
        let b1 = if chunk.len() > 1 { chunk[1] as usize } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as usize } else { 0 };
        out.push(CHARS[(b0 >> 2)] as char);
        out.push(CHARS[((b0 & 3) << 4) | (b1 >> 4)] as char);
        out.push(if chunk.len() > 1 { CHARS[((b1 & 0xf) << 2) | (b2 >> 6)] as char } else { '=' });
        out.push(if chunk.len() > 2 { CHARS[b2 & 0x3f] as char } else { '=' });
    }
    out
}
