import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Student } from '@/types';
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  User
} from 'lucide-react';

// Mock data
const mockStudents: Student[] = [
  { id: '1', studentId: 'HU2024001', fullName: 'Abebe Kebede', fullNameAmharic: 'አበበ ከበደ', department: 'Computer Science', year: 3, cafeStatus: 'cafe', hostelResident: true, monthlyQuota: null, usedQuota: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', studentId: 'HU2024002', fullName: 'Sara Tesfaye', fullNameAmharic: 'ሳራ ተስፋዬ', department: 'Engineering', year: 2, cafeStatus: 'cafe', hostelResident: false, monthlyQuota: 60, usedQuota: 45, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', studentId: 'HU2024003', fullName: 'Dawit Haile', fullNameAmharic: 'ዳዊት ሃይሌ', department: 'Medicine', year: 4, cafeStatus: 'none', hostelResident: true, monthlyQuota: null, usedQuota: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', studentId: 'HU2024004', fullName: 'Tigist Alemayehu', fullNameAmharic: 'ትግስት አለማየሁ', department: 'Business', year: 1, cafeStatus: 'cafe', hostelResident: false, monthlyQuota: null, usedQuota: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', studentId: 'HU2024005', fullName: 'Yohannes Bekele', fullNameAmharic: 'ዮሐንስ በቀለ', department: 'Law', year: 3, cafeStatus: 'cafe', hostelResident: true, monthlyQuota: 90, usedQuota: 78, createdAt: new Date(), updatedAt: new Date() },
];

export default function Students() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [students] = useState<Student[]>(mockStudents);

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">{t('students')}</h1>
            <p className="text-muted-foreground mt-1">
              Manage student meal registrations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              {t('import')} CSV
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {t('export')}
            </Button>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card variant="default">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {t('filter')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card variant="elevated">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quota</TableHead>
                    <TableHead>Hostel</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {student.photoURL ? (
                              <img src={student.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {language === 'am' && student.fullNameAmharic 
                                ? student.fullNameAmharic 
                                : student.fullName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {student.studentId}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.department}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Year {student.year}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.cafeStatus === 'cafe' ? 'cafe' : 'none'}>
                          {student.cafeStatus === 'cafe' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.monthlyQuota ? (
                          <div className="text-sm">
                            <span className="font-medium">{student.usedQuota}</span>
                            <span className="text-muted-foreground">/{student.monthlyQuota}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unlimited</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.hostelResident ? (
                          <Badge variant="secondary">Yes</Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{students.length}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">
                {students.filter(s => s.cafeStatus === 'cafe').length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {students.filter(s => s.cafeStatus === 'none').length}
              </p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {students.filter(s => s.hostelResident).length}
              </p>
              <p className="text-sm text-muted-foreground">Hostel Residents</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
