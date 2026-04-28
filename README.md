
# 🧠 FairLens — AI Bias Audit Platform

FairLens is an end-to-end platform designed to **detect, analyze, and mitigate bias in machine learning models**. It enables users to train models, evaluate fairness, apply mitigation techniques, and generate predictions using unbiased models along with detailed visual reports.

---

# 🚀 Features

* 📂 Upload and preprocess datasets (CSV)
* 🤖 Train multiple ML models:

  * Random Forest
  * Logistic Regression
  * Decision Tree
  * Gradient Boosting
  * Support Vector Machine
* ⚖️ Bias Detection:

  * Demographic Parity Difference (DPD)
  * Equalized Odds Difference (EOD)
* 🔍 Auto-detect sensitive attributes
* 🛠 Bias Mitigation using Exponentiated Gradient
* 🔮 Prediction using **unbiased (fair) model**
* 📊 Visualization:

  * Accuracy comparison
  * Bias reduction graphs
  * Feature distributions
* 📄 Generate full fairness audit reports

---

# 🏗️ Tech Stack

* **Frontend:** React (Vite)
* **Backend:** FastAPI (Python)
* **ML Models:** scikit-learn
* **Fairness:** Fairlearn
* **Data Processing:** Pandas, NumPy

---

# 📂 Project Structure

```bash
FairLens/
│
├── frontend/        # React frontend
├── backend/         # FastAPI backend
├── README.md
└── requirements.txt
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/fairlens.git
cd fairlens
```

---

## 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows

pip install -r requirements.txt
```

Run backend:

```bash
python -m uvicorn app.main:app --reload
```

👉 Backend runs on:
`http://127.0.0.1:8000`

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

👉 Frontend runs on:
`http://localhost:5173`

---

# 🧑‍💻 How to Use the Application

## Step 1: Upload Dataset

* Go to **Data Upload**
* Upload a CSV file
* View dataset preview

---

## Step 2: Train Model

* Select target variable
* Choose ML algorithm
* Train baseline model

---

## Step 3: Detect Bias

* Select sensitive attributes (or use auto-detect)
* View DPD & EOD metrics

---

## Step 4: Mitigate Bias

* Apply mitigation algorithm
* Generate unbiased (fair) model

---

## Step 5: Make Predictions

* Use the **mitigated model**
* Input new data to get predictions

---

## Step 6: Visualize Results

* Compare accuracy before vs after
* View bias reduction graphs

---

## Step 7: Generate Report

* Get full fairness audit report
* Analyze improvements and insights

---

# 🔁 Workflow

```text
Upload → Train → Detect Bias → Mitigate → Predict → Visualize → Report
```

---

# 🎯 Key Idea

> FairLens ensures that predictions are made using a **bias-mitigated model**, not the original biased model.

---

# ⚠️ Limitations

* In-memory data storage (no database yet)
* Limited fairness constraints
* No model persistence

---

# 🚀 Future Improvements

* Add SHAP/LIME explainability
* Deploy on cloud (Vercel + Render)
* Real-time bias monitoring
* Add user authentication

---

# 🏆 Conclusion

FairLens bridges the gap between **machine learning performance and ethical AI**, providing a complete pipeline to build fair, transparent, and reliable AI systems.

---

# 🤝 Contributors

* P. Kalyan
* B. Balaji
* G. Rithvik Nag

---

# 📜 License

This project is open-source and available under the MIT License.

---

# ⭐ If you like this project

Give it a ⭐ on GitHub!
