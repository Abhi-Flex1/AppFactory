import Foundation
import WebKit
import Cocoa

class SnapshotRunner: NSObject, WKNavigationDelegate {
    let webView: WKWebView
    let outputURL: URL
    let fullPage: Bool
    
    init(url: URL, output: URL, width: CGFloat, height: CGFloat, fullPage: Bool = false) {
        self.outputURL = output
        self.fullPage = fullPage
        let config = WKWebViewConfiguration()
        self.webView = WKWebView(frame: CGRect(x: 0, y: 0, width: width, height: height), configuration: config)
        super.init()
        self.webView.navigationDelegate = self
        self.webView.load(URLRequest(url: url))
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            if self.fullPage {
                self.webView.evaluateJavaScript("document.body.scrollHeight") { [weak self] (result, error) in
                    guard let self = self else { return }
                    var newHeight = self.webView.frame.height
                    if let h = result as? CGFloat, h > 100 {
                        newHeight = min(h, 16000)
                    }
                    self.webView.frame = CGRect(x: 0, y: 0, width: self.webView.frame.width, height: newHeight)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        self.capture()
                    }
                }
            } else {
                self.capture()
            }
        }
    }
    
    func capture() {
        let config = WKSnapshotConfiguration()
        self.webView.takeSnapshot(with: config) { [weak self] image, error in
            guard let self = self else { return }
            if let image = image,
               let tiff = image.tiffRepresentation,
               let rep = NSBitmapImageRep(data: tiff),
               let png = rep.representation(using: .png, properties: [:]) {
                do {
                    try png.write(to: self.outputURL)
                    print("OK: \(self.outputURL.path)")
                } catch {
                    print("ERR: write failed \(error)")
                }
            } else {
                print("ERR: snapshot failed \(String(describing: error))")
            }
            CFRunLoopStop(CFRunLoopGetCurrent())
        }
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("FAIL: \(error)")
        CFRunLoopStop(CFRunLoopGetCurrent())
    }
}

let args = CommandLine.arguments
guard args.count >= 3 else {
    print("Usage: snapshot <url> <output.png> [width] [height] [--full] [--eval <js>]")
    exit(1)
}

let url = URL(string: args[1])!
let out = URL(fileURLWithPath: args[2])
let w = args.count > 3 && !args[3].starts(with: "--") ? (CGFloat(Double(args[3]) ?? 1280)) : 1280
let h = args.count > 4 && !args[4].starts(with: "--") ? (CGFloat(Double(args[4]) ?? 900)) : 900
let full = args.contains("--full")
var evalJs: String? = nil
if let evalIdx = args.firstIndex(of: "--eval"), evalIdx + 1 < args.count {
    evalJs = args[evalIdx + 1]
}

class ScriptSnapshotRunner: SnapshotRunner {
    let script: String?
    init(url: URL, output: URL, width: CGFloat, height: CGFloat, fullPage: Bool, script: String?) {
        self.script = script
        super.init(url: url, output: output, width: width, height: height, fullPage: fullPage)
    }
    
    override func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            if let script = self.script {
                self.webView.evaluateJavaScript(script) { res, err in
                    if let err = err {
                        print("EVAL ERR: \(err)")
                    } else if let res = res {
                        print("EVAL RES: \(res)")
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        self.handlePostNav()
                    }
                }
            } else {
                self.handlePostNav()
            }
        }
    }
    
    func handlePostNav() {
        if self.fullPage {
            self.webView.evaluateJavaScript("document.body.scrollHeight") { [weak self] (result, error) in
                guard let self = self else { return }
                var newHeight = self.webView.frame.height
                if let h = result as? CGFloat, h > 100 {
                    newHeight = min(h, 16000)
                }
                self.webView.frame = CGRect(x: 0, y: 0, width: self.webView.frame.width, height: newHeight)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    self.capture()
                }
            }
        } else {
            self.capture()
        }
    }
}

let runner = ScriptSnapshotRunner(url: url, output: out, width: w, height: h, fullPage: full, script: evalJs)
CFRunLoopRun()
