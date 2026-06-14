# Travel Recommender

A responsive travel-recommendation website — search a keyword (beach, temple, or a country) and get matching destination cards with photos and descriptions. Built with vanilla HTML, CSS, and JavaScript (Bootstrap for layout). Capstone project for the Coursera / IBM front-end course.

**🔗 Live demo: [faisal-almugesib.github.io/CourseraFinalProject](https://faisal-almugesib.github.io/CourseraFinalProject/)**

![Travel Recommender home](docs/home.png)

## Features

- **Keyword search** across categories (beaches, temples, countries) with simple synonym handling (e.g. "beach"/"beaches")
- **Data-driven cards** rendered from a local `travel_recommendation_api.json`
- **Clear / reset** button and a contact form
- Multi-page site: Home, About us, Contact us
- Responsive layout via Bootstrap

## Structure

```
index.html                       # home + search
about_us.html / contact_us.html  # secondary pages
travel_recommendation.js         # fetch JSON, search, render cards
travel_recommendation_api.json   # destination data
*.jpg                            # destination imagery
```

## Running

It's a static site — open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```
