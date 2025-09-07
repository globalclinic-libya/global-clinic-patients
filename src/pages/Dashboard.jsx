import React, { useState, useEffect } from 'react';
import { 
  Typography, Container, Box, Button, List, ListItem, ListItemText, 
  Paper, Alert, CircularProgress, Chip, AppBar, Toolbar, IconButton 
} from '@mui/material';
import { Add as AddIcon, ExitToApp as LogoutIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://8001-i1csmgelwq595e3wt1acg-c7c750f2.manusvm.computer';

function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'primary';
      case 'processing': return 'warning';
      case 'assigned': return 'info';
      case 'report_submitted': return 'success';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'تم التقديم';
      case 'processing': return 'قيد المعالجة';
      case 'assigned': return 'تم التعيين للطبيب';
      case 'report_submitted': return 'تم تقديم التقرير';
      case 'completed': return 'مكتملة';
      default: return status;
    }
  };

  const fetchCases = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/patient/cases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        navigate('/');
      } else {
        setError('فشل في جلب سجلات الحالات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCases(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    navigate('/');
  };

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>جاري تحميل البيانات...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            العيادة العالمية - لوحة تحكم المريض
          </Typography>
          <IconButton color="inherit" onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            sx={{ mb: 4, py: 1.5, px: 4 }}
            onClick={() => navigate('/submit-case')}
          >
            تقديم حالة طبية جديدة
          </Button>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            سجل الحالات الطبية
          </Typography>

          {cases.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', width: '100%' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                لا توجد حالات طبية سابقة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ابدأ بتقديم حالتك الطبية الأولى للحصول على استشارة من أطباء متخصصين
              </Typography>
            </Paper>
          ) : (
            <List sx={{ width: '100%' }}>
              {cases.map((caseItem) => (
                <Paper key={caseItem.id} sx={{ mb: 3, overflow: 'hidden' }}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        الحالة رقم: {caseItem.id}
                      </Typography>
                      <Chip 
                        label={getStatusText(caseItem.status)} 
                        color={getStatusColor(caseItem.status)}
                        variant="filled"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      تاريخ التقديم: {new Date(caseItem.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                    
                    {caseItem.medical_history && (
                      <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <strong>التاريخ الطبي:</strong> {caseItem.medical_history}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => navigate(`/case/${caseItem.id}`)}
                        sx={{ flex: 1 }}
                      >
                        عرض التفاصيل
                      </Button>
                      {(caseItem.status === 'report_submitted' || caseItem.status === 'completed') && (
                        <Button 
                          variant="contained" 
                          onClick={() => navigate(`/case/${caseItem.id}/report`)}
                          sx={{ flex: 1 }}
                        >
                          عرض التقرير الطبي
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      </Container>
    </>
  );
}

export default Dashboard;

