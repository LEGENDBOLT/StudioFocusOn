
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:4173")

        # Attendi che il componente Timer sia visibile
        page.wait_for_selector('text=Pomodoro Classico')

        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
