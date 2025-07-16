import smtplib
import ssl
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Email Configuration (WARNING: Using regular password is INSECURE for production) ---
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your_email@gmail.com") 
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "your_regular_email_password") 

# FIXED RECIPIENT for contact form submissions (this is where the inquiry goes)
RECIPIENT_EMAIL = "shehara1010@gmail.com" # The fixed email address for inquiries

# SMTP Server details for Gmail
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587 # For TLS

def send_contact_email(form_data: dict) -> bool:
    """
    Sends the contact form data to a fixed recipient and an acknowledgment
    email to the sender (user's provided email).
    """
    try:
        # Create the main email message for the fixed recipient
        subject_to_recipient = f"New Contact Form Submission: {form_data.get('subject', 'No Subject')}"
        body_to_recipient = f"""
        A new contact form has been submitted on your DoconAI website.

        --- Form Details ---
        Name: {form_data.get('name', 'N/A')}
        Email: {form_data.get('email', 'N/A')}
        Company: {form_data.get('company', 'N/A')}
        Phone: {form_data.get('phone', 'N/A')}
        Subject: {form_data.get('subject', 'N/A')}
        Message:
        {form_data.get('message', 'N/A')}
        --------------------
        """
        
        msg_to_recipient = EmailMessage()
        msg_to_recipient.set_content(body_to_recipient)
        msg_to_recipient["Subject"] = subject_to_recipient
        msg_to_recipient["From"] = SENDER_EMAIL
        msg_to_recipient["To"] = RECIPIENT_EMAIL # Send to the fixed recipient
        msg_to_recipient["Reply-To"] = form_data.get('email', SENDER_EMAIL) # Allow replying to the user

        # Create the acknowledgment email message for the sender (user)
        user_email = form_data.get('email')
        if not user_email:
            print("Warning: No user email provided for acknowledgment. Cannot send acknowledgment email.")
            user_email_valid = False
        else:
            user_email_valid = True

        subject_to_user = "Thank You for Contacting DoconAI!"
        body_to_user = f"""
        Dear {form_data.get('name', 'Valued Customer')},

        Thank you for reaching out to DoconAI! We have successfully received your inquiry.

        We appreciate you taking the time to connect with us. Our team is reviewing your message and will get back to you as soon as possible, typically within 24 business hours.

        Here's a summary of the message you sent:

        Subject: {form_data.get('subject', 'N/A')}
        Message:
        {form_data.get('message', 'N/A')}

        In the meantime, feel free to explore our website for more information about DoconAI's features and benefits.

        We look forward to assisting you!

        Best regards,
        The DoconAI Team
        contact@DoconAI.com
        """

        msg_to_user = EmailMessage()
        msg_to_user.set_content(body_to_user)
        msg_to_user["Subject"] = subject_to_user
        msg_to_user["From"] = SENDER_EMAIL
        msg_to_user["To"] = user_email

        # Establish a secure connection with the SMTP server
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls(context=context) # Secure the connection
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            
            # Send email to the main recipient
            server.send_message(msg_to_recipient)
            print(f"Email sent to {RECIPIENT_EMAIL}")

            # Send acknowledgment email to the user ONLY if their email is valid
            if user_email_valid:
                server.send_message(msg_to_user)
                print(f"Acknowledgment email sent to {user_email}")
            else:
                print("Acknowledgment email not sent as user email was invalid/missing.")

        return True

    except Exception as e:
        print(f"Error sending email: {e}")
        return False

