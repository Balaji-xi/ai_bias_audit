import requests
import json
import pandas as pd
from io import StringIO

BASE_URL = "http://localhost:8000"

# 1. Upload Data
data = """age,gender,income,LoanApproved
25,M,50000,1
30,F,60000,1
45,M,80000,0
22,F,30000,0
35,M,120000,1
"""
files = {'file': ('test.csv', data, 'text/csv')}
res = requests.post(f"{BASE_URL}/api/upload-data", files=files)
print("Upload:", res.status_code, res.text)
dataset_id = res.json()['dataset_id']

# 2. Train Model
res = requests.post(f"{BASE_URL}/api/train-model", json={
    "dataset_id": dataset_id,
    "target_col": "LoanApproved",
    "model_type": "rf"
})
print("Train:", res.status_code, res.text)

# 3. Detect Bias
res = requests.post(f"{BASE_URL}/api/detect-bias", json={
    "dataset_id": dataset_id,
    "target_col": "LoanApproved",
    "sensitive_cols": ["gender"]
})
print("Detect:", res.status_code, res.text)

# 4. Auto Detect Bias
res = requests.post(f"{BASE_URL}/api/auto-detect-bias", json={
    "dataset_id": dataset_id,
    "target_col": "LoanApproved"
})
print("Auto Detect:", res.status_code, res.text)
