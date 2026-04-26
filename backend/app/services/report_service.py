from fpdf import FPDF
import datetime

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
    
    # Output to bytearray
    return bytes(pdf.output())
