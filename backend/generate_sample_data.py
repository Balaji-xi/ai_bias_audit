import pandas as pd
import numpy as np
import os

def generate_biased_dataset():
    np.random.seed(42)
    n_samples = 1000
    
    # Features
    age = np.random.randint(18, 70, n_samples)
    income = np.random.normal(50000, 15000, n_samples)
    credit_score = np.random.normal(650, 100, n_samples)
    
    # Sensitive Attribute
    gender = np.random.choice(['Male', 'Female'], p=[0.5, 0.5], size=n_samples)
    
    # Biased target generation (Loan Approved: 1, Denied: 0)
    # Give 'Male' a 15% inherent advantage
    base_score = (income / 100000) + (credit_score / 800) + (age / 100)
    gender_bias = np.where(gender == 'Male', 0.15, -0.15)
    
    final_score = base_score + gender_bias + np.random.normal(0, 0.2, n_samples)
    
    # Threshold for approval
    loan_approved = (final_score > np.median(final_score)).astype(int)
    
    df = pd.DataFrame({
        'Age': age.astype(int),
        'Income': income.astype(int),
        'CreditScore': credit_score.astype(int),
        'Gender': gender,
        'LoanApproved': loan_approved
    })
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/sample_loan_data.csv', index=False)
    print("Dataset generated at data/sample_loan_data.csv")

if __name__ == '__main__':
    generate_biased_dataset()
