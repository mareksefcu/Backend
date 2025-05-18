const express = require("express");
const router = express.Router();

const GetAbl = require("../zapisek/get.zap");
const ListAbl = require("../zapisek/list.of.zap");
const CreateAbl = require("../zapisek/create.zap");
const UpdateAbl = require("../zapisek/update.zap");
const DeleteAbl = require("../zapisek/delete.zap");
const DownloadAbl = require("../zapisek/download.zap");
const zapisekDao = require("../dao/zapisek");

router.get("/get", GetAbl);
router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.post("/update", UpdateAbl);
router.post("/delete", DeleteAbl);
router.post("/download", DownloadAbl);

// Add test connection endpoint
router.get("/test-connection", async (req, res) => {
    try {
        console.log("Received connection test request");
        const testResult = await zapisekDao.testConnection();
        console.log("Test result:", testResult);
        
        if (testResult.success) {
            res.json({
                status: "success",
                message: testResult.message,
                details: {
                    collections: testResult.collections,
                    documentCount: testResult.documentCount
                }
            });
        } else {
            res.status(500).json({
                status: "error",
                message: testResult.message,
                error: testResult.error
            });
        }
    } catch (error) {
        console.error("Error in test-connection endpoint:", error);
        res.status(500).json({
            status: "error",
            message: "Error testing database connection",
            error: {
                name: error.name,
                message: error.message,
                code: error.code
            }
        });
    }
});

module.exports = router;
