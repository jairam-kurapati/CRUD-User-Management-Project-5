import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier


class AgePredictor:
    def __init__(self):
        self.model = self._train_model()
        self.labels = {
            0: "Student",
            1: "Young Professional",
            2: "Professional",
            3: "Senior Citizen",
        }

    def _train_model(self):
        data = pd.DataFrame({
            "age": [8, 12, 16, 18, 22, 27, 30, 33, 40, 45, 52, 60, 72],
            "category": [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3],
        })

        X = data[["age"]].values
        y = data["category"].values
        model = DecisionTreeClassifier(random_state=42)
        model.fit(X, y)
        return model

    def predict(self, age):
        age_array = np.array([[age]])
        category_index = self.model.predict(age_array)[0]
        return self.labels.get(category_index, "Unknown")


predictor = AgePredictor()


def predict_age_category(age):
    try:
        age_value = int(age)
    except (ValueError, TypeError):
        age_value = 0
    return predictor.predict(age_value)
