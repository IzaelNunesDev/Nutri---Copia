from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime

class PDFService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
        
        # Colors (matching the React design)
        self.colors = {
            'primary': colors.HexColor('#059669'),      # Emerald 600
            'secondary': colors.HexColor('#1e40af'),    # Blue 800
            'accent': colors.HexColor('#7c3aed'),       # Violet 600
            'danger': colors.HexColor('#dc2626'),       # Red 600
            'warning': colors.HexColor('#d97706'),      # Amber 600
            'success': colors.HexColor('#059669'),      # Emerald 600
            'gray_light': colors.HexColor('#f9fafb'),
            'gray_medium': colors.HexColor('#e5e7eb'),
            'gray_dark': colors.HexColor('#374151'),
            'white': colors.white,
            'light_blue': colors.HexColor('#eff6ff'),
            'light_green': colors.HexColor('#ecfdf5'),
            'light_red': colors.HexColor('#fef2f2'),
            'light_amber': colors.HexColor('#fffbeb'),
        }

    def _create_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name='HeaderTitle',
            parent=self.styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#059669'),
            spaceAfter=2,
            leading=24
        ))
        self.styles.add(ParagraphStyle(
            name='HeaderSubtitle',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=12
        ))
        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1f2937'),
            borderPadding=(0, 0, 5, 0),
            borderWidth=1,
            borderColor=colors.HexColor('#e5e7eb'),
            spaceAfter=10,
            spaceBefore=15
        ))
        self.styles.add(ParagraphStyle(
            name='Label',
            fontSize=8,
            textColor=colors.HexColor('#6b7280'),
            textTransform='uppercase',
            leading=10
        ))
        self.styles.add(ParagraphStyle(
            name='Value',
            fontSize=12,
            textColor=colors.HexColor('#1f2937'),
            fontName='Helvetica-Bold',
            leading=14
        ))
        self.styles.add(ParagraphStyle(
            name='FeedbackTitle',
            fontSize=11,
            fontName='Helvetica-Bold',
            spaceAfter=4
        ))
        self.styles.add(ParagraphStyle(
            name='FeedbackText',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#374151')
        ))
        self.styles.add(ParagraphStyle(
            name='SmallNote',
            fontSize=8,
            textColor=colors.HexColor('#6b7280'),
            fontName='Helvetica-Oblique'
        ))

    def _header_footer(self, canvas, doc):
        canvas.saveState()
        
        # Header
        # Draw a line at the bottom of header
        canvas.setStrokeColor(self.colors['primary'])
        canvas.setLineWidth(2)
        canvas.line(40, A4[1] - 80, A4[0] - 40, A4[1] - 80)
        
        # Footer
        canvas.setStrokeColor(self.colors['gray_medium'])
        canvas.setLineWidth(1)
        canvas.line(40, 50, A4[0] - 40, 50)
        
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(self.colors['gray_dark'])
        canvas.drawString(40, 35, "Fonte: Adaptado de Kac et al., 2021 (FIGO) e Caderneta da Gestante MS 2022")
        canvas.drawRightString(A4[0] - 40, 35, f"Página {doc.page} | NutriPré")
        
        canvas.restoreState()

    def generate_pdf(self, data: dict) -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=90,  # Space for header
            bottomMargin=60
        )
        
        story = []
        
        # --- TITLE (Content defined here but visually placed near header) ---
        story.append(Paragraph("NutriPré", self.styles['HeaderTitle']))
        story.append(Paragraph("Avaliação Nutricional Pré-Natal", self.styles['HeaderSubtitle']))
        story.append(Spacer(1, 10))
        
        # --- PATIENT INFO ---
        story.append(Paragraph("Dados da Gestante", self.styles['SectionTitle']))
        
        patient = data.get('patient', {})
        
        # Create a card-like table for patient info
        info_data = [
            [
                Paragraph('<font size="8" color="#6b7280">NOME</font><br/><font size="12"><b>{}</b></font><br/><font size="9" color="#6b7280">{} anos</font>'.format(patient.get('name', ''), patient.get('age', '')), self.styles['Normal']),
                Paragraph('<font size="8" color="#6b7280">SEMANA GESTACIONAL</font><br/><font size="12"><b>{}ª sem</b></font><br/><font size="9" color="#6b7280">{}</font>'.format(patient.get('gestationalWeek', ''), patient.get('trimester', '')), self.styles['Normal']),
                Paragraph('<font size="8" color="#6b7280">IMC PRÉ-GESTACIONAL</font><br/><font size="12"><b>{} kg/m²</b></font><br/><font size="9" color="#6b7280">{}</font>'.format(patient.get('imc', 0), patient.get('imcClassification', '')), self.styles['Normal']),
            ]
        ]
        
        t_info = Table(info_data, colWidths=[170, 170, 170])
        t_info.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.colors['gray_light']),
            ('BACKGROUND', (1, 0), (1, 0), self.colors['accent']),  # Actually we want light accent
            ('BACKGROUND', (2, 0), (2, 0), self.colors['light_blue']),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('ROUNDEDCORNERS', [8, 8, 8, 8]), # ReportLab doesn't support rounded corners on tables easily, simulating with blocks usually or ignoring
            # Border left simulation
            ('LINEBEFORE', (0, 0), (0, 0), 4, self.colors['primary']),
            ('LINEBEFORE', (1, 0), (1, 0), 4, self.colors['accent']),
            ('LINEBEFORE', (2, 0), (2, 0), 4, self.colors['secondary']),
        ]))
        # Correction: Reportlab tables basic styles. Backgrounds work.
        # Custom backgrounds for specific cells:
        t_info.setStyle(TableStyle([
             ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F9FAFB')),
             ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F5F3FF')),
             ('BACKGROUND', (2,0), (2,0), colors.HexColor('#EFF6FF')),
        ]))
        
        story.append(t_info)
        story.append(Spacer(1, 20))


        # --- WEIGHT TRACKING ---
        story.append(Paragraph("Acompanhamento do Peso", self.styles['SectionTitle']))
        
        figo = data.get('figo', {})
        weight_gain = float(patient.get('weightGain', 0))
        gain_prefix = "+" if weight_gain > 0 else ""
        
        weight_data = [
            [
                Paragraph('<font size="8" color="#6b7280">PESO PRÉ</font><br/><font size="12"><b>{} kg</b></font>'.format(patient.get('preGestationalWeight', '')), self.styles['Normal']),
                Paragraph('<font size="8" color="#6b7280">PESO ATUAL</font><br/><font size="12"><b>{} kg</b></font>'.format(patient.get('currentWeight', '')), self.styles['Normal']),
                Paragraph('<font size="8" color="#6b7280">GANHO TOTAL ({})</font><br/><font size="14"><b>{}{} kg</b></font><br/><font size="8">Esperado: {} - {} kg</font>'.format(
                    figo.get('statusMessage', 'Analise'), 
                    gain_prefix, weight_gain,
                    figo.get('expectedMin', 0), figo.get('expectedMax', 0)
                ), self.styles['Normal']),
            ]
        ]
        
        t_weight = Table(weight_data, colWidths=[150, 150, 210])
        
        # Color based on status
        status_color = self.colors['success']
        status_bg = self.colors['light_green']
        if figo.get('status') in ['below', 'below_severe']:
            status_color = self.colors['warning']
            status_bg = self.colors['light_amber']
        elif figo.get('status') in ['above', 'loss', 'critical']:
            status_color = self.colors['danger']
            status_bg = self.colors['light_red']
            
        t_weight.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F9FAFB')),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F9FAFB')),
            ('BACKGROUND', (2,0), (2,0), status_bg),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('LINEBEFORE', (2, 0), (2, 0), 4, status_color),
        ]))
        story.append(t_weight)
        story.append(Spacer(1, 20))
        
        # --- FIGO STATUS BOX ---
        # A simple colored box with the status message
        
        box_color = status_color
        box_bg = status_bg
        
        status_title = "Status do Ganho de Peso"
        if figo.get('status') == 'adequate': status_title = "Ganho de Peso Adequado"
        elif figo.get('status') == 'below': status_title = "Atenção: Ganho Abaixo do Esperado"
        else: status_title = "Atenção ao Ganho de Peso"
        
        story.append(Table(
            [[Paragraph(f'<font color="{box_color.hexval()}"><b>{status_title}</b></font><br/>{figo.get("statusMessage", "")}', self.styles['Normal'])]],
            colWidths=[515],
            style=TableStyle([
                ('BACKGROUND', (0,0), (0,0), box_bg),
                ('BOX', (0,0), (0,0), 1, box_color),
                ('TOPPADDING', (0,0), (0,0), 10),
                ('BOTTOMPADDING', (0,0), (0,0), 10),
                ('LEFTPADDING', (0,0), (0,0), 15),
                ('ROUNDEDCORNERS', [8,8,8,8])
            ])
        ))
        
        story.append(PageBreak())
        
        # --- PAGE 2: GUIDELINES ---
        story.append(Paragraph("Orientações Nutricionais", self.styles['HeaderTitle']))
        story.append(Spacer(1, 10))
        
        guidelines = data.get('patientGuidelines', [])
        
        if not guidelines:
            story.append(Paragraph("Nenhuma orientação específica registrada para esta avaliação.", self.styles['Normal']))
        else:
            # Sort: Critical -> Warning -> Info/Success
            # Assuming 'critical' types first
            # We will group them roughly by severity if possible, or just print ordered
            
            for item in guidelines:
                g_type = item.get('type', 'info')
                
                # Styles mapping
                bg_color = self.colors['light_blue']
                border_color = self.colors['secondary']
                title_color = self.colors['secondary']
                icon = "•"
                
                if g_type == 'critical':
                    bg_color = self.colors['light_red']
                    border_color = self.colors['danger']
                    title_color = self.colors['danger']
                    icon = "!"
                elif g_type in ['warning', 'recommendation', 'clinical', 'investigate']:
                    bg_color = self.colors['light_amber']
                    border_color = self.colors['warning']
                    title_color = self.colors['warning']
                    icon = "►"
                elif g_type in ['adequate', 'success', 'normal']:
                    bg_color = self.colors['light_green']
                    border_color = self.colors['success']
                    title_color = self.colors['success']
                    icon = "✓"
                
                # Content
                title_para = Paragraph(f'<font color="{title_color.hexval()}"><b>{icon}  {item.get("title", "")}</b></font>', self.styles['FeedbackTitle'])
                msg_para = Paragraph(item.get('message', ''), self.styles['FeedbackText'])
                
                cell_content = [title_para, msg_para]
                if item.get('note'):
                    cell_content.append(Spacer(1, 4))
                    cell_content.append(Paragraph(f"Nota: {item.get('note')}", self.styles['SmallNote']))
                
                t_card = Table([[cell_content]], colWidths=[515])
                t_card.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), bg_color),
                    ('LINEBEFORE', (0,0), (0,0), 4, border_color),
                    ('TOPPADDING', (0,0), (-1,-1), 10),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                    ('LEFTPADDING', (0,0), (-1,-1), 12),
                ]))
                
                story.append(KeepTogether(t_card))
                story.append(Spacer(1, 8))

        # --- PAGE 3: PROFESSIONAL NOTES (Optional) ---
        pro_alerts = data.get('professionalAlerts', [])
        observations = data.get('patient', {}).get('observations', '')
        
        if pro_alerts or observations:
            story.append(PageBreak())
            story.append(Paragraph("Área Técnica (Confidencial)", self.styles['HeaderTitle']))
            story.append(Paragraph("Notas Clínicas e Alertas para Profissional", self.styles['HeaderSubtitle']))
            story.append(Spacer(1, 10))
            
            if pro_alerts:
                story.append(Paragraph("Alertas do Sistema", self.styles['SectionTitle']))
                for item in pro_alerts:
                    title_para = Paragraph(f'<font color="{self.colors["accent"].hexval()}"><b>[{item.get("title")}]</b></font>', self.styles['Normal'])
                    msg_para = Paragraph(item.get('message', ''), self.styles['Normal'])
                    
                    t_pro = Table([[title_para], [msg_para]], colWidths=[515])
                    t_pro.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,-1), self.colors['gray_light']),
                        ('LINEBEFORE', (0,0), (-1,-1), 2, self.colors['accent']),
                        ('TOPPADDING', (0,0), (-1,-1), 5),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                    ]))
                    story.append(t_pro)
                    story.append(Spacer(1, 5))
            
            if observations:
                story.append(Paragraph("Observações Clínicas", self.styles['SectionTitle']))
                story.append(Paragraph(observations, self.styles['Normal']))

        # Build PDF
        doc.build(story, onFirstPage=self._header_footer, onLaterPages=self._header_footer)
        buffer.seek(0)
        return buffer
