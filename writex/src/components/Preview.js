import React, { useState, useEffect } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { CgSoftwareDownload as SaveIcon } from "react-icons/cg";
import { MdLoop as CompileIcon } from "react-icons/md";
import { RiFullscreenFill as FullScreenIcon } from "react-icons/ri";
import Tooltip from "@mui/material/Tooltip";
import { Document, Page, pdfjs } from "react-pdf";
import Loader from "react-loader-spinner";
import styled from "styled-components";
import axios from "axios";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const API_URL = process.env.REACT_APP_API_URL;

const PreviewContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const Title = styled.h3`
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: #1e293b;
  font-size: 1.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    background: #f1f5f9;
    color: #1E88E5;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const PreviewContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: ${props => props.isFullScreen ? 'white' : '#f8fafc'};

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: white;
`;

const PDFContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .react-pdf__Page {
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }
`;

const ErrorMessage = styled.div`
  padding: 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #ef4444;
  font-family: 'Inter', sans-serif;
  margin: 24px;
`;

function Preview({ content, isCompiled }) {
  const [rawFile, setRawFile] = useState("");
  const [rawResponse, setRawResponse] = useState({});
  const handle = useFullScreenHandle();
  const [isLoading, setIsLoading] = useState(false);

  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    handleCompile();
  }, []);

  const postData = async () => {
    try {
    const content = localStorage.getItem("latex");
    const encodedString = btoa(content);
    const formData = new FormData();
    formData.append("tex", encodedString);

    const postResponse = await axios.post(API_URL+"/upload", formData, {
      responseType: 'blob' // Ensure the response is treated as a blob
    });

    if (postResponse.status === 200) {
      const blob = postResponse.data;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setRawResponse("");
        setRawFile(base64data);
      };
      reader.readAsDataURL(blob);
    } else {
      const errorResponse = await postResponse.json();
      setRawResponse(errorResponse.error);
    }
  } catch (error) {
    console.error("An error occurred during data fetch:", error);
  } finally {
    setIsLoading(false);
  }
};


  const handleFullScreen = () =>
    handle.active ? handle.exit() : handle.enter();

  const handleSaveClick = () => {
    let link = document.createElement("a");
    link.href = rawFile;
    link.download = "download.pdf";
    link.click();
  };
  const handleCompile = () => {
    setIsLoading(true);
    isCompiled(true);
    postData();
  };
  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  return (
    <PreviewContainer className="pdfview scroll">
      <Header>
        <Title>Preview</Title>
        <ActionButtons>
          <Tooltip title="Compile">
            <ActionButton onClick={handleCompile}>
              <CompileIcon />
            </ActionButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <ActionButton onClick={handleSaveClick}>
              <SaveIcon />
            </ActionButton>
          </Tooltip>
          <Tooltip title="FullScreen">
            <ActionButton onClick={handleFullScreen}>
              <FullScreenIcon />
            </ActionButton>
          </Tooltip>
        </ActionButtons>
      </Header>

      <FullScreen handle={handle}>
        <PreviewContent
          id="preview"
          isFullScreen={handle.active}
        >
          {(() => {
            if (isLoading) {
              return (
                <LoaderContainer>
                  <Loader 
                    type="TailSpin" 
                    height={80} 
                    width={80}
                    color="#1E88E5"
                  />
                </LoaderContainer>
              );
            }

            if (Object.keys(rawResponse).length !== 0) {
              return <ErrorMessage>{rawResponse}</ErrorMessage>;
            }

            if (Object.keys(rawFile).length !== 0) {
              return (
                <PDFContainer>
                  <Document
                    file={rawFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page
                        renderTextLayer={false}
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        scale={1.5}
                      />
                    ))}
                  </Document>
                </PDFContainer>
              );
            }
          })()}
        </PreviewContent>
      </FullScreen>
    </PreviewContainer>
  );
}

export default Preview;
