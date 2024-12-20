import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Tooltip from "@mui/material/Tooltip";
import api from "../api";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const apiUrl = process.env.REACT_APP_API_URL;

const columns = [
  { id: "title", label: "Title", minWidth: 500 },
  { id: "owner", label: "Owner", minWidth: 100 },
  {
    id: "lastModified",
    label: "Last Modified",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "action",
    label: "Action",
    minWidth: 100,
    align: "center",
  },
  // {
  //   id: "size",
  //   label: "Size\u00a0(km\u00b2)",
  //   minWidth: 170,
  //   align: "right",
  //   format: (value) => value.toLocaleString("en-US"),
  // }
];

function createData(id, title, owner, lastModified) {
  return { id, title, owner, lastModified };
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5',
      light: '#42A5F5',
      dark: '#1565C0',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
});

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 440,
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f5f9',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#cbd5e1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#94a3b8',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: '"Inter", sans-serif',
  padding: '16px 24px',
  '&.MuiTableCell-head': {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: 600,
    borderBottom: '2px solid #e2e8f0',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
  '& .MuiTableCell-root': {
    borderBottom: '1px solid #e2e8f0',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: '40px',
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  padding: '8px',
  marginRight: '8px',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.2s ease',
}));

export default function TableProjects(props) {
  const navigate = useNavigate();
  const [severity, setSeverity] = React.useState("success");
  const [message, setMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const { dataProject } = props;
  const rows = dataProject.map((data) => {
    return createData(data.id, data.title, "You", data.updatedAt);
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/project/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`${apiUrl}/projects/${id}`);
      if (res.status === 204) {
        setMessage("Delete project successfully!");
        setSeverity("success");
        window.location.reload();
      }
    } catch (error) {
      setMessage(error.message);
      setSeverity("error");
    }
    setOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledPaper>
        <StyledTableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <StyledTableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <StyledTableRow hover tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <StyledTableCell key={column.id} align={column.align}>
                            {column.id === "action" ? (
                              <>
                                <Tooltip title="View/Edit">
                                  <ActionButton
                                    onClick={() => handleEdit(row.id)}
                                    sx={{
                                      color: '#1E88E5',
                                      backgroundColor: 'rgba(30, 136, 229, 0.1)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(30, 136, 229, 0.2)',
                                      },
                                    }}
                                  >
                                    <VisibilityIcon />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <ActionButton
                                    onClick={() => handleDelete(row.id)}
                                    sx={{
                                      color: '#ef4444',
                                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                      },
                                    }}
                                  >
                                    <DeleteIcon />
                                  </ActionButton>
                                </Tooltip>
                              </>
                            ) : (
                              <Typography
                                sx={{
                                  fontFamily: '"Inter", sans-serif',
                                  color: column.id === 'title' ? '#1e293b' : '#64748b',
                                  fontWeight: column.id === 'title' ? 500 : 400,
                                }}
                              >
                                {value}
                              </Typography>
                            )}
                          </StyledTableCell>
                        );
                      })}
                    </StyledTableRow>
                  );
                })}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #e2e8f0',
            '.MuiTablePagination-select': {
              fontFamily: '"Inter", sans-serif',
            },
            '.MuiTablePagination-displayedRows': {
              fontFamily: '"Inter", sans-serif',
            },
          }}
        />
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
      </StyledPaper>
    </ThemeProvider>
  );
}
