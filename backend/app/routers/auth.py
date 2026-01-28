from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from pydantic import BaseModel, EmailStr
import logging
from app.auth import (
    create_access_token, 
    get_password_hash, 
    verify_password, 
    get_current_user,
    create_password_reset_token,
    verify_password_reset_token
)
from app.database import get_database
from app.models.user import UserCreate, UserResponse, UserInDB
from app.config import settings
from app.email_service import send_password_reset_email, is_email_configured

router = APIRouter()
logger = logging.getLogger(__name__)

# Request/Response models for password reset
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    email_sent: bool  # Indica se o email foi enviado com sucesso

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ResetPasswordResponse(BaseModel):
    message: str

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await get_database().users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(
        **user.model_dump(),
        hashed_password=hashed_password
    )
    
    new_user = await get_database().users.insert_one(user_in_db.model_dump(by_alias=True, exclude={"id"}))
    created_user = await get_database().users.find_one({"_id": new_user.inserted_id})
    
    return UserResponse(**created_user)

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_database().users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user.get("role", "healthcare_professional")},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "full_name": user.get("full_name"),
            "role": user.get("role")
        }
    }

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Request a password reset token.
    The token is sent via email - NEVER returned in the API response.
    For security, returns the same success message regardless of whether the email exists.
    """
    # Check if email service is configured
    if not is_email_configured():
        logger.error("Email service not configured. Cannot process password reset request.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de email não configurado. Entre em contato com o suporte."
        )
    
    # Always return the same message for security (don't reveal if email exists)
    success_message = "Se este email estiver cadastrado, você receberá um link de recuperação em alguns minutos. Verifique também sua caixa de spam."
    
    # Check if email exists
    user = await get_database().users.find_one({"email": request.email})
    
    if user:
        # Generate reset token and send via email
        reset_token = create_password_reset_token(request.email)
        email_sent = send_password_reset_email(request.email, reset_token)
        
        if not email_sent:
            logger.error(f"Failed to send password reset email to {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao enviar email de recuperação. Tente novamente mais tarde."
            )
        
        logger.info(f"Password reset email sent to {request.email}")
        return ForgotPasswordResponse(
            message=success_message,
            email_sent=True
        )
    else:
        # Email doesn't exist, but return same message for security
        # Log for debugging but don't reveal to user
        logger.info(f"Password reset requested for non-existent email: {request.email}")
        return ForgotPasswordResponse(
            message=success_message,
            email_sent=False  # Internal: we know email wasn't sent, but same message to user
        )

@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password using the token received from forgot-password.
    """
    # Verify token
    email = verify_password_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    # Check if user exists
    user = await get_database().users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Validate password length
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve ter pelo menos 6 caracteres"
        )
    
    # Update password
    hashed_password = get_password_hash(request.new_password)
    await get_database().users.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return ResetPasswordResponse(message="Senha alterada com sucesso!")

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

