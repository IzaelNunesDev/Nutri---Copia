from fastapi import APIRouter, HTTPException, Query
from app.services import calculos_service
from app.models.schemas import (
    IMCCalculationRequest, IMCCalculationResponse,
    GestationalAgeRequest, GestationalAgeResponse,

)
from datetime import datetime, date

router = APIRouter()

@router.post("/imc", response_model=IMCCalculationResponse)
def calculate_imc(data: IMCCalculationRequest):
    try:
        imc = calculos_service.calcular_imc(data.weight, data.height)
        classification = calculos_service.classificar_imc(imc)
        return {"imc": imc, "classification": classification}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/gestational-age", response_model=GestationalAgeResponse)
def calculate_gestational_age(data: GestationalAgeRequest):
    try:
        # Simplistic logic here if service doesn't have it explicitly separate
        # But wait, the service DOESN'T have date logic yet, only "arredondar_semana_figo".
        # I need to implement the date logic here or in service. Service is better.
        # For now, I'll implement here to move fast, then refactor to service if needed.
        
        today = date.today()
        # Ensure we are comparing dates
        input_date = data.date
        
        total_days = 0
        
        if data.method.lower() == 'dum':
            diff = today - input_date
            total_days = diff.days
        elif data.method.lower() == 'dpp':
            # DPP = 280 days from conception/start
            # If DPP is future, days passed = 280 - (dpp - today)
            days_to_birth = (input_date - today).days
            total_days = 280 - days_to_birth
        else:
            raise HTTPException(status_code=400, detail="Invalid method. Use 'dum' or 'dpp'")
            
        if total_days < 0:
            total_days = 0
            
        weeks = total_days // 7
        extra_days = total_days % 7
        
        # Rounding logic FIGO
        rounded_week = calculos_service.arredondar_semana_figo(weeks, extra_days)
        
        weeks_remaining = max(0, 40 - weeks)
        
        return {
            "gestational_week": rounded_week, # The rounded one for clinical use
            "days": extra_days,
            "weeks_remaining": weeks_remaining
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


