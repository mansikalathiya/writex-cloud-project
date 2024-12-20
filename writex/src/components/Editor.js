import React, { useEffect, useState, useRef } from "react";
import { CgSoftwareDownload as SaveIcon } from "react-icons/cg";
import { MdContentCopy as CopyIcon } from "react-icons/md";
import { MdDelete as CleanIcon } from "react-icons/md";
import placeholder from "./placeholder";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import useClipboard from "react-use-clipboard";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-noconflict/snippets/latex";
import "ace-builds/src-noconflict/ext-language_tools";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const URL = process.env.REACT_APP_API_URL;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5',
      light: '#42A5F5',
      dark: '#1565C0',
    },
  },
});

// Styled components
const EditorContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
});

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
});

const Title = styled('h3')({
  margin: 0,
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  color: '#1e293b',
  fontSize: '1.25rem',
});

const ActionButtons = styled('div')({
  display: 'flex',
  gap: '12px',
});

const ActionButton = styled('button')({
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  border: 'none',
  background: 'white',
  color: '#64748b',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',

  '&:hover': {
    transform: 'translateY(-2px)',
    background: '#f1f5f9',
    color: '#1E88E5',
  },

  '& svg': {
    width: '20px',
    height: '20px',
  },
});

const EditorWrapper = styled('div')({
  flex: 1,
  position: 'relative',
  
  '& .ace_editor': {
    fontFamily: '"Fira Code", monospace',
    backgroundColor: '#282a36',
    
    '& .ace_gutter': {
      backgroundColor: '#282a36',
      color: '#6272a4',
    },
    
    '& .ace_print-margin': {
      display: 'none',
    },
    
    '& .ace_cursor': {
      color: '#f8f8f2',
    },
    
    '& .ace_marker-layer .ace_selection': {
      background: '#44475a',
    },
    
    '& .ace_marker-layer .ace_bracket': {
      border: '1px solid #44475a',
    },
    
    '& .ace_active-line': {
      background: '#44475a',
    },
  },
});

function Editor({ content, changeContent, isCompiled, compiled }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const editorRef = useRef(null);
  const [isCopied, setCopied] = useClipboard(content);

  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    if (content === "") {
      localStorage.setItem("latex", placeholder);
    } else {
      localStorage.setItem("latex", content);
    }
  }, [content]);

  useEffect(() => {
    const compileTex = async () => {
      try {
        // Get token from cookies
        const token = Cookies.get('token');
        
        // Check if token exists and redirect if not
        if (!token) {
          navigate('/login');
          throw new Error('No authentication token found. Please log in.');
        }
  
        const texContent = content === "" ? placeholder : content;
        const encodedString = btoa(texContent);
  
        const response = await fetch(URL+"/compile", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  // Ensure token is included
          },
          body: JSON.stringify({ 
            tex: encodedString,
            filename: `resume_${Date.now()}.pdf`,
            jobId: null  // Optional: include job ID if applicable
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Compilation failed');
        }
  
        const data = await response.json();
        console.log('Compilation response:', data);
        
        // Handle successful compilation
        setAnnotations(data.annotations || []);
        isCompiled(false);
      } catch (error) {
        console.error('Compilation error:', error);
        setAnnotations([{
          row: 0,
          column: 0,
          type: "error",
          text: error.message
        }]);
      }
    };
  
    if (compiled) {
      compileTex();
    }
  }, [compiled, content, isCompiled, navigate]);

  const handleEditorChange = (value, event) => {
    changeContent(value);
  };

  const handleClearClick = () => {
    changeContent("");
  };

  const handleDownloadClick = () => {
    let blob = new Blob([content], {
      type: "text/plain",
    });
    let a = document.createElement("a");
    a.download = "latex.tex";
    a.href = window.URL.createObjectURL(blob);
    a.click();
  };

  const handleCopyClick = () => {
    setCopied(content);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <EditorContainer>
        <Header>
          <Title>Editor</Title>
          <ActionButtons>
            <Tooltip title="Download Latex">
              <ActionButton onClick={handleDownloadClick}>
                <SaveIcon />
              </ActionButton>
            </Tooltip>
            <Tooltip title="Copy to Clipboard">
              <ActionButton onClick={handleCopyClick}>
                <CopyIcon />
              </ActionButton>
            </Tooltip>
            <Tooltip title="Clear">
              <ActionButton onClick={handleClearClick}>
                <CleanIcon />
              </ActionButton>
            </Tooltip>
          </ActionButtons>
        </Header>

        <EditorWrapper>
          <AceEditor
            mode="latex"
            value={content}
            theme="dracula"
            onChange={handleEditorChange}
            onValidate={setAnnotations}
            name="editor"
            height="100%"
            width="100%"
            fontSize={15}
            ref={editorRef}
            annotations={annotations}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            enableSnippets={true}
            setOptions={{
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
              showPrintMargin: false,
            }}
            editorProps={{ $blockScrolling: true }}
          />
        </EditorWrapper>

        <Snackbar 
          open={open} 
          autoHideDuration={2000} 
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            elevation={6}
            variant="filled"
            sx={{
              borderRadius: '12px',
              fontFamily: '"Inter", sans-serif',
              '& .MuiAlert-message': {
                fontSize: '0.95rem',
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Copied</AlertTitle>
            The latex is copied to your clipboard
          </Alert>
        </Snackbar>
      </EditorContainer>
    </ThemeProvider>
  );
}

export default Editor;