from playwright.async_api import async_playwright
import bs4
import asyncio

class JobScraper:
    async def scrape_job(self, url: str) -> dict:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle")
            
            # Extract content
            content = await page.content()
            soup = bs4.BeautifulSoup(content, 'html.parser')
            
            # Basic extraction (can be improved with specific site selectors)
            # We look for common job description containers
            title = await page.title()
            
            # Clean up script and style elements
            for script_or_style in soup(["script", "style"]):
                script_or_style.decompose()
            
            text = soup.get_text(separator=' ')
            # Basic cleanup of extra whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            clean_text = '\n'.join(chunk for chunk in chunks if chunk)

            await browser.close()
            
            return {
                "title": title,
                "description": clean_text,
                "url": url
            }

job_scraper = JobScraper()
