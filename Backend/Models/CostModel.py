import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any
import os
import joblib

class CostModel:
    def __init__(self, model_path: str = "ml_models/cost_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the pickled model with compatibility handling"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
            
            # Try multiple loading methods for compatibility
            self.model = self._try_load_model()
            print(f"Model loaded successfully from {self.model_path}")
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise e
    
    def _try_load_model(self):
        """Try different methods to load the model"""
        loading_methods = [
            self._load_with_joblib,
            self._load_with_pickle_default,
            self._load_with_pickle_latin1,
            self._load_with_pickle_bytes
        ]
        
        for method in loading_methods:
            try:
                model = method()
                if model is not None:
                    print(f"Successfully loaded model using {method.__name__}")
                    return model
            except Exception as e:
                print(f"Failed to load with {method.__name__}: {str(e)}")
                continue
        
        raise Exception("All loading methods failed")
    
    def _load_with_joblib(self):
        """Try loading with joblib"""
        return joblib.load(self.model_path)
    
    def _load_with_pickle_default(self):
        """Try loading with default pickle"""
        with open(self.model_path, 'rb') as f:
            return pickle.load(f)
    
    def _load_with_pickle_latin1(self):
        """Try loading with latin1 encoding"""
        with open(self.model_path, 'rb') as f:
            return pickle.load(f, encoding='latin1')
    
    def _load_with_pickle_bytes(self):
        """Try loading with bytes encoding"""
        with open(self.model_path, 'rb') as f:
            return pickle.load(f, encoding='bytes')
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction using the loaded model"""
        try:
            if self.model is None:
                return {
                    "error": "Model not loaded",
                    "status": "error"
                }
            
            # Validate input features
            if not features or not isinstance(features, dict):
                return {
                    "error": "Features must be a non-empty dictionary",
                    "status": "error"
                }
            
            # Make prediction with different input formats
            prediction = self._make_prediction(features)
            
            # Format result
            result = {
                "prediction": self._format_prediction(prediction),
                "status": "success"
            }
            
            # Add probability/confidence if classifier
            if hasattr(self.model, 'predict_proba'):
                try:
                    confidence = self._get_prediction_probability(features)
                    if confidence is not None:
                        result["confidence"] = confidence
                except Exception as e:
                    print(f"Could not get probability: {str(e)}")
            
            return result
            
        except Exception as e:
            return {
                "error": f"Prediction failed: {str(e)}",
                "status": "error"
            }
    
    def _make_prediction(self, features: Dict[str, Any]):
        """Make prediction with different input formats"""
        # Try DataFrame first (most common for scikit-learn)
        try:
            feature_df = pd.DataFrame([features])
            return self.model.predict(feature_df)
        except Exception as df_error:
            print(f"DataFrame prediction failed: {df_error}")
            
            # Try numpy array
            try:
                feature_array = np.array(list(features.values())).reshape(1, -1)
                return self.model.predict(feature_array)
            except Exception as array_error:
                print(f"Array prediction failed: {array_error}")
                
                # Try list format
                try:
                    feature_list = list(features.values())
                    return self.model.predict([feature_list])
                except Exception as list_error:
                    print(f"List prediction failed: {list_error}")
                    raise Exception(f"All prediction formats failed. DataFrame: {df_error}, Array: {array_error}, List: {list_error}")
    
    def _get_prediction_probability(self, features: Dict[str, Any]):
        """Get prediction probability"""
        try:
            # Try DataFrame first
            feature_df = pd.DataFrame([features])
            proba = self.model.predict_proba(feature_df)
            return proba[0].tolist()
        except Exception:
            try:
                # Try numpy array
                feature_array = np.array(list(features.values())).reshape(1, -1)
                proba = self.model.predict_proba(feature_array)
                return proba[0].tolist()
            except Exception:
                return None
    
    def _format_prediction(self, prediction):
        """Format prediction output"""
        if prediction is None:
            return None
            
        # Handle different prediction formats
        if hasattr(prediction, '__len__') and len(prediction) > 0:
            result = prediction[0]
        else:
            result = prediction
        
        # Convert numpy types to Python types
        if hasattr(result, 'item'):
            return result.item()
        elif isinstance(result, (np.integer, np.floating, np.bool_)):
            return float(result) if isinstance(result, np.floating) else int(result)
        else:
            return result