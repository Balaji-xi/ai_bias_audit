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
        self.clean_data = {}  # 🔥 store cleaned dataset
        os.makedirs("data", exist_ok=True)

    # -----------------------------
    # SAVE DATASET
    # -----------------------------
    def save_dataset(self, file_content: bytes, filename: str) -> dict:
        dataset_id = str(uuid.uuid4())

        csv_data = file_content.decode('utf-8')
        df = pd.read_csv(StringIO(csv_data))

        self.data_store[dataset_id] = df

        preview = df.head(10).fillna('').to_dict(orient='records')

        return {
            "dataset_id": dataset_id,
            "filename": filename,
            "columns": df.columns.tolist(),
            "total_rows": len(df),
            "preview": preview
        }

    def get_dataset(self, dataset_id: str) -> pd.DataFrame:
        return self.data_store.get(dataset_id)

    # -----------------------------
    # TRAIN MODEL
    # -----------------------------
    def train_model(self, dataset_id: str, target_col: str, model_type: str = 'rf'):
        df = self.get_dataset(dataset_id)
        if df is None:
            raise ValueError("Dataset not found")

        df_clean = df.copy().dropna().reset_index(drop=True)

        if target_col not in df_clean.columns:
            raise ValueError(f"Target column '{target_col}' not found")

        y = df_clean[target_col]
        X = df_clean.drop(columns=[target_col])

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

        # 🔥 STORE CLEAN DATA
        self.clean_data[dataset_id] = df_clean

        if model_type == 'rf':
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = LogisticRegression(random_state=42, max_iter=5000)

        model.fit(X, y)
        preds = model.predict(X)

        self.models[dataset_id] = model
        self.predictions[dataset_id] = preds

        acc = accuracy_score(y, preds)
        cm = confusion_matrix(y, preds).tolist()

        return {
            "success": True,
            "accuracy": float(acc),
            "confusion_matrix": cm
        }

    # -----------------------------
    # DETECT BIAS
    # -----------------------------
    def detect_bias(self, dataset_id: str, target_col: str, sensitive_cols: list[str]):
        df_clean = self.clean_data.get(dataset_id)
        preds = self.predictions.get(dataset_id)

        if df_clean is None or preds is None:
            raise ValueError("Train model first")

        y_true = df_clean[target_col]

        if y_true.dtype == 'object':
            le_y = self.encoders.get(dataset_id, {}).get(target_col)
            if le_y:
                y_true = le_y.transform(y_true)
            else:
                le_y = LabelEncoder()
                y_true = le_y.fit_transform(y_true)

        # 🔥 AUTO-DETECT if empty
        if not sensitive_cols:
            sensitive_cols = [
                col for col in df_clean.columns
                if col != target_col and df_clean[col].nunique() < 10
            ]

        results = {}

        for s_col in sensitive_cols:
            if s_col not in df_clean.columns:
                continue

            try:
                sensitive_feature = df_clean[s_col]

                mf = MetricFrame(
                    metrics={'selection_rate': selection_rate},
                    y_true=y_true,
                    y_pred=preds,
                    sensitive_features=sensitive_feature
                )

                dpd = demographic_parity_difference(
                    y_true, preds, sensitive_features=sensitive_feature
                )

                eod = equalized_odds_difference(
                    y_true, preds, sensitive_features=sensitive_feature
                )

                results[s_col] = {
                    "groups": mf.by_group.to_dict(orient='index'),
                    "overall": mf.overall.to_dict(),
                    "demographic_parity_difference": float(dpd),
                    "equalized_odds_difference": float(eod),
                    "is_biased": bool(dpd > 0.1 or eod > 0.1)
                }

            except Exception as e:
                print(f"Skipping {s_col}: {e}")

        return {
            "success": True,
            "bias_results": results
        }

    # -----------------------------
    # AUTO DETECT BIAS
    # -----------------------------
    def auto_detect_bias(self, dataset_id: str, target_col: str):
        df_clean = self.clean_data.get(dataset_id)
        preds = self.predictions.get(dataset_id)

        if df_clean is None or preds is None:
            raise ValueError("Train model first")

        # 🔥 VALIDATION
        if not target_col or target_col not in df_clean.columns:
            raise ValueError(f"Invalid target column: {target_col}")

        y_true = df_clean[target_col]

        # Encode target if needed
        if y_true.dtype == 'object':
            le_y = self.encoders.get(dataset_id, {}).get(target_col)
            if le_y:
                y_true = le_y.transform(y_true)
            else:
                le_y = LabelEncoder()
                y_true = le_y.fit_transform(y_true)

        categorical_cols = [
            c for c in df_clean.columns
            if c != target_col and (
                df_clean[c].dtype == 'object' or df_clean[c].nunique() < 20
            )
        ]

        detected_risks = []

        for s_col in categorical_cols:
            try:
                sensitive_feature = df_clean[s_col]

                if sensitive_feature.nunique() < 2:
                    continue

                dpd = demographic_parity_difference(
                    y_true, preds, sensitive_features=sensitive_feature
                )
                eod = equalized_odds_difference(
                    y_true, preds, sensitive_features=sensitive_feature
                )

                max_disparity = max(dpd, eod)

                detected_risks.append({
                    "attribute": s_col,
                    "demographic_parity_difference": float(dpd),
                    "equalized_odds_difference": float(eod),
                    "max_disparity": float(max_disparity),
                    "is_biased": bool(max_disparity > 0.1)
                })

            except Exception as e:
                print(f"Skipping {s_col}: {e}")

        detected_risks.sort(key=lambda x: x["max_disparity"], reverse=True)

        print("DEBUG AUTO DETECT:")
        print("Target:", target_col)
        print("Columns:", df_clean.columns.tolist())

        return {
            "success": True,
            "detected_risks": detected_risks
        }
    # -----------------------------
    # MITIGATE BIAS
    # -----------------------------
    def mitigate_bias(self, dataset_id: str, target_col: str, sensitive_col: str, model_type: str = 'rf'):
        df_clean = self.clean_data.get(dataset_id)

        if df_clean is None:
            raise ValueError("Train model first")

        if sensitive_col not in df_clean.columns:
            raise ValueError("Sensitive column not found")

        y = df_clean[target_col]
        X = df_clean.drop(columns=[target_col])
        A = df_clean[sensitive_col]

        encoders = self.encoders.get(dataset_id, {})

        for col in X.select_dtypes(include=['object']).columns:
            if col in encoders:
                X[col] = encoders[col].transform(X[col])
            else:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col])

        # 🔥 SAFE ENCODING (NO CRASH)
        if y.dtype == 'object':
            le_y = self.encoders.get(dataset_id, {}).get(target_col)
            if le_y:
                y = le_y.transform(y)
            else:
                le_y = LabelEncoder()
                y = le_y.fit_transform(y)
        else:
            # 🔥 ensure le_y always exists
            le_y = None

        if model_type == 'rf':
            base_model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            base_model = LogisticRegression(random_state=42, max_iter=5000)

        mitigator = ExponentiatedGradient(
            estimator=base_model,
            constraints=DemographicParity()
        )

        mitigator.fit(X, y, sensitive_features=A)
        preds = mitigator.predict(X)

        self.predictions[dataset_id] = preds

        acc = accuracy_score(y, preds)

        return {
            "success": True,
            "accuracy_after_mitigation": float(acc)
        }


ml_service = MLService()