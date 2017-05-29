from flask import Flask
from flask import jsonify
from flask import request
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

def extract_text(link):
    r = requests.get(link)
    soup = BeautifulSoup(r.text, 'html.parser')

    for script in soup(["script", "style"]):
        script.extract()

    text = soup.get_text()

    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)

    return text

def do_something(response):
    print(response.url)

@app.route("/")
def get_web_content():
    url = 'https://www.googleapis.com/customsearch/v1'
    key = 'xxx'
    context = 'xxx'
    query = request.args.get('q')
    if not(query):
        query = 'galaxy'
    r = requests.get(url + '?key=' + key + '&cx=' + context + '&q=' + query)
    json_res = r.json()

    #json_res = {}
    #with open('galaxy.json') as json_data:
    #    json_res = json.load(json_data)

    res = []
    for web_res in json_res['items']:
        print('--- Extracting : ' + web_res['link'])
        text = extract_text(web_res['link'])
        print('+++ Extracted : ' + web_res['link'])
        res.append({
            'url': web_res['link'],
            'title': web_res['title'],
            'display_url': web_res['displayLink'],
            'snippet': web_res['htmlSnippet'],
            'text': text
        })

    return jsonify({'res' :res})

if __name__ == "__main__":
    app.run()
