const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const parser = require("./parser/latex-log-parser");
const fileupload = require("express-fileupload");
const app = express();
const PORT = process.env.PORT || 8080;
const latex = require("node-latex");
const { join, resolve } = require("path");
const { compileTex } = require("./parser/tex-compiler.js");
var cors = require("cors");
var fs = require("fs");
var path = require("path");
var temp = require("temp");
const bodyParser = require("body-parser");
const prisma = new PrismaClient();
const axios = require('axios');
app.use(cors({
  origin: "*", 
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}))
app.use(fileupload());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "build")));

const { hash, compare } = bcryptjs;
const SECRET_KEY = process.env.SECRET_KEY;
// Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please authenticate." });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate." });
  }
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.get("/health", (req, res) => { 
  res.status(200).send("OK");
});


app.post("/upload", async function (req, res) {
  const options = {
    inputs: [resolve(join(__dirname, "/"))],
    cmd: "xelatex",
    passes: 2,
  };

  res.setHeader("Content-Type", "application/pdf");

  let buf = new Buffer.from(req.body.tex.toString("utf8"), "base64");
  let text = buf.toString();

  const pdf = latex(text, options);

  pdf.pipe(res);
  pdf.on("error", (err) => {
    console.log(err.message);
    res.removeHeader("Content-Type");
    res.status(400).send(JSON.stringify({ error: err.message }));
  });
  pdf.on("finish", () => {});
});

app.post("/compile", authenticate, async (req, res) => {
  const options = {
    inputs: [resolve(join(__dirname, "/"))],
    cmd: "xelatex",
    passes: 2,
  };

  try {
    let buf = Buffer.from(req.body.tex, 'base64');
    let text = buf.toString();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `latex_${timestamp}.pdf`;

    const pdf = latex(text, options);
    const chunks = [];

    pdf.on('data', chunk => chunks.push(chunk));

    pdf.on('error', (err) => {
      console.error('LaTeX Error:', err);
      res.status(400).json({ 
        error: err.message,
        annotations: [{
          row: err.line || 0,
          column: 0,
          type: "error",
          text: err.message
        }]
      });
    });

    pdf.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const pdfBase64 = pdfBuffer.toString('base64');

        console.log('PDF generated, uploading to S3...');
        const s3Response = await SaveToS3(pdfBase64, filename);
        console.log('Upload successful:', s3Response);

        // Update database if needed
        if (req.body.jobId) {
          await prisma.job.update({
            where: { id: req.body.jobId },
            data: { resumeLink: s3Response.pdfUrl }
          });
        }

        res.json({
          success: true,
          pdfUrl: s3Response.pdfUrl,
          annotations: []
        });

      } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
          error: 'Failed to upload PDF',
          message: error.message,
          annotations: [{
            row: 0,
            column: 0,
            type: "error",
            text: "Failed to save PDF: " + error.message
          }]
        });
      }
    });

  } catch (error) {
    console.error('Compilation Error:', error);
    res.status(500).json({
      error: 'Failed to compile LaTeX',
      message: error.message,
      annotations: [{
        row: 0,
        column: 0,
        type: "error",
        text: error.message
      }]
    });
  }
});

app.post("/upload", async function (req, res) {

  const options = {
    inputs: [resolve(join(__dirname, "/"))],
    cmd: "xelatex",
    passes: 2,
  };

  res.setHeader("Content-Type", "application/pdf");

  try {
    let buf = Buffer.from(req.body.tex.toString("utf8"), "base64");
    let text = buf.toString();

    // Generate PDF locally
    const pdf = latex(text, options);
    
    // Convert PDF to base64
    let chunks = [];
    pdf.on('data', (chunk) => chunks.push(chunk));
    pdf.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const pdfBase64 = pdfBuffer.toString('base64');

      // Call Lambda function to save to S3
      const s3Response = await SaveToS3(pdfBase64, req.body.filename);
      console.log('S3 Response:', s3Response);
      const update = await prisma.job.update({
        where: { id: req.body.id },
        data: {
          resumeLink: s3Response.pdfUrl,
        },

    });});
    pdf.pipe(res);
    pdf.on("error", (err) => {
      res.status(400).json({ error: err.message });
    });
    pdf.on("finish", () => {});

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Failed to process the LaTeX document' });
  }
});

const SaveToS3 = async (pdfBase64, fileName) => {
  console.log('Initiating S3 upload for:', fileName);
  try {
    // API Gateway endpoint
    const apiEndpoint = process.env.LAMBDA_URL;
    
    const payload = {
      latexCode: pdfBase64,
      fileName: fileName
    };

    console.log('Sending request to API Gateway...');
    const response = await axios({
      method: 'POST',
      url: apiEndpoint,
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload,
      timeout: 30000 // 30 seconds timeout
    });

    console.log('API Gateway Response:', response.data);

    // API Gateway usually wraps the response
    if (response.data && response.data.body) {
      // If body is a string, parse it
      const body = typeof response.data.body === 'string' 
        ? JSON.parse(response.data.body) 
        : response.data.body;
        
      return body;
    }

    throw new Error('Invalid response format from API Gateway');

  } catch (error) {
    console.error('API Gateway Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Throw a more specific error
    if (error.response) {
      throw new Error(`API Gateway error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error(`No response from API Gateway: ${error.message}`);
    } else {
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
};

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

var removeDir = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  var list = fs.readdirSync(dirPath);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dirPath, list[i]);
    var stat = fs.statSync(filename);
    console.log("removing: " + filename);
    if (filename == "." || filename == "..") {
      // do nothing for current and parent dir
    } else if (stat.isDirectory()) {
      removeDir(filename);
    } else {
      fs.unlinkSync(filename);
    }
  }
  console.log("removing: " + dirPath);
  fs.rmdirSync(dirPath);
};

//Endpoint to register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hash(password, 12);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use" });
    }
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return res.status(200).json(newUser);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//endpoint to login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new project
app.post("/projects", authenticate, async (req, res) => {
  const { title, content, userId } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        title,
        content,
        userId,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all projects
app.get("/projects", authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        updatedAt: true,
        userId: true,
      },
    });
    res.json(projects);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read a single project by ID
app.get("/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a project by ID
app.put("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        content,
      },
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a project by ID
app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
