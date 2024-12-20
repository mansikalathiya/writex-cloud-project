import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import api from "../api";
import Cookies from "js-cookie";
import { styled } from '@mui/material/styles';

const apiUrl = process.env.REACT_APP_API_URL;
const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5', // Modern blue
      light: '#42A5F5',
      dark: '#1565C0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontSize: '1.1rem',
          padding: '12px 0',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#f8fafc',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#f1f5f9',
            },
          },
        },
      },
    },
  },
});

// Styled components
const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 800,
  background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.5px',
  marginBottom: theme.spacing(1),
  fontFamily: '"Poppins", sans-serif',
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  color: '#666',
  fontSize: '1rem',
  marginBottom: theme.spacing(4),
  fontFamily: '"Inter", sans-serif',
}));

const StyledForm = styled(Box)(({ theme }) => ({
  width: '100%',
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(2),
  },
}));

export default function Login() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState("success");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userData = {
      email: data.get("email"),
      password: data.get("password"),
    };
    try {
      const response = await api.post(`${apiUrl}/login`, userData);
      Cookies.set("token", response.data.token, { expires: 7 });
      setMessage("Login successful!");
      setSeverity("success");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage("An error occurred. Please try again.");
      }
      setSeverity("error");
    }
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            marginBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: 4,
            borderRadius: 3,
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
          }}
        >
          <Link href="/" sx={{ textDecoration: 'none' }}>
            <LogoText>
              WriteTeX
            </LogoText>
          </Link>
          <SubTitle>
            Welcome back to WriteTeX
          </SubTitle>

          <StyledForm component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              sx={{
                '& label': { fontFamily: '"Inter", sans-serif' },
                '& input': { fontFamily: '"Inter", sans-serif' },
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              sx={{
                '& label': { fontFamily: '"Inter", sans-serif' },
                '& input': { fontFamily: '"Inter", sans-serif' },
              }}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  value="remember" 
                  color="primary"
                  sx={{
                    '&.Mui-checked': {
                      color: '#1E88E5',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ 
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.95rem',
                  color: '#4a5568'
                }}>
                  Remember me
                </Typography>
              }
              sx={{ mb: 2 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 3,
                height: '52px',
                background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
                fontSize: '1.1rem',
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(30, 136, 229, 0.2)',
                  background: 'linear-gradient(45deg, #1565C0 30%, #1E88E5 90%)',
                },
              }}
            >
              Sign In
            </Button>
            
            <Typography 
              variant="body2" 
              align="center"
              sx={{
                color: '#666',
                fontFamily: '"Inter", sans-serif',
                '& a': {
                  color: '#1E88E5',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#1565C0',
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              <Link href="/register">
                Don't have an account? Sign Up
              </Link>
            </Typography>
          </StyledForm>
        </Box>

        <Snackbar
          anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity={severity}
            sx={{
              width: '100%',
              borderRadius: 2,
              fontWeight: 500,
              fontFamily: '"Inter", sans-serif',
              '& .MuiAlert-message': {
                fontSize: '0.95rem',
              },
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}