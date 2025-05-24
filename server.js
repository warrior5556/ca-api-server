require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// ✅ Corrected path to db file (assuming /db/db.js exists)
const db = require('./db/db');

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const clientRoutes = require('./routes/clients');
const docTypeRoutes = require('./routes/docTypes');
const loginRoutes = require("./routes/login");
const taskTypesRoutes = require("./routes/task-types");
const employeeRoutes = require("./routes/employees");
const docRecivedMasterRoutes = require("./routes/doc-recived-master");
const subAllotmentRoutes = require("./routes/sub-allotment");
const taskAllotmentRoutes = require("./routes/task-allotment");
const subAllotmentsRoutes = require("./routes/sub-allotments");

app.use('/clients', clientRoutes);
app.use('/doc-types', docTypeRoutes);
app.use("/login", loginRoutes);
app.use("/task-types", taskTypesRoutes);
app.use("/employees", employeeRoutes);
app.use("/doc-recived-master", docRecivedMasterRoutes);
app.use("/sub-allotment", subAllotmentRoutes);
app.use("/task-allotment", taskAllotmentRoutes);
app.use("/sub-allotments", subAllotmentsRoutes);

// Optional test route to verify server is up
app.get('/', (req, res) => {
  res.send('✅ CA API server is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ API server running at http://127.0.0.1:${PORT}`);
});
