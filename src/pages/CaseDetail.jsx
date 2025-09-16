import React, { useState, useEffect } from 'react';
import {
  Typography, Container, Box, Button, Paper, Alert, CircularProgress,
  AppBar, Toolbar, IconButton, Grid, Divider, Card, CardContent,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, MedicalServices as MedicalIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CaseDetail() {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { caseId } = useParams();

  const fetchCaseDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/patients/cases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allCases = response.data.cases || [];
      const foundCase = allCases.find(c => c.id === parseInt(caseId));

      if (!foundCase) {
        setError('الحالة غير موجودة أو ليس لديك صلاحية الوصول إليها.');
        setCaseData(null);
        return;
      }

      setCaseData(foundCase);
    } catch (err) {
      console.error('Error fetching case details:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        navigate('/');
      } else {
        setError('فشل في تحميل تفاصيل الحالة. يرجى المحاولة مرة أخرى.');
      }
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>جاري تحميل تفاصيل الحالة...</Typography>
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
          <Button onClick={() => navigate('/dashboard')} variant="contained">
            العودة إلى لوحة التحكم
          </Button>
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
            الحالة رقم #{caseData.id}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <MedicalIcon sx={{ mr: 2 }} />
              تفاصيل الحالة
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>تاريخ التقديم:</strong> {new Date(caseData.created_at).toLocaleString('ar')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>الوصف:</strong></Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                  {caseData.description || 'لا يوجد وصف'}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>الحالة:</strong> <Chip label={getStatusText(caseData.status)} color={getStatusColor(caseData.status)} /></Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                التقرير الطبي سيظهر هنا عند اكتماله من قبل الطبيب.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

// دوال مساعدة
const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'بانتظار المراجعة';
    case 'in_progress': return 'قيد المعالجة';
    case 'completed': return 'مكتملة';
    default: return status;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'in_progress': return 'info';
    case 'completed': return 'success';
    default: return 'default';
  }
};

export default CaseDetail;
