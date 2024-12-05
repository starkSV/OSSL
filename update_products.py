import json
import requests
import os
from datetime import datetime

# Path to your product.json file
PRODUCT_JSON_PATH = './assets/data/product.json'

# Get the GitHub Personal Access Token from the environment variable
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

# Function to fetch the latest release from GitHub API
def fetch_latest_release(repo_url):
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}'
    }

    try:
        if 'github.com' in repo_url:
            # For GitHub repositories
            repo = repo_url.replace('https://github.com/', '')
            response = requests.get(f'https://api.github.com/repos/{repo}/releases/latest', headers=headers)
            response.raise_for_status()
            release_data = response.json()
            return {
                "version": release_data.get('tag_name', 'N/A'),
                "url": release_data.get('html_url', 'N/A'),
            }
        elif 'gitlab.com' in repo_url:
            # For GitLab repositories (no authentication required for public projects)
            repo = repo_url.replace('https://gitlab.com/', '')
            response = requests.get(f'https://gitlab.com/api/v4/projects/{repo.replace("/", "%2F")}/releases')
            response.raise_for_status()
            release_data = response.json()
            if release_data:
                return {
                    "version": release_data[0].get('tag_name', 'N/A'),
                    "url": release_data[0].get('assets', {}).get('links', [{}])[0].get('url', 'N/A'),
                }
            return None
        else:
            print(f"Unsupported platform for {repo_url}")
            return None
    except requests.RequestException as e:
        print(f"Error fetching data for {repo_url}: {e}")
        return None

# Update product.json with the latest data
def update_product_json():
    try:
        with open(PRODUCT_JSON_PATH, 'r') as file:
            products = json.load(file)

        for product in products:
            if "repository" in product and product["repository"]:
                print(f"Fetching latest release for {product['name']}...")
                latest = fetch_latest_release(product["repository"])
                if latest:
                    product["latest_version"] = latest["version"]
                    product["update_date"] = datetime.now().strftime('%Y-%m-%d')
                    if product["downloads"]:
                        # Update the first download link as an example
                        product["downloads"][0]["url"] = latest["url"]

        # Save the updated JSON back to file
        with open(PRODUCT_JSON_PATH, 'w') as file:
            json.dump(products, file, indent=2)
            print("Product JSON updated successfully!")
    except Exception as e:
        print(f"Error updating product.json: {e}")

# Run the updater
if __name__ == "__main__":
    update_product_json()
