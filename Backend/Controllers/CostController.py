from Models.CostModel import CostModel
from typing import Dict, Any


class CostController:
    def __init__(self):
        try:
            self.cost_model = CostModel()
        except Exception as e:
            print(f"Failed to initialize cost model: {str(e)}")
            self.cost_model = None

    def predict_cost(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Handle cost prediction request"""
        try:
            # Check if model is loaded
            if self.cost_model is None:
                return {
                    "error": "Cost model not initialized",
                    "status": "error",
                }

            # Validate input
            if not features:
                return {
                    "error": "No features provided",
                    "status": "error",
                }

            # Validate feature types
            if not isinstance(features, dict):
                return {
                    "error": "Features must be a dictionary",
                    "status": "error",
                }

            # Check for empty features dict
            if len(features) == 0:
                return {
                    "error": "Features dictionary is empty",
                    "status": "error",
                }

            # Make prediction
            result = self.cost_model.predict(features)
            return result

        except Exception as e:
            return {
                "error": f"Prediction failed: {str(e)}",
                "status": "error",
            }
