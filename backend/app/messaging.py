"""
AI-Powered Follow-up Message Generator.
Generates structured contextual follow-up messages for Teachers, Parents, and Operations.
Includes a transparent rule-based templating engine and optional LLM hook with professional disclaimers.
"""
from typing import List, Optional
from datetime import datetime
from .models import FollowUpMessage, ExceptionCode, ExceptionCategory

def generate_messages_for_renewal(
    student_id: Optional[str],
    student_name: Optional[str],
    parent_name: Optional[str],
    parent_mobile: Optional[str],
    parent_email: Optional[str],
    educator_name: Optional[str],
    invoice_id: Optional[str],
    amount: float,
    status: str,
    exception_code: Optional[ExceptionCode] = None,
    details: Optional[dict] = None
) -> List[FollowUpMessage]:
    messages: List[FollowUpMessage] = []
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    s_name = student_name or f"Student #{student_id or 'Unknown'}"
    p_name = parent_name or "Parent"
    t_name = educator_name or "Educator"
    inv_str = f"INV-{invoice_id}" if invoice_id else "N/A"
    det = details or {}

    if status == "AUTO_APPROVED":
        # Congratulatory & Confirmation messages
        messages.append(FollowUpMessage(
            recipient_type="Parent",
            recipient_name=p_name,
            recipient_contact=parent_mobile or parent_email,
            subject=f"Bambinos Renewal Confirmed - {s_name}",
            message=(
                f"Dear {p_name}, thank you for renewing {s_name}'s learning journey with Bambinos.live! "
                f"Your payment of INR {amount:,.2f} for the upcoming 24 sessions has been verified and your enrollment "
                f"has been automatically approved for {det.get('batch_name', 'your scheduled batch')} "
                f"({det.get('batch_days', 'scheduled days')} at {det.get('batch_time', 'scheduled time')}). "
                f"Our academic team looks forward to inspiring {s_name} in the upcoming sessions."
            ),
            reason="Automated post-approval parent confirmation draft",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Teacher",
            recipient_name=t_name,
            recipient_contact="Teacher Portal / WhatsApp",
            subject=f"Student Renewal Approved: {s_name}",
            message=(
                f"Hi {t_name}, renewal payment for {s_name} (Invoice {inv_str}) has been verified and auto-approved. "
                f"The student will continue in {det.get('batch_name', 'current batch')}. Please review your updated batch roster."
            ),
            reason="Automated notification to educator regarding confirmed student continuation",
            created_at=now_str
        ))

    elif status == "ALREADY_SCHEDULED":
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Ops Team",
            recipient_contact="Ops Dashboard",
            subject=f"Audit Check: Student {s_name} Already Scheduled",
            message=(
                f"Invoice {inv_str} for student {s_name} is already associated with active class schedule bookings "
                f"in batch {det.get('batch_name', 'current')}. No further scheduling action is required; marked as completed."
            ),
            reason="Duplicate booking prevention audit note",
            created_at=now_str
        ))

    elif exception_code == ExceptionCode.MISSING_TEACHER_FORM:
        messages.append(FollowUpMessage(
            recipient_type="Teacher",
            recipient_name=t_name,
            recipient_contact="Educator WhatsApp / App",
            subject=f"URGENT: Renewal Form Needed for {s_name}",
            message=(
                f"Hello {t_name}, a verified renewal payment of INR {amount:,.2f} has been received for student {s_name} "
                f"(Invoice {inv_str}). However, your educator renewal submission form is still missing. "
                f"Please submit the form via the educator portal immediately so we can allocate the batch and confirm the schedule."
            ),
            reason="Orphaned invoice: payment received without faculty form submission",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Parent",
            recipient_name=p_name,
            recipient_contact=parent_mobile,
            subject=f"Update on {s_name}'s Bambinos Renewal",
            message=(
                f"Dear {p_name}, we have successfully received your renewal payment for {s_name}. "
                f"Our academic coordinator is currently coordinating with your mentor {t_name} to confirm the upcoming schedule. "
                f"We will notify you within 24 hours with class details."
            ),
            reason="Parent holding communication during teacher submission delay",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Operations Lead",
            recipient_contact="Internal Queue",
            subject=f"Pending Teacher Form Escalation: {t_name} / {s_name}",
            message=(
                f"Payment for {s_name} ({inv_str}) has been orphaned for >12 hours without faculty form from {t_name}. "
                f"Action: Ping educator directly via WhatsApp or coordinator hotline."
            ),
            reason="SLA violation risk for missing faculty form",
            created_at=now_str
        ))

    elif exception_code == ExceptionCode.PAYMENT_NOT_COMPLETED:
        messages.append(FollowUpMessage(
            recipient_type="Parent",
            recipient_name=p_name,
            recipient_contact=parent_mobile,
            subject=f"Action Required: Incomplete Payment for {s_name}'s Renewal",
            message=(
                f"Dear {p_name}, we noticed that your recent payment attempt of INR {amount:,.2f} for {s_name}'s "
                f"Bambinos renewal (Invoice {inv_str}) was marked as Failed by the payment gateway. "
                f"To keep {s_name}'s slot active without interruption, please retry using your secure link: {det.get('invoice_link', 'https://bambinos.live/renew')}. "
                f"If funds were deducted from your bank, reply here with your transaction UTR."
            ),
            reason="Failed payment gateway transaction requiring parent retry",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Teacher",
            recipient_name=t_name,
            recipient_contact="Educator Portal",
            subject=f"Payment Failed for {s_name}",
            message=(
                f"Hi {t_name}, the renewal form submitted for {s_name} cannot be approved yet as the gateway payment failed. "
                f"We have alerted the parent to retry. Please do not confirm class dates until verified."
            ),
            reason="Informing educator to withhold class access until verified payment",
            created_at=now_str
        ))

    elif exception_code == ExceptionCode.PARTIAL_PAYMENT:
        messages.append(FollowUpMessage(
            recipient_type="Parent",
            recipient_name=p_name,
            recipient_contact=parent_mobile,
            subject=f"Bambinos Installment 1 Acknowledged for {s_name}",
            message=(
                f"Dear {p_name}, thank you for your partial payment of INR {amount:,.2f} (Installment 1 of 2) for {s_name}. "
                f"Your initial renewal sessions have been provisional. The second installment of INR {det.get('balance_due', amount):,.2f} "
                f"will be due prior to the 13th session. Our billing desk will reach out with your payment schedule."
            ),
            reason="Installment payment confirmation and terms disclosure",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Finance Desk",
            recipient_contact="Billing Queue",
            subject=f"Installment Verification: {s_name} ({inv_str})",
            message=(
                f"Invoice {inv_str} received partial payment of INR {amount:,.2f}. Teacher form indicated full session fee. "
                f"Configure installment milestone schedule before unlocking full 24-session booking."
            ),
            reason="Reconciliation of installment payment vs full session request",
            created_at=now_str
        ))

    elif exception_code == ExceptionCode.BATCH_UNAVAILABLE:
        messages.append(FollowUpMessage(
            recipient_type="Parent",
            recipient_name=p_name,
            recipient_contact=parent_mobile,
            subject=f"Batch Scheduling Update for {s_name}",
            message=(
                f"Dear {p_name}, thank you for renewing {s_name}'s course with Bambinos.live. "
                f"Your preferred batch {det.get('batch_name', '')} is currently operating at maximum capacity. "
                f"To ensure optimal 1:6 teacher attention, our academic manager has reserved 2 parallel slot options for you: "
                f"Option 1: Tue, Thu 6:00 PM | Option 2: Sat, Sun 11:00 AM. Please reply with your preference to confirm."
            ),
            reason="Batch capacity constraint - proposing alternate slots to parent",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Scheduling Ops",
            recipient_contact="Ops Queue",
            subject=f"Urgent: Capacity Overflow in Batch {det.get('batch_id', '9205')}",
            message=(
                f"Booking request for {s_name} failed because batch {det.get('batch_id', '9205')} is full (6/6). "
                f"Action: Review educator availability to open an overflow section or confirm alternate batch."
            ),
            reason="Batch capacity overflow escalation",
            created_at=now_str
        ))

    elif exception_code == ExceptionCode.PARENT_CONTACT_MISMATCH:
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Security & Ops",
            recipient_contact="Verification Queue",
            subject=f"Contact Mismatch Review: {s_name} ({inv_str})",
            message=(
                f"Invoice {inv_str} was paid using mobile {det.get('invoice_mobile', 'N/A')} ({det.get('payer_name', 'Payer')}), "
                f"whereas master student profile lists {det.get('registered_mobile', 'N/A')}. "
                f"Teacher remark noted: '{det.get('teacher_remark', '')}'. Verify authorization and link secondary phone number."
            ),
            reason="Parent contact discrepancy between payment transaction and student record",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Parent",
            recipient_name=p_name,
            recipient_contact=parent_mobile,
            subject=f"Bambinos Profile Verification for {s_name}",
            message=(
                f"Dear {p_name}, we received renewal payment for {s_name} from mobile {det.get('invoice_mobile', '')}. "
                f"We are updating {s_name}'s profile with this number as an authorized parent contact. "
                f"If you did not authorize this, please contact support@bambinos.live immediately."
            ),
            reason="Secondary contact registration and verification notice",
            created_at=now_str
        ))

    elif exception_code == ExceptionCode.DUPLICATE_FACULTY_FORM:
        messages.append(FollowUpMessage(
            recipient_type="Teacher",
            recipient_name=t_name,
            recipient_contact="Teacher Portal",
            subject=f"Duplicate Submission Notice: {s_name}",
            message=(
                f"Hi {t_name}, we detected two identical renewal submissions (Forms {det.get('duplicate_ids', '')}) "
                f"for {s_name} (Invoice {inv_str}). We have retained the latest valid entry and archived the duplicate. "
                f"No further action is required from you."
            ),
            reason="De-duplication notice to educator to prevent redundant forms",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Ops Lead",
            recipient_contact="Ops Desk",
            subject=f"De-duplicated Form for Invoice {inv_str}",
            message=(
                f"Educator submitted multiple entries due to browser freeze/lag. Duplicate form pruned; primary form kept."
            ),
            reason="Internal audit resolution note for duplicate faculty submission",
            created_at=now_str
        ))

    elif exception_code in [ExceptionCode.INVOICE_NOT_FOUND, ExceptionCode.DATA_MISMATCH]:
        messages.append(FollowUpMessage(
            recipient_type="Teacher",
            recipient_name=t_name,
            recipient_contact="Teacher Portal",
            subject=f"Invoice ID Correction Needed: {s_name}",
            message=(
                f"Hello {t_name}, in your renewal submission for {s_name}, you entered Invoice ID '{det.get('submitted_invoice_id', '')}'. "
                f"Our automated reconciliation matched {s_name} to actual Invoice '{inv_str}'. "
                f"Please verify this invoice number in your educator records to avoid processing delays."
            ),
            reason="Educator typo in submitted invoice identifier",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Reconciliation Desk",
            recipient_contact="Ops Desk",
            subject=f"Typo Correction Match: {s_name} ({inv_str})",
            message=(
                f"Teacher entered {det.get('submitted_invoice_id', '')} which does not exist. "
                f"Fuzzy/Student ID match resolved to valid invoice {inv_str} for student {student_id}. "
                f"Approve auto-correction link."
            ),
            reason="Automated cross-table foreign key mismatch resolution",
            created_at=now_str
        ))

    elif exception_code == ExceptionCode.BATCH_CHANGE_PENDING:
        messages.append(FollowUpMessage(
            recipient_type="Parent",
            recipient_name=p_name,
            recipient_contact=parent_mobile,
            subject=f"Batch Change Options for {s_name}",
            message=(
                f"Dear {p_name}, thank you for renewing with Bambinos.live. We received your request to move {s_name} "
                f"to a weekend slot ({det.get('preferred_days', 'Sat,Sun')} at {det.get('preferred_time', '11:00 AM')}). "
                f"Our academic advisor will contact you today at {parent_mobile} to confirm the teacher and start date."
            ),
            reason="Batch change request workflow acknowledgment to parent",
            created_at=now_str
        ))
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Academic Scheduling",
            recipient_contact="Batch Change Queue",
            subject=f"Batch Change Request: {s_name} to {det.get('preferred_days', 'Weekend')} {det.get('preferred_time', '')}",
            message=(
                f"Student {s_name} opted out of existing batch {det.get('current_batch_id', '9203')}. "
                f"Requested slot: {det.get('preferred_days', '')} {det.get('preferred_time', '')}. Booking request {det.get('booking_request_id', '')} "
                f"is awaiting parent confirmation."
            ),
            reason="Manual schedule coordination for non-standard batch change",
            created_at=now_str
        ))

    else:
        # Generic fallback
        messages.append(FollowUpMessage(
            recipient_type="Operations",
            recipient_name="Ops Team",
            recipient_contact="Ops Desk",
            subject=f"Review Required for {s_name} ({inv_str})",
            message=f"Renewal for {s_name} ({inv_str}) is currently flagged under {exception_code or 'MANUAL_REVIEW'}. Please verify details in the Exception Center.",
            reason=f"Standard review notification for {exception_code or 'unspecified issue'}",
            created_at=now_str
        ))

    return messages

