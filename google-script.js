// ============================================
// GOOGLE APPS SCRIPT FOR RSVP FORM
// Deploy this in Google Sheets > Extensions > Apps Script
// ============================================

function doPost(e) {
  // Get the active spreadsheet
  var sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getActiveSheet();
  
  // Parse the incoming JSON data
  var data = JSON.parse(e.postData.contents);
  
  // Create timestamp
  var timestamp = new Date();
  
  // Prepare the row data
  var rowData = [
    timestamp,                    // Column A: Timestamp
    data.fullName || '',         // Column B: Full Name
    data.email || '',            // Column C: Email Address
    data.phone || '',            // Column D: Phone Number
    data.attendance || '',       // Column E: Attendance (Yes/No)
    data.guests || '',           // Column F: Number of Guests
    data.events || '',           // Column G: Events Attending
    data.dietary || '',          // Column H: Dietary Restrictions
    data.song || '',             // Column I: Song Request
    data.message || ''           // Column J: Message for Couple
  ];
  
  // Add guest names if more than 1 guest
  if (data.guests > 1) {
    for (var i = 2; i <= data.guests; i++) {
      var guestName = data['guest' + i] || '';
      rowData.push(guestName);   // Additional columns for guest names
    }
  }
  
  // Append the row to the spreadsheet
  sheet.appendRow(rowData);
  
  // Send confirmation email (optional)
  sendConfirmationEmail(data);
  
  // Return success response
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success', message: 'RSVP recorded successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// OPTIONAL: SEND CONFIRMATION EMAIL
// ============================================
function sendConfirmationEmail(data) {
  try {
    var subject = 'RSVP Confirmation - Guila & Jeric Wedding';
    
    var htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0a0a0a;">Thank You for Your RSVP!</h2>
        <p>Dear ${data.fullName},</p>
        <p>We have received your RSVP for our wedding on September 5, 2026.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your RSVP Details:</h3>
          <p><strong>Attendance:</strong> ${data.attendance === 'yes' ? 'Will attend' : 'Will not attend'}</p>
          <p><strong>Number of Guests:</strong> ${data.guests}</p>
          <p><strong>Events Attending:</strong> ${data.events || 'Not specified'}</p>
          ${data.dietary ? `<p><strong>Dietary Notes:</strong> ${data.dietary}</p>` : ''}
        </div>
        
        <p>If you need to make any changes to your RSVP, please contact us before August 5, 2026.</p>
        
        <p>We look forward to celebrating with you!</p>
        
        <p>With love,<br>
        <strong>Guila & Jeric</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
          This is an automated confirmation. For questions, contact:<br>
          Guila: +63 912 345 6789 | Jeric: +63 987 654 3210
        </p>
      </div>
    `;
    
    // Send email
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });
    
  } catch (error) {
    // Log error but don't fail the RSVP submission
    console.error('Email sending failed:', error);
  }
}

// ============================================
// TEST FUNCTION (Run this in Apps Script editor)
// ============================================
function testDoPost() {
  // Simulate a POST request for testing
  var testData = {
    fullName: 'Test Guest',
    email: 'test@example.com',
    phone: '1234567890',
    attendance: 'yes',
    guests: '2',
    events: 'ceremony,reception',
    dietary: 'Vegetarian',
    song: 'Test Song',
    message: 'Test message'
  };
  
  var mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  // Call the function
  var result = doPost(mockEvent);
  Logger.log('Test result: ' + result);
}
