import React, { useState, useEffect } from 'react';
import {
  Typography, Container, Box, Paper, Alert, CircularProgress,
  AppBar, Toolbar, IconButton, Divider, Card, CardContent
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Assignment as ReportIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ReportView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { caseId } = useParams();

  const fetchReport = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      // ⚠️ ملاحظة: نحن نستخدم نفس endpoint للحالات
      // لأن backend لا يفصل بين "الحالة" و"التقرير" بعد
      const response = await axios.get(`${API_BASE_URL}/api/patients/cases`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allCases = response.data.cases || [];
      const foundCase = allCases.find(c => c.id === parseInt(caseId));

      if (!foundCase) {
        setError('الحالة غير موجودة أو ليس لديك صلاحية الوصول.');
        setReport(null);
        return;
      }

      // لنفترض أن التقرير جزء من الحالة (في المستقبل)
      setReport({
        diagnosis: foundCase.diagnosis || 'لم يتم تحديد التشخيص بعد',
        report_text: foundCase.report_text || 'لا يوجد تقرير طبي بعد.',
        created_at: foundCase.reported_at || new Date().toISOString()
      });
    } catch (err) {
      console.error('Error fetching report:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('فشل في تحميل التقرير. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchReport();
    }
  }, [caseId]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>جاري تحميل التقرير...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            العودة إلى لوحة التحكم
          </button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            التقرير الطبي - الحالة #{caseId}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <ReportIcon sx={{ mr: 2 }} />
              التقرير الطبي
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" paragraph>
              <strong>التشخيص:</strong> {report.diagnosis}
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>التقرير:</strong>
            </Typography>
            <Paper sx={{ p: 3, bgcolor: 'grey.50', mt: 2 }}>
              {report.report_text}
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              تم إعداد التقرير في: {new Date(report.created_at).toLocaleString('ar')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default ReportView;
