const process = require("process");
const format = require("util").format;
const express = require("express");
const Multer = require("multer");
//const mime = require("mime-types");

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const { Storage } = require("@google-cloud/storage");

// Instantiate a storage client
const storage = new Storage({
    projectId: "know-your-dog-2",
    keyFilename: "know-your-dog-2-d9d16cd88abd.json"
});

const router = express.Router();

module.exports = router;

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    }
});

// A bucket is a container for objects (files).
var bucket = storage.bucket("know-your-dog-2");

// Process the file upload and upload to Google Cloud Storage.
router.post("/upload", multer.single("image"), function (req, res, next) {
    const gcsname = Date.now() + req.file.originalname;
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    });

    stream.on("error", err => {
        req.file.cloudStorageError = err;
        console.log(err);
        res.json({ success: false, msg: "Images not uploaded", urls: "" });
    });

    stream.on("finish", () => {
        req.file.cloudStorageObject = gcsname;
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
        res.json({ url: req.file.cloudStoragePublicUrl, file: gcsname });
    });

    stream.end(req.file.buffer);
});

function getPublicUrl(filename) {
    return `https://storage.cloud.google.com/know-your-dog-2/${filename}`;
}
