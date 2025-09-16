import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// FIXED: Removed the duplicate variable assignment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateMobileNumber = (number) => {
    // Basic validation for Libyan mobile numbers
    const cleanNumber = number.replace(/\s+/g, '');
    return cleanNumber.length >= 10 && /^[0-9+]+$/.test(cleanNumber);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    if (!validateMobileNumber(mobileNumber)) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register/api/patient/start`, {
        mobile_number: mobileNumber,
      });
      
      console.log('OTP Response:', response.data);
      
      // Navigate to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          mobileNumber,
          debugOtp: response.data.debug_otp // For development only
        } 
      });
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data.detail || 'حدث خطأ في الخادم';
        if (error.response.status === 400 && errorMessage.includes('already registered')) {
          setError('رقم الهاتف مسجل مسبقاً. سيتم إرسال رمز تحقق جديد.');
          // For existing users, we might want to call a different endpoint
        } else {
          setError(errorMessage);
        }
      } else if (error.request) {
        // Network error
        setError('فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
      } else {
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
          العيادة العالمية
        </Typography>
        <Typography component="h2" variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
          تسجيل الدخول / التسجيل
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="mobileNumber"
            label="رقم الهاتف"
            name="mobileNumber"
            autoComplete="tel"
            autoFocus
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            inputProps={{ dir: 'rtl' }}
            placeholder="مثال: +218912345678"
            disabled={loading}
            error={!!error && !loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading || !mobileNumber.trim()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </Button>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            سيتم إرسال رمز التحقق عبر رسالة نصية إلى رقم هاتفك
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
