import pandas as pd
from io import StringIO
import uuid
import os

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder
from fairlearn.metrics import MetricFrame, selection_rate, demographic_parity_difference, equalized_odds_difference
from fairlearn.reductions import ExponentiatedGradient, DemographicParity

class MLService:
    def __init__(self):
        self.data_store = {}
        self.models = {}
        self.predictions = {}
        self.encoders = {}
        # Make sure data directory exists
        os.makedirs("data", exist_ok=True)

    def save_dataset(self, file_content: bytes, filename: str) -> dict:
        dataset_id = str(uuid.uuid4())
        
        # Load directly to pandas
        csv_data = file_content.decode('utf-8')
        df = pd.read_csv(StringIO(csv_data))
        
        # Store metadata and save briefly to disk if needed, or keep in memory
        self.data_store[dataset_id] = df
        
        # Preview
        preview_df = df.head(10).fillna('')
        preview = preview_df.to_dict(orient='records')
        
        return {
            "dataset_id": dataset_id,
            "filename": filename,
            "columns": df.columns.tolist(),
            "total_rows": len(df),
            "preview": preview
        }
        
    def get_dataset(self, dataset_id: str) -> pd.DataFrame:
        return self.data_store.get(dataset_id)

    def train_model(self, dataset_id: str, target_col: str, model_type: str = 'rf'):
        df = self.get_dataset(dataset_id)
        if df is None:
            raise ValueError("Dataset not found")
        
        # Basic preprocessing
        df_clean = df.copy().dropna()
        
        # Separate X and y
        y = df_clean[target_col]
        X = df_clean.drop(columns=[target_col])
        
        # Encode categoricals 
        # (This is simplified for MVP - in reality we'd use a robust ColumnTransformer)
        encoders = {}
        for col in X.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col])
            encoders[col] = le
            
        if y.dtype == 'object':
            le_y = LabelEncoder()
            y = le_y.fit_transform(y)
            encoders[target_col] = le_y
            
        self.encoders[dataset_id] = encoders
        
        if model_type == 'rf':
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = LogisticRegression(random_state=42, max_iter=1000)
            
        model.fit(X, y)
        preds = model.predict(X)
        
        self.models[dataset_id] = model
        self.predictions[dataset_id] = preds
        
        acc = accuracy_score(y, preds)
        cm = confusion_matrix(y, preds).tolist()
        
        return {
            "accuracy": float(acc),
            "confusion_matrix": cm
        }
        
    def detect_bias(self, dataset_id: str, target_col: str, sensitive_cols: list[str]):
        df = self.get_dataset(dataset_id)
        preds = self.predictions.get(dataset_id)
        
        if df is None or preds is None:
            raise ValueError("Dataset or predictions not found (Train model first)")
            
        # Re-apply dropna on same logic to align lengths
        df_clean = df.copy().dropna()
        y_true = df_clean[target_col]
        
        if y_true.dtype == 'object':
             le_y = self.encoders.get(dataset_id, {}).get(target_col)
             if le_y:
                 y_true = le_y.transform(y_true)
             else:
                 le_y = LabelEncoder()
                 y_true = le_y.fit_transform(y_true)

        results = {}
        for s_col in sensitive_cols:
            if s_col not in df_clean.columns: continue
            
            sensitive_feature = df_clean[s_col]
            
            # Using fairlearn MetricFrame
            metrics = {
                'selection_rate': selection_rate
            }
            mf = MetricFrame(metrics=metrics, y_true=y_true, y_pred=preds, sensitive_features=sensitive_feature)
            
            dpd = demographic_parity_difference(y_true, preds, sensitive_features=sensitive_feature)
            eod = equalized_odds_difference(y_true, preds, sensitive_features=sensitive_feature)
            
            results[s_col] = {
                "groups": mf.by_group.to_dict(orient='index'),
                "overall": mf.overall.to_dict(),
                "demographic_parity_difference": float(dpd),
                "equalized_odds_difference": float(eod),
                "is_biased": dpd > 0.1 or eod > 0.1 # Example heuristic threshold
            }
            
        return results

    def mitigate_bias(self, dataset_id: str, target_col: str, sensitive_col: str, model_type: str = 'rf'):
        df = self.get_dataset(dataset_id)
        if df is None:
            raise ValueError("Dataset not found")
            
        # Basic preprocessing
        df_clean = df.copy().dropna()
        if sensitive_col not in df_clean.columns:
            raise ValueError("Sensitive column not found")
            
        y = df_clean[target_col]
        X = df_clean.drop(columns=[target_col])
        A = df_clean[sensitive_col]
        
        # Apply encoding 
        # For mitigation, we just encode strictly to make the algorithm run
        encoders = self.encoders.get(dataset_id, {})
        for col in X.select_dtypes(include=['object']).columns:
            if col in encoders:
               X[col] = encoders[col].transform(X[col])
            else:
               le = LabelEncoder()
               X[col] = le.fit_transform(X[col])
        
        y_true = y
        if y.dtype == 'object':
             le_y = encoders.get(target_col)
             if le_y:
                 y_true = le_y.transform(y)
             else:
                 le_y = LabelEncoder()
                 y_true = le_y.fit_transform(y)
                 
        if model_type == 'rf':
            base_model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            base_model = LogisticRegression(random_state=42, max_iter=1000)
            
        mitigator = ExponentiatedGradient(
            estimator=base_model,
            constraints=DemographicParity()
        )
        
        mitigator.fit(X, y_true, sensitive_features=A)
        preds = mitigator.predict(X)
        
        # Overwrite predictions with mitigated ones
        self.predictions[dataset_id] = preds
        
        acc = accuracy_score(y_true, preds)
        return {
            "accuracy": float(acc)
        }

ml_service = MLService()
