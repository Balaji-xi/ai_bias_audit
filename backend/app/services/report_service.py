from fpdf import FPDF
import datetime
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import tempfile
import os
from sklearn.decomposition import PCA
import numpy as np
import pandas as pd

def plot_decision_boundary(model, X, y, title, filename):
    try:
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X)
        
        x_min, x_max = X_pca[:, 0].min() - 1, X_pca[:, 0].max() + 1
        y_min, y_max = X_pca[:, 1].min() - 1, X_pca[:, 1].max() + 1
        
        xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.2),
                             np.arange(y_min, y_max, 0.2))
                             
        mesh_points_pca = np.c_[xx.ravel(), yy.ravel()]
        mesh_points_orig = pca.inverse_transform(mesh_points_pca)
        
        mesh_df = pd.DataFrame(mesh_points_orig, columns=X.columns)
        
        for col in mesh_df.columns:
            if X[col].dtype == 'int64' or X[col].dtype == 'int32':
                mesh_df[col] = mesh_df[col].round().astype(int)
                
        Z = model.predict(mesh_df)
        Z = Z.reshape(xx.shape)
        
        plt.figure(figsize=(7, 5))
        plt.contourf(xx, yy, Z, alpha=0.3, cmap='coolwarm')
        scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y, edgecolors='k', cmap='coolwarm', s=30)
        plt.title(title)
        plt.xlabel('Principal Component 1')
        plt.ylabel('Principal Component 2')
        
        classes = np.unique(y)
        handles = [plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=scatter.cmap(scatter.norm(c)), markersize=8) for c in classes]
        plt.legend(handles, [f'Class {c}' for c in classes], title="Target Class")
        
        plt.savefig(filename, format='png', bbox_inches='tight')
        plt.close()
        return True
    except Exception as e:
        print(f"Failed to plot decision boundary: {e}")
        return False

class PDFReport(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 18)
        self.set_text_color(33, 37, 41)
        self.cell(0, 15, "FairLens - Executive Report", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

def generate_pdf_report(data: dict) -> bytes:
    pdf = PDFReport()
    pdf.add_page()
    
    dataset = data.get("dataset", {})
    model_data = data.get("modelData", {})
    bias_metrics = data.get("biasMetrics", {})
    mitigated_metrics = data.get("mitigatedMetrics", {})
    
    # Date
    pdf.set_font("helvetica", size=10)
    pdf.set_text_color(100, 100, 100)
    date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    pdf.cell(0, 8, f"Generated on: {date_str}", new_x="LMARGIN", new_y="NEXT", align="R")
    pdf.ln(5)
    
    # 1. Dataset Profile
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(0, 102, 204)
    pdf.cell(0, 10, "1. Dataset Profile", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", size=12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, f"File Name: {dataset.get('filename', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Target Variable: {dataset.get('target', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Total Rows: {dataset.get('rows', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    # 2. Baseline Model Performance
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(0, 102, 204)
    pdf.cell(0, 10, "2. Baseline Model Performance", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", size=12)
    pdf.set_text_color(0, 0, 0)
    acc = model_data.get('accuracy', 0) * 100 if model_data else 0
    pdf.cell(0, 8, f"Baseline Accuracy: {acc:.2f}%", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    # 3. Bias Detection
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(0, 102, 204)
    pdf.cell(0, 10, "3. Baseline Bias Metrics", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_text_color(0, 0, 0)
    if bias_metrics:
        for attr, metrics in bias_metrics.items():
            pdf.set_font("helvetica", "B", 12)
            pdf.cell(0, 8, f"Sensitive Attribute: {attr}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("helvetica", size=12)
            dpd = metrics.get('demographic_parity_difference', 0)
            eod = metrics.get('equalized_odds_difference', 0)
            pdf.cell(0, 8, f"  - Demographic Parity Difference (DPD): {dpd:.3f}", new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 8, f"  - Equalized Odds Difference (EOD): {eod:.3f}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
    else:
        pdf.set_font("helvetica", size=12)
        pdf.cell(0, 8, "No bias metrics available.", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    # 4. Mitigation Results
    if mitigated_metrics:
        pdf.set_font("helvetica", "B", 14)
        pdf.set_text_color(0, 102, 204)
        pdf.cell(0, 10, "4. Mitigation Results (Exponentiated Gradient)", new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("helvetica", size=12)
        pdf.set_text_color(0, 0, 0)
        m_acc = mitigated_metrics.get('accuracy', 0) * 100
        pdf.cell(0, 8, f"Mitigated Accuracy: {m_acc:.2f}%", new_x="LMARGIN", new_y="NEXT")
        
        m_bias = mitigated_metrics.get('biasMetrics', {})
        for attr, metrics in m_bias.items():
            pdf.set_font("helvetica", "B", 12)
            pdf.cell(0, 8, f"Sensitive Attribute: {attr}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("helvetica", size=12)
            dpd = metrics.get('demographic_parity_difference', 0)
            eod = metrics.get('equalized_odds_difference', 0)
            pdf.cell(0, 8, f"  - Mitigated DPD: {dpd:.3f}", new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 8, f"  - Mitigated EOD: {eod:.3f}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)

        try:
            # Generate Target Distribution Chart
            dataset_id = dataset.get("dataset_id") or dataset.get("id")
            from app.services.ml_service import ml_service
            df = ml_service.clean_data.get(dataset_id)
            target = dataset.get("target")
            
            if df is not None and target in df.columns:
                plt.figure(figsize=(6, 4))
                val_counts = df[target].value_counts()
                bars = [str(x) for x in val_counts.index]
                plt.bar(bars, val_counts.values, color='#4bc0c0')
                plt.ylabel('Count')
                plt.title(f'Distribution of Target: {target}')
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_dist:
                    plt.savefig(tmp_dist.name, format='png', bbox_inches='tight')
                    dist_img_path = tmp_dist.name
                plt.close()

                pdf.add_page()
                pdf.set_font("helvetica", "B", 14)
                pdf.set_text_color(0, 102, 204)
                pdf.cell(0, 10, "5. Graphical Data Representation", new_x="LMARGIN", new_y="NEXT")
                pdf.image(dist_img_path, x=30, w=150)
                os.remove(dist_img_path)
                pdf.ln(90)
            else:
                pdf.add_page()
                pdf.set_font("helvetica", "B", 14)
                pdf.set_text_color(0, 102, 204)
                pdf.cell(0, 10, "5. Visual Metrics", new_x="LMARGIN", new_y="NEXT")
            
            # Generate Accuracy Chart
            plt.figure(figsize=(6, 4))
            bars = ['Baseline', 'Mitigated']
            accs = [model_data.get('accuracy', 0) * 100 if model_data else 0, mitigated_metrics.get('accuracy', 0) * 100]
            plt.bar(bars, accs, color=['#ff9999', '#66b3ff'])
            plt.ylabel('Accuracy (%)')
            plt.title('Accuracy Comparison')
            plt.ylim([0, 100])
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_acc:
                plt.savefig(tmp_acc.name, format='png', bbox_inches='tight')
                acc_img_path = tmp_acc.name
            plt.close()

            pdf.add_page()
            pdf.set_font("helvetica", "B", 14)
            pdf.set_text_color(0, 102, 204)
            pdf.cell(0, 10, "6. Model Performance & Bias Analytics", new_x="LMARGIN", new_y="NEXT")
            pdf.image(acc_img_path, x=30, w=150)
            os.remove(acc_img_path)
            pdf.ln(90)

            # Generate DPD and Selection Rate Charts for the first sensitive attribute
            if bias_metrics and m_bias:
                attr = list(bias_metrics.keys())[0]
                base_dpd = bias_metrics[attr].get('demographic_parity_difference', 0)
                mit_dpd = m_bias.get(attr, {}).get('demographic_parity_difference', 0)

                plt.figure(figsize=(6, 4))
                bars = ['Baseline', 'Mitigated']
                dpds = [base_dpd, mit_dpd]
                plt.bar(bars, dpds, color=['#ff9999', '#66b3ff'])
                plt.ylabel('Demographic Parity Difference')
                plt.title(f'DPD Comparison ({attr})')
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_dpd:
                    plt.savefig(tmp_dpd.name, format='png', bbox_inches='tight')
                    dpd_img_path = tmp_dpd.name
                plt.close()

                pdf.image(dpd_img_path, x=30, w=150)
                os.remove(dpd_img_path)
                pdf.ln(90)
                
                # Selection Rate Grouped Bar Chart
                groups = list(bias_metrics[attr]['groups'].keys())
                base_srs = [bias_metrics[attr]['groups'][g]['selection_rate'] * 100 for g in groups]
                mit_srs = [m_bias[attr]['groups'][g]['selection_rate'] * 100 if g in m_bias.get(attr, {}).get('groups', {}) else 0 for g in groups]

                import numpy as np
                x = np.arange(len(groups))
                width = 0.35

                plt.figure(figsize=(8, 5))
                plt.bar(x - width/2, base_srs, width, label='Baseline', color='#ff9999')
                plt.bar(x + width/2, mit_srs, width, label='Mitigated', color='#66b3ff')
                plt.ylabel('Selection Rate (%)')
                plt.title(f'Selection Rate by Group ({attr})')
                plt.xticks(x, [str(g) for g in groups])
                plt.legend()
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_sr:
                    plt.savefig(tmp_sr.name, format='png', bbox_inches='tight')
                    sr_img_path = tmp_sr.name
                plt.close()
                
                pdf.add_page()
                pdf.image(sr_img_path, x=20, w=170)
                os.remove(sr_img_path)

            # Generate Decision Boundary Plots
            df_clean = ml_service.clean_data.get(dataset_id)
            base_boundary_img = None
            mit_boundary_img = None

            if df_clean is not None and target in df_clean.columns:
                try:
                    y_db = df_clean[target]
                    X_db = df_clean.drop(columns=[target])
                    
                    encoders = ml_service.encoders.get(dataset_id, {})
                    for col in X_db.select_dtypes(include=['object']).columns:
                        if col in encoders:
                            X_db[col] = encoders[col].transform(X_db[col])
                            
                    if y_db.dtype == 'object' and target in encoders:
                        y_db = encoders[target].transform(y_db)
                    elif y_db.dtype == 'object':
                        from sklearn.preprocessing import LabelEncoder
                        y_db = LabelEncoder().fit_transform(y_db)
                        
                    baseline_model = ml_service.models.get(dataset_id)
                    if baseline_model:
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_base:
                            if plot_decision_boundary(baseline_model, X_db, y_db, "Baseline Model Decision Boundary", tmp_base.name):
                                base_boundary_img = tmp_base.name
                                
                    mitigated_model = ml_service.mitigators.get(dataset_id)
                    if mitigated_model:
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_mit:
                            if plot_decision_boundary(mitigated_model, X_db, y_db, "Mitigated Model Decision Boundary", tmp_mit.name):
                                mit_boundary_img = tmp_mit.name

                except Exception as e:
                    print(f"Error preparing decision boundary data: {e}")

            if base_boundary_img or mit_boundary_img:
                pdf.add_page()
                pdf.set_font("helvetica", "B", 14)
                pdf.set_text_color(0, 102, 204)
                pdf.cell(0, 10, "7. Model Decision Boundaries (PCA Projection)", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("helvetica", size=10)
                pdf.set_text_color(100, 100, 100)
                pdf.multi_cell(0, 6, "These plots show a 2D projection of the dataset. The background color represents the model's predicted class areas (decision boundary), while the points represent the actual data colored by their true target class.")
                pdf.ln(5)
                
                if base_boundary_img:
                    pdf.image(base_boundary_img, x=20, w=160)
                    os.remove(base_boundary_img)
                    pdf.ln(110)
                    
                if mit_boundary_img:
                    pdf.image(mit_boundary_img, x=20, w=160)
                    os.remove(mit_boundary_img)

        except Exception as e:
            print("Error generating charts:", e)
    
    # Output to bytearray
    return bytes(pdf.output())
