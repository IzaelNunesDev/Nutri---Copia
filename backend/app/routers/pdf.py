from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from app.services.pdf_service import PDFService

router = APIRouter(
    prefix="/pdf",
    tags=["PDF"]
)

class FeedbackItem(BaseModel):
    id: str
    title: str
    message: str
    type: str  # critical, recommendation, etc.
    audience: str = 'both'
    note: Optional[str] = None

class PatientData(BaseModel):
    name: str
    age: Optional[str] = None
    height: Optional[float] = None
    gestationalWeek: Optional[str] = None
    trimester: Optional[str] = None
    imc: Optional[float] = None
    imcClassification: Optional[str] = None
    preGestationalWeight: Optional[float] = None
    currentWeight: Optional[float] = None
    weightGain: Optional[float] = None
    observations: Optional[str] = None
    evaluationDate: Optional[str] = None
    professionalName: Optional[str] = None

    class Config:
        extra = "ignore"
        # Allow coercion from int to str and vice versa where possible
        coerce_numbers_to_str = True 

class FigoData(BaseModel):
    status: str
    statusMessage: str
    expectedMin: Optional[float] = 0
    expectedMax: Optional[float] = 0
    totalMin: Optional[float] = 0
    totalMax: Optional[float] = 0
    weeklyRate: Optional[str] = None

    class Config:
        extra = "ignore"
        coerce_numbers_to_str = True

class PDFRequest(BaseModel):
    patient: PatientData
    figo: FigoData
    patientGuidelines: List[FeedbackItem] = []
    professionalAlerts: List[FeedbackItem] = []
    
    class Config:
        extra = "ignore"
        coerce_numbers_to_str = True

@router.post("/generate")
async def generate_pdf(data: PDFRequest):
    try:
        service = PDFService()
        # Convert pydantic models to dict for the service
        pdf_buffer = service.generate_pdf(data.model_dump())
        
        filename = f"Relatorio_{data.patient.name.replace(' ', '_')}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class PDFEmailRequest(PDFRequest):
    email: str
    subject: Optional[str] = "Seu Relatório Nutricional - NutriPré"
    message: Optional[str] = None

@router.post("/send-email")
async def send_pdf_email(data: PDFEmailRequest):
    try:
        service = PDFService()
        # Generate PDF
        pdf_buffer = service.generate_pdf(data.model_dump(exclude={'email', 'subject', 'message'}))
        pdf_bytes = pdf_buffer.getvalue()
        
        filename = f"Relatorio_{data.patient.name.replace(' ', '_')}.pdf"
        
        # Prepare email content
        from app.email_service import send_email_with_pdf
        
        message_body = data.message or f"""
        <html>
        <body>
            <h2>Olá, {data.patient.name}!</h2>
            <p>Segue em anexo o seu relatório de avaliação nutricional realizado no sistema NutriPré.</p>
            <p>Qualquer dúvida, entre em contato com seu nutricionista.</p>
            <br>
            <p>Atenciosamente,<br>Equipe NutriPré</p>
        </body>
        </html>
        """
        
        success = send_email_with_pdf(
            to_email=data.email,
            subject=data.subject,
            body=message_body,
            pdf_content=pdf_bytes,
            filename=filename
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send email. Please check server logs.")
            
        return {"message": "Email sent successfully", "recipient": data.email}
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
