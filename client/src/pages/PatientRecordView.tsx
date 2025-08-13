import { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, MessageSquare, Calendar, User, Activity, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doctorAPI, medicalImagesAPI } from '@/lib/api';

export default function PatientRecordView() {
  const { toast } = useToast();
  const { id } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        if (id) {
          // Try multiple API endpoints to find the record
          let data;
          try {
            // First try the doctor records endpoint
            data = await doctorAPI.getRecord(id);
          } catch (doctorError) {
            // If that fails, try the medical images endpoint
            try {
              const imageData = await medicalImagesAPI.getImage(id);
              if (imageData) {
                // Transform medical image data to record format
                data = {
                  id: imageData._id || imageData.id,
                  patientName: imageData.patient?.fullName || imageData.patientName || 'Unknown Patient',
                  date: imageData.uploadedAt ? new Date(imageData.uploadedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                  grade: imageData.grade || 'F0',
                  confidence: imageData.confidence || 0,
                  age: imageData.patient?.age || null,
                  gender: imageData.patient?.gender || null,
                  analysis: imageData.analysis || [],
                  createdAt: imageData.createdAt || imageData.uploadedAt,
                  updatedAt: imageData.updatedAt || imageData.uploadedAt
                };
              } else {
                throw new Error('No data found in medical images');
              }
            } catch (imageError) {
              throw doctorError; // Re-throw the original error
            }
          }
          
          if (data) {
            setRecord(data);
          } else {
            throw new Error('No record data received');
          }
        }
      } catch (error: any) {
        console.error('Error fetching record:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading record',
          description: error.message || 'Failed to load patient record',
        });
        
        // Enhanced mock data for demonstration if API fails
        setRecord({
          id: id || 'LIV123456',
          patientName: 'John Doe',
          date: new Date().toLocaleDateString(),
          grade: 'F2',
          confidence: 85,
          age: 45,
          gender: 'Male',
          analysis: [
            'The ultrasound analysis indicates F2 grade hepatic fibrosis.',
            'Liver parenchyma texture analysis completed.',
            'Portal vein measurements within assessed range.',
            'Surface morphology evaluation performed.',
            'Recommended follow-up based on current findings.',
            'Clinical correlation with laboratory findings advised.'
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, toast]);

  const getGradeDescription = (grade: string): string => {
    const descriptions = {
      'F0': 'No fibrosis',
      'F1': 'Mild fibrosis (portal fibrosis without septa)',
      'F2': 'Moderate fibrosis (portal fibrosis with few septa)',
      'F3': 'Severe fibrosis (numerous septa without cirrhosis)',
      'F4': 'Cirrhosis (advanced fibrosis with regenerative nodules)'
    };
    return descriptions[grade as keyof typeof descriptions] || 'Fibrosis assessment';
  };

  const getGradeColor = (grade: string): string => {
    const colors = {
      'F0': 'text-blue-500',
      'F1': 'text-green-500',
      'F2': 'text-yellow-500',
      'F3': 'text-orange-500',
      'F4': 'text-red-500'
    };
    return colors[grade as keyof typeof colors] || 'text-gray-500';
  };

  const handleDownloadPDF = async () => {
    if (!record) return;
    
    try {
      // Dynamic import for jsPDF
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL RECORD REPORT', 20, 30);
      
      // Add patient information
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT INFORMATION:', 20, 50);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Record ID: ${record.id}`, 20, 65);
      doc.text(`Patient Name: ${record.patientName}`, 20, 75);
      doc.text(`Age: ${record.age || 'N/A'}`, 20, 85);
      doc.text(`Gender: ${record.gender || 'N/A'}`, 20, 95);
      doc.text(`Examination Date: ${record.date}`, 20, 105);
      
      // Add assessment results
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSESSMENT RESULTS:', 20, 125);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fibrosis Grade: ${record.grade}`, 20, 140);
      doc.text(`Confidence Level: ${record.confidence}%`, 20, 150);
      doc.text(`Severity: ${getGradeDescription(record.grade)}`, 20, 160);
      
      // Add clinical analysis if available
      if (record.analysis && record.analysis.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CLINICAL ANALYSIS:', 20, 180);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPos = 195;
        record.analysis.forEach((item: string, index: number) => {
          const splitText = doc.splitTextToSize(`${index + 1}. ${item}`, 170);
          doc.text(splitText, 20, yPos);
          yPos += splitText.length * 5 + 3;
        });
      }
      
      // Add recommendations
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS:', 20, 220);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('• Follow-up as clinically indicated', 20, 235);
      doc.text('• Correlate with laboratory results', 20, 245);
      doc.text('• Consider additional imaging if needed', 20, 255);
      doc.text('• Patient counseling regarding findings', 20, 265);
      
      // Add footer
      doc.setFontSize(8);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 285);
      doc.text('System: LivSafe Medical Assistant', 20, 290);
      
      // Save the PDF
      doc.save(`medical-record-${record.id}.pdf`);
      
      toast({
        title: 'PDF Downloaded',
        description: `Medical record ${record.id} has been downloaded as PDF`,
      });
    } catch (error) {
      // PDF generation error occurred
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF. Please try again.',
      });
    }
  };

  const handleOpenChat = () => {
    if (!record) return;
    
    const analysis = `Medical Analysis Report for ${record.patientName}

Patient ID: ${record.id}
Age: ${record.age || 'N/A'}
Gender: ${record.gender || 'N/A'}
Examination Date: ${record.date}
Fibrosis Grade: ${record.grade}
Confidence Level: ${record.confidence}%

Clinical Assessment:
The liver imaging demonstrates findings consistent with ${record.grade} grade fibrosis. This represents ${getGradeDescription(record.grade)} level of hepatic fibrosis based on established staging criteria.

Detailed Analysis:
${record.analysis ? record.analysis.join('\n') : 'No detailed analysis available.'}

This analysis should be interpreted within the full clinical context and correlated with other diagnostic findings.`;

    const chatUrl = `/chat?patientId=${record.id}&patientName=${encodeURIComponent(record.patientName)}&grade=${record.grade}&confidence=${record.confidence}&date=${record.date}&analysis=${encodeURIComponent(analysis)}`;
    window.open(chatUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="doctor" showAuthButtons={false} />
        <section className="py-12 bg-primary-800">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center text-white text-xl">Loading patient record...</div>
          </div>
        </section>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="doctor" showAuthButtons={false} />
        <section className="py-12 bg-primary-800">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center text-white text-xl">Record not found</div>
            <div className="text-center mt-4">
              <Link href="/doctor/dashboard">
                <Button className="bg-accent hover:bg-accent/90">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-primary-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/doctor/dashboard">
              <span className="inline-flex items-center text-primary-300 hover:text-white transition cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">Patient Record Details</h1>
          </div>

          <div className="bg-primary-700 rounded-xl border border-primary-600 p-6 md:p-8">
            {/* Header with Patient Info */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-primary-600">
              <div>
                <h2 className="text-2xl font-bold text-white">{record.patientName}</h2>
                <p className="text-primary-300">Patient ID: {record.id}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownloadPDF} variant="outline" className="border-primary-600">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={handleOpenChat} className="bg-accent hover:bg-accent/90">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with Dr. Thompson
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Patient Information */}
              <div className="bg-primary-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-primary-100 mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-primary-300">Name:</span>
                    <span className="text-white font-medium">{record.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Age:</span>
                    <span className="text-white font-medium">{record.age || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Gender:</span>
                    <span className="text-white font-medium">{record.gender || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Exam Date:</span>
                    <span className="text-white font-medium">{record.date}</span>
                  </div>
                </div>
              </div>

              {/* Assessment Results */}
              <div className="bg-primary-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-primary-100 mb-4 flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Assessment Results
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-primary-300">Fibrosis Grade:</span>
                      <span className={`font-bold text-lg ${getGradeColor(record.grade)}`}>
                        {record.grade}
                      </span>
                    </div>
                    <p className="text-sm text-primary-200">{getGradeDescription(record.grade)}</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-primary-300">Confidence:</span>
                      <span className="font-medium text-white">{record.confidence}%</span>
                    </div>
                    <div className="w-full bg-primary-600 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${record.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Analysis */}
            {record.analysis && (
              <div className="mt-8 bg-primary-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-primary-100 mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Clinical Analysis
                </h3>
                <div className="text-primary-200 space-y-3">
                  {record.analysis.map((item: string, index: number) => (
                    <p key={index} className="leading-relaxed">{item}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Record Metadata */}
            <div className="mt-8 pt-6 border-t border-primary-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-400">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created: {new Date(record.createdAt || Date.now()).toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Last Updated: {new Date(record.updatedAt || Date.now()).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
