# Medical Chat Feature Setup

This application now includes an AI-powered medical chat feature that provides professional consultation with Dr. Marcus Thompson, a virtual hepatologist with 30+ years of experience.

## Features

### 1. Floating Chat Button
- Located at the bottom-right of the doctor dashboard
- Opens a new tab with general medical chat
- No patient context - for general hepatology questions

### 2. Patient-Specific Chat
- Chat button next to each patient record in the table
- Opens with pre-populated analysis for that specific patient
- Includes patient context and examination details

### 3. Professional AI Doctor
- **Dr. Marcus Thompson**: Distinguished hepatologist persona
- 30+ years of clinical experience
- MD from Johns Hopkins, Fellowship from Mayo Clinic
- Specializes in liver diseases and fibrosis assessment
- Provides evidence-based, compassionate medical advice

## Setup Instructions

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment
1. Open the `.env` file in the project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Save the file
4. Restart the development server

### 3. Test the Feature
1. Navigate to the doctor dashboard
2. Click the floating chat button (bottom-right) for general chat
3. Or click the chat icon next to any patient record for patient-specific chat

## Chat Capabilities

### General Chat
- Ask about liver health, fibrosis staging
- Treatment recommendations
- Follow-up protocols
- General hepatology questions

### Patient-Specific Chat
- Pre-loaded with patient analysis
- Contextual responses based on patient data
- Grade-specific recommendations
- Treatment plans based on fibrosis stage

## Chat Features

### Message Management
- Copy individual messages
- Export entire conversation
- Professional medical formatting
- Timestamp tracking

### AI Responses
- Professional medical language
- Evidence-based recommendations
- Clinical correlation emphasis
- 30+ years of expertise persona

## Fibrosis Grading System

The AI understands and explains:
- **F0**: No fibrosis
- **F1**: Mild fibrosis (portal fibrosis without septa)
- **F2**: Moderate fibrosis (portal fibrosis with few septa)
- **F3**: Severe fibrosis (numerous septa without cirrhosis)
- **F4**: Cirrhosis (advanced fibrosis with regenerative nodules)

## Important Notes

### Medical Disclaimer
- This AI is for educational and consultation purposes
- Always emphasizes clinical correlation
- Recommends comprehensive patient evaluation
- Not a replacement for professional medical judgment

### API Usage
- Gemini Pro model used for responses
- Conversation history maintained during session
- Professional prompt engineering for medical accuracy
- Temperature set to 0.7 for balanced creativity/accuracy

### Privacy
- No data is stored permanently
- Conversations are client-side only
- Export feature for record keeping
- HIPAA considerations for production use

## Troubleshooting

### API Key Issues
- Ensure the API key is correctly set in `.env`
- Check that the API key has proper permissions
- Verify your Google Cloud billing is active

### Connection Issues
- Check internet connectivity
- Verify Gemini API service status
- Check browser console for errors

### Chat Not Opening
- Ensure popup blockers are disabled
- Check that `/chat` route is accessible
- Verify React router configuration

## Usage Examples

### General Questions
- "What are the latest treatment options for F3 fibrosis?"
- "How should I monitor a patient with F2 grade fibrosis?"
- "What laboratory tests should I order for liver assessment?"

### Patient-Specific Queries
- "What follow-up is recommended for this patient?"
- "How should I counsel this patient about their prognosis?"
- "What treatment modifications are appropriate?"

## Security Considerations

### For Production
- Implement proper authentication
- Add rate limiting
- Consider PHI handling requirements
- Use secure API key management
- Implement audit logging

### Current Implementation
- Client-side API key (development only)
- No server-side validation
- No conversation persistence
- Basic error handling

This feature enhances the medical workflow by providing instant access to expert hepatology consultation while maintaining the professional standards expected in medical practice.
