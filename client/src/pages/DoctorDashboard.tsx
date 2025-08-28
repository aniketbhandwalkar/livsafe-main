import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { UserMenu } from '@/components/UserMenu';
import { StatCard } from '@/components/StatCard';
import { RecordsTable, Record } from '@/components/RecordsTable';
import { ChartDistribution } from '@/components/ChartDistribution';
import { DownloadDropdown } from '@/components/DownloadDropdown';
import { useToast } from '@/hooks/use-toast';
import { doctorAPI, patientAPI } from '@/lib/api';
import { FolderOpen, ChartLine, CheckCircle2, Plus, PieChart, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [showChart, setShowChart] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Transform record IDs to LIV format for display while preserving original IDs
  const transformRecordIds = (records: any[]) => {
    return records.map(record => ({
      ...record,
      displayId: record.id && record.id.length > 10 
        ? `LIV${Math.floor(100000 + Math.random() * 900000)}` 
        : record.id,
      originalId: record.id // Preserve original ID for API calls
    }));
  };


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await doctorAPI.getDashboard();
        // Transform the record IDs to LIV format
        if (data.recentRecords) {
          data.recentRecords = transformRecordIds(data.recentRecords);
        }
        setDashboardData(data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error loading dashboard',
          description: error.message || 'Failed to load dashboard data',
        });
        
        // Fallback to mock data if API fails
        setDashboardData({
          stats: {
            totalRecords: 0,
            totalChange: '+0 from last month',
            monthlyRecords: 0,
            monthlyChange: '+0 from previous month',
            accuracy: 0,
            accuracyChange: '+0% from last month',
          },
          recentRecords: [],
          gradeDistribution: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      const data = await doctorAPI.getDashboard();
      // Transform the record IDs to LIV format
      if (data.recentRecords) {
        data.recentRecords = transformRecordIds(data.recentRecords);
      }
      setDashboardData(data);
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest data has been loaded',
        className: 'text-white',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Refresh Failed',
        description: error.message || 'Failed to refresh dashboard',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewRecord = (id: string) => {
    setLocation(`/doctor/record/${id}`);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await doctorAPI.deleteRecord(id);
        
        toast({
          title: 'Record Deleted',
          description: `Record ${id} has been deleted successfully`,
          className:'text-white',
        });
        
        // Refresh dashboard data
        refreshDashboard();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Delete Failed',
          description: error.message || 'Could not delete record',
        });
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Create PDF content with dashboard data
      const pdfContent = `
Doctor Dashboard Report
======================

Stats:
- Total Records: ${dashboardData.stats.totalRecords}
- Monthly Records: ${dashboardData.stats.monthlyRecords}
- Accuracy: ${dashboardData.stats.accuracy}%

Recent Records:
${dashboardData.recentRecords.map((record: any, index: number) => 
  `${index + 1}. ${record.patientName} - ${record.grade} (${record.date})`
).join('\n')}

Generated: ${new Date().toLocaleDateString()}
      `;
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Dashboard report has been downloaded',
        className: 'text-white',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF report',
        className: 'text-white',
      });
    }
  };

  const handleDownloadCSV = async () => {
    try {
      // Create CSV content
      const csvHeader = 'Record ID,Patient Name,Date,Grade,Confidence\n';
      const csvRows = dashboardData.recentRecords.map((record: any) => 
        `${record.id},"${record.patientName}",${record.date},${record.grade},${record.confidence || 'N/A'}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-records-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'CSV Downloaded',
        description: 'Dashboard data has been exported to CSV',
        className: 'text-white',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Could not export CSV file',
        className: 'text-white',
      });
    }
  };

  const handleDownloadRecord = async (id: string) => {
    try {
      // Find the specific record
      const record = dashboardData.recentRecords.find((r: any) => r.id === id);
      if (!record) {
        throw new Error('Record not found');
      }
      
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
      doc.text(`Examination Date: ${record.date}`, 20, 85);
      
      // Add assessment results
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSESSMENT RESULTS:', 20, 105);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fibrosis Grade: ${record.grade}`, 20, 120);
      doc.text(`Confidence Level: ${record.confidence || 'N/A'}%`, 20, 130);
      doc.text(`Severity: ${getGradeDescription(record.grade)}`, 20, 140);
      
      // Add clinical notes
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CLINICAL NOTES:', 20, 160);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const clinicalText = 'This assessment was performed using AI-assisted liver fibrosis analysis. The confidence level indicates the reliability of the automated grading. Clinical correlation with patient history and laboratory findings is recommended.';
      const splitText = doc.splitTextToSize(clinicalText, 170);
      doc.text(splitText, 20, 175);
      
      // Add recommendations
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS:', 20, 200);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('• Follow-up as clinically indicated', 20, 215);
      doc.text('• Correlate with laboratory results', 20, 225);
      doc.text('• Consider additional imaging if needed', 20, 235);
      doc.text('• Patient counseling regarding findings', 20, 245);
      
      // Add footer
      doc.setFontSize(8);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 270);
      doc.text('System: LivSafe Medical Assistant', 20, 280);
      
      // Save the PDF
      doc.save(`medical-record-${record.id}.pdf`);
      
      toast({
        title: 'PDF Downloaded',
        description: `Medical record ${record.id} has been downloaded as PDF`,
        className: 'text-white',
      });
    } catch (error) {
      // PDF generation error occurred
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF. Please try again.',
        className: 'text-white',
      });
    }
  };
  
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

  // Show loading state
  if (loading || !dashboardData) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="doctor" showAuthButtons={false} />
      <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
              <UserMenu />
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-white text-xl">Loading dashboard...</div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
            <UserMenu />
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Records"
              value={dashboardData.stats.totalRecords}
              change={dashboardData.stats.totalChange}
              icon={<FolderOpen className="h-5 w-5" />}
              iconColor="text-secondary-500"
              iconBgColor="bg-secondary-500 bg-opacity-20 text-white border-white"
            />
            <StatCard
              title="Monthly Records"
              value={dashboardData.stats.monthlyRecords}
              change={dashboardData.stats.monthlyChange}
              icon={<ChartLine className="h-5 w-5" />}
              iconColor="text-accent"
              iconBgColor="bg-accent bg-opacity-20"
            />
            <StatCard
              title="Grading Accuracy"
              value={`${dashboardData.stats.accuracy}%`}
              change={dashboardData.stats.accuracyChange}
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconColor="text-green-500"
              iconBgColor="bg-green-500 bg-opacity-20"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/doctor/grade">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="mr-2 h-4 w-4" /> Create New Record
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-primary-600 text-white hover:bg-primary-600 hover:text-white"
              onClick={() => setShowChart(true)}
            >
              <PieChart className="mr-2 h-4 w-4" /> View Distribution
            </Button>
            <Button 
              variant="outline" 
              className="border-primary-600 text-white hover:bg-primary-600 hover:text-white"
              onClick={refreshDashboard}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <DownloadDropdown 
              onDownloadPDF={handleDownloadPDF}
              onDownloadCSV={handleDownloadCSV}
            />
          </div>
          
          {/* Recent Records */}
          <RecordsTable
            records={dashboardData.recentRecords}
            onViewRecord={handleViewRecord}
            onDeleteRecord={handleDeleteRecord}
            onDownloadRecord={handleDownloadRecord}
            showConfidence={true}
          />
        </div>
      </section>

      {/* Floating Chat Button */}
      <button 
        className="fixed bottom-4 right-4 bg-accent hover:bg-accent/90 text-white p-4 rounded-full shadow-lg focus:outline-none z-50 transition-all duration-200 hover:scale-105"
        title="Open Medical Chat with Dr. Thompson"
        onClick={() => window.open('/chat', '_blank')}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Distribution Chart Dialog */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="bg-primary-800 border-primary-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Fibrosis Grade Distribution</DialogTitle>
            <DialogDescription className="text-primary-200">
              View the distribution of fibrosis grades across all patient records.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ChartDistribution data={dashboardData.gradeDistribution} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
