// ==============================================================================
// 📤 FILE UPLOAD MIDDLEWARE (uploadMiddleware.js)
// ==============================================================================
// PURPOSE:
// Standard Express JSON body parsers (`express.json()`) can only handle text data.
// When an admin selects a physical PNG or JPEG file from their local computer, the browser
// encodes the file as "multipart/form-data".
// We use `multer` to stream and save that image directly onto the server's disk storage.
// ==============================================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. Define the directory path where uploaded images will live: `Frontend/Backend/uploads/`
const uploadDir = path.join(__dirname, "uploads");

// Automatically create the folder if it does not already exist on disk
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Disk Storage Engine
// Determines:
// (a) Which folder files are saved into (`destination`)
// (b) What name the file is given (`filename`)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // null = no error, uploadDir = destination path
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // To prevent collisions (e.g. two admins uploading a file named "poster.jpg"),
        // we generate a unique timestamp and random number:
        // Example output: poster-1731000000000-847291048.png
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `poster-${uniqueSuffix}${ext}`);
    }
});

// 3. Security File Filter
// Ensures only genuine image files are uploaded, rejecting scripts (.js, .php, .exe)
const fileFilter = (req, file, cb) => {
    // Regex matching permitted image extensions
    const allowedExtensions = /jpeg|jpg|png|webp/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedExtensions.test(file.mimetype);

    if (extname && mimetype) {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file with a helpful error message
        cb(new Error("Invalid file format: Only PNG, JPEG, JPG, and WEBP image files are allowed!"));
    }
};

// 4. Initialize Multer instance with our storage rules and size limit
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5 Megabytes maximum upload size
    },
    fileFilter: fileFilter
});

// Export so adminRoutes can attach it to POST /api/admin/upload: `upload.single("poster")`
module.exports = upload;
