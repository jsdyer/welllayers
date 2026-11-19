"""Exercise the built starter at a project subpath in Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import tempfile
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    screenshots = ROOT / "browser-checks"
    screenshots.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as temporary:
        shutil.copytree(ROOT / "dist", Path(temporary) / "welllayers")
        server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=temporary))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={"width": 1280, "height": 1000})
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.goto(f"http://127.0.0.1:{server.server_port}/welllayers/")
                page.locator("#result article").first.wait_for()
                assert page.locator("#result article").count() == 2
                page.get_by_label("Depth units").select_option("ft")
                assert "Depth (ft)" in page.locator("article").first.inner_text()
                assert page.locator(".slice").count() > 2
                page.get_by_label("First well").select_option("BC-30145")
                page.get_by_label("Compare with").select_option("NS-000119")
                assert "right=NS-000119" in page.url
                page.reload()
                page.locator("#aligned tr").first.wait_for()
                assert page.locator("#left").input_value() == "BC-30145"
                assert page.locator("#right").input_value() == "NS-000119"
                assert page.locator("#units").input_value() == "ft"
                assert any("coarse sand" in row and "shale" in row for row in page.locator("#aligned tr").all_inner_texts())
                page.locator('#example').click()
                assert 'coarse sand' in page.locator('#pair-evidence').inner_text()
                assert 'shale / unknown' in page.locator('#pair-evidence').inner_text()
                assert 'depth=20' in page.url
                page.locator('#sample summary').click()
                assert page.locator('#sample-table tbody tr').count() == int(page.locator('#count').inner_text())
                page.locator('#sample-area').select_option('Hammonds Plains')
                assert page.locator('#sample-table tbody tr').count() == 8
                page.locator('#sample-status').select_option('overlap')
                assert 'No sample log' in page.locator('#sample-table').inner_text()
                page.locator('#probe-depth').fill('22.2504')
                assert 'At the final logged boundary' in page.locator('#pair-evidence').inner_text()
                page.locator('#units').select_option('ft')
                assert float(page.locator('#probe-depth').input_value()) == 73
                page.reload()
                page.locator('#pair-evidence .probe-card').first.wait_for()
                assert 'At the final logged boundary' in page.locator('#pair-evidence').inner_text()
                page.locator('#probe-depth').fill('')
                assert 'Enter a depth' in page.locator('#probe-summary').inner_text()
                assert page.locator('#pair-evidence').inner_text() == ''
                page.locator('#example').click()
                page.screenshot(path=str(screenshots / "desktop.png"), full_page=True)
                page.set_viewport_size({"width": 390, "height": 844})
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
                page.screenshot(path=str(screenshots / "mobile.png"), full_page=True)
                assert not errors, errors
                browser.close()
            print("Browser checks passed: comparison filters, project subpath and mobile layout")
        finally:
            server.shutdown()


if __name__ == "__main__":
    main()
