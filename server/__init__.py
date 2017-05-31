from flask import Flask
from flask import jsonify
from flask import request
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS, cross_origin
import curio
import curio_http

app = Flask(__name__)
CORS(app)

google_endpoint = 'https://www.googleapis.com/customsearch/v1'
google_key = 'xxx'
google_context = 'xxx'

def extract_text(html_text):
    soup = BeautifulSoup(html_text, 'html.parser')

    for script in soup(["script", "style"]):
        script.extract()

    text = soup.get_text()

    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)

    return text

def fetch_google_res(query):
    r = requests.get(google_endpoint + '?key=' + google_key + '&cx=' + google_context + '&q=' + query)
    json_res = r.json()

    # json_res = {}
    # with open('query_galaxy.json') as json_data:
    #     json_res = json.load(json_data)

    return json_res

async def fetch_website_content(web_res):
    async with curio_http.ClientSession() as session:
        response = await session.get(web_res['link'])
        html = await response.text()
        return response, html, web_res

async def fetch_websites_content(google_res):
    tasks = []
    res = []
    for web_res in google_res['items']:
        #print('--- Extracting : ' + web_res['link'])
        task = await curio.spawn(fetch_website_content(web_res))
        tasks.append(task)

    for task in tasks:
        response, html, web_res = await task.join()
        #print('+++ Extracted : ' + web_res['link'])
        if response.status_code == 200:
            res.append({
                'url': web_res['link'],
                'title': web_res['title'],
                'display_url': web_res['displayLink'],
                'snippet': web_res['htmlSnippet'],
                'text': extract_text(html)
            })

    return res

@app.route("/")
def get_web_content():

    query = request.args.get('q')
    if not(query):
        query = 'galaxy'
    google_res = fetch_google_res(query)
    res = curio.run(fetch_websites_content(google_res))

    return jsonify({'res': res})

if __name__ == "__main__":
    app.run()
