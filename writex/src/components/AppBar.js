import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Logout from "@mui/icons-material/Logout";
import Cookies from "js-cookie";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5',
      light: '#42A5F5',
      dark: '#1565C0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
});

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const BrandText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 800,
  letterSpacing: '0.5px',
  fontSize: '1.5rem',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '8px 24px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  fontFamily: '"Inter", sans-serif',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

function ResponsiveAppBar(props) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledAppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Logo />
              </Link>
              <BrandText
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  ml: 2,
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                WriteTeX
              </BrandText>
            </Box>

            <Box>
              {isAuthenticated ? (
                <>
                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleClick}
                      size="small"
                      sx={{ 
                        ml: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(30, 136, 229, 0.04)',
                        },
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40,
                          bgcolor: '#1E88E5',
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {user && user.name[0]}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        width: 220,
                        overflow: 'visible',
                        borderRadius: 3,
                        mt: 1.5,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        '& .MuiMenuItem-root': {
                          fontFamily: '"Inter", sans-serif',
                          fontSize: '0.95rem',
                          padding: '12px 24px',
                          '&:hover': {
                            backgroundColor: '#f1f5f9',
                          },
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem>
                      <Avatar sx={{ 
                        bgcolor: '#1E88E5',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                      }} /> 
                      <Typography sx={{ 
                        ml: 2,
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 500,
                      }}>
                        {user && user.name}
                      </Typography>
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                      onClick={() => {
                        Cookies.remove("token");
                        navigate("/login");
                      }}
                    >
                      <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: '#64748b' }} />
                      </ListItemIcon>
                      <Typography sx={{ color: '#64748b' }}>
                        Logout
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Stack spacing={2} direction="row">
                  <StyledButton
                    onClick={() => navigate("/login")}
                    variant="outlined"
                    sx={{
                      borderColor: '#1E88E5',
                      color: '#1E88E5',
                      '&:hover': {
                        borderColor: '#1565C0',
                        backgroundColor: 'rgba(30, 136, 229, 0.04)',
                      },
                    }}
                  >
                    Log in
                  </StyledButton>
                  <StyledButton
                    onClick={() => navigate("/register")}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565C0 30%, #1E88E5 90%)',
                      },
                    }}
                  >
                    Sign up
                  </StyledButton>
                </Stack>
              )}
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>
    </ThemeProvider>
  );
}

export default ResponsiveAppBar;
