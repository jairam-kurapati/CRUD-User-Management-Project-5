# CRUD User Management

A polished Flask-based CRUD application that stores user data in memory using Python lists and dictionaries. The app includes user creation, editing, deletion, and prediction logic powered by a simple machine learning model.

## Features

- Add, edit, and delete users without using a database
- In-memory storage with Python `list` and `dict`
- Machine learning age category prediction using `scikit-learn`
- Search, filter, and sort support via server-side rendering
- Modern SaaS-inspired dashboard with glassmorphism styling
- Responsive design with Bootstrap 5
- CSS-only dark mode toggle
- REST API endpoints available for integration

## Project Structure

```
AI_User_Management/
│
├── app.py
├── model.py
├── requirements.txt
├── README.md
├── README_API.md
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
```

## Requirements

- Python 3.10+
- Flask
- scikit-learn
- pandas
- numpy

## Install

```powershell
python -m pip install -r requirements.txt
```

## Run

```powershell
python app.py
```

Open your browser at:

```text
http://127.0.0.1:5000/
```

## Notes

- This project uses in-memory storage only. Restarting the server clears all user data.
- The ML model categorizes age into:
  - `Student` for age < 18
  - `Young Professional` for age 18-30
  - `Professional` for age 31-50
  - `Senior Citizen` for age 50+

## Future Enhancements

- Add pagination for large user lists
- Persist data to an optional file or database
- Add authentication for secure user management
- Replace the simple model with a custom predictive pipeline
