from Models.contactModel import ContactForm
from Controllers.contactController import send_contact_email
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api", tags=["Contact"])

@router.post("/contact/send-email")
async def send_contact_form_email(form_data: ContactForm):
    """
    Receives contact form data and triggers email sending to a fixed recipient.
    """
    # Call the controller function with only the form data.
    # The fixed recipient email is now handled within the controller.
    if send_contact_email(form_data.dict()):
        return {"message": "Message sent successfully! We've also sent an acknowledgment to your email."}
    else:
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again later.")


