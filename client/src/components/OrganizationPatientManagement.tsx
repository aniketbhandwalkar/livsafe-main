import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { organizationAPI } from '@/lib/api';

interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  assignedDoctor: string;
  recordCount: number;
  lastVisit: string;
  status: 'active' | 'inactive';
  doctors: Array<{ _id: string; fullName: string; specialty: string }>;
  createdAt: string;
}

export function OrganizationPatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Fetch real patient data from the API
        const response = await organizationAPI.getPatients(currentPage, 50, searchTerm);
        setPatients(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalPatients(response.pagination.totalPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        // Fallback to empty array if API fails
        setPatients([]);
        setTotalPages(1);
        setTotalPatients(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentPage, searchTerm]);

  // Filter patients based on search and filters
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      const matchesDoctor = doctorFilter === 'all' || patient.assignedDoctor === doctorFilter;
      const matchesAge = ageFilter === 'all' || 
        (ageFilter === '18-30' && patient.age >= 18 && patient.age <= 30) ||
        (ageFilter === '31-50' && patient.age >= 31 && patient.age <= 50) ||
        (ageFilter === '51-70' && patient.age >= 51 && patient.age <= 70) ||
        (ageFilter === '70+' && patient.age > 70);
      
      return matchesSearch && matchesStatus && matchesDoctor && matchesAge;
    });
  }, [patients, searchTerm, statusFilter, doctorFilter, ageFilter]);

  // Get unique doctors for filter
  const uniqueDoctors = useMemo(() => {
    const doctors = patients.map(patient => patient.assignedDoctor);
    return Array.from(new Set(doctors)).sort();
  }, [patients]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDoctorFilter('all');
    setAgeFilter('all');
  };

  const handleExport = () => {
    if (patients.length === 0) return;
    
    // Create CSV content
    const csvContent = [
      // Header
      ['Patient Report', 'Generated on ' + new Date().toLocaleDateString()],
      [],
      // Patient data
      ['Patient ID', 'Name', 'Age', 'Gender', 'Assigned Doctor', 'Records', 'Last Visit', 'Status'],
      ...patients.map(patient => [
        patient.id,
        patient.fullName,
        patient.age,
        patient.gender,
        patient.assignedDoctor,
        patient.recordCount,
        new Date(patient.lastVisit).toLocaleDateString(),
        patient.status
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-500' : 'text-red-500';
  };

  const getStatusBg = (status: string) => {
    return status === 'active' ? 'bg-green-500/20' : 'bg-red-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Patient Management</h2>
          <p className="text-primary-300">View and manage all patients across your organization</p>
        </div>
        <Button onClick={handleExport} className="bg-accent hover:bg-accent/90">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary-800 border-primary-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-accent" />
                              <div>
                  <p className="text-primary-300 text-sm">Total Patients</p>
                  <p className="text-2xl font-bold text-white">{totalPatients}</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-800 border-primary-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-primary-300 text-sm">Active Patients</p>
                <p className="text-2xl font-bold text-white">
                  {patients.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-800 border-primary-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-primary-300 text-sm">Assigned Doctors</p>
                <p className="text-2xl font-bold text-white">{uniqueDoctors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-800 border-primary-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-primary-300 text-sm">Avg Age</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-primary-800 border-primary-700">
        <CardHeader>
          <CardTitle className="text-white">Search & Filters</CardTitle>
          <CardDescription className="text-primary-300">
            Find specific patients using search and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 h-4 w-4" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-primary-600 text-black placeholder-gray-500"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white border-primary-600 text-black">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-primary-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="bg-white border-primary-600 text-black">
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-primary-600">
                <SelectItem value="all">All Doctors</SelectItem>
                {uniqueDoctors.map(doctor => (
                  <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="bg-white border-primary-600 text-black">
                <SelectValue placeholder="Age Range" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-primary-600">
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="18-30">18-30</SelectItem>
                <SelectItem value="31-50">31-50</SelectItem>
                <SelectItem value="51-70">51-70</SelectItem>
                <SelectItem value="70+">70+</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-primary-600 text-primary-100 hover:bg-primary-600"
            >
              Clear Filters
            </Button>
          </div>

                      <div className="mt-4 text-sm text-primary-300">
              Showing {filteredPatients.length} of {totalPatients} patients
            </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="bg-primary-800 border-primary-700">
        <CardHeader>
          <CardTitle className="text-white">Patient List</CardTitle>
          <CardDescription className="text-primary-300">
            All patients in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-600">
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Patient ID</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Age</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Gender</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Assigned Doctor</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Records</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Last Visit</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-primary-700 hover:bg-primary-700/50">
                    <td className="py-3 px-4 text-white font-medium">{patient.id}</td>
                    <td className="py-3 px-4 text-white">{patient.fullName}</td>
                    <td className="py-3 px-4 text-primary-200">{patient.age}</td>
                    <td className="py-3 px-4 text-primary-200">{patient.gender}</td>
                    <td className="py-3 px-4 text-primary-200">{patient.assignedDoctor}</td>
                    <td className="py-3 px-4 text-primary-200">{patient.recordCount}</td>
                    <td className="py-3 px-4 text-primary-200">
                      {new Date(patient.lastVisit).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(patient.status)} ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-200 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
                          <div className="text-center py-8">
                <div className="text-primary-200 text-lg font-medium">
                  {totalPatients === 0 ? 'No patients found' : 'No patients match your search'}
                </div>
                <div className="text-primary-400 text-sm mt-1">
                  {totalPatients === 0 
                    ? 'Patients will appear here once they are registered'
                    : 'Try adjusting your search or filter criteria'
                  }
                </div>
              </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-primary-800 border-primary-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-primary-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-primary-600 text-primary-100 hover:bg-primary-600"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-primary-600 text-primary-100 hover:bg-primary-600"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
