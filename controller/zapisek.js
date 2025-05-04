const express = require("express");
const router = express.Router();

const GetAbl = require("../zapisek/get.zap");
const ListAbl = require("../zapisek/list.of.zap");
const CreateAbl = require("../zapisek/create.zap");
const UpdateAbl = require("../zapisek/update.zap");
const DeleteAbl = require("../zapisek/delete.zap");
const DownloadAbl = require("../zapisek/download.zap");

router.get("/get", GetAbl);
router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.post("/update", UpdateAbl);
router.post("/delete", DeleteAbl);
router.post("/download", DownloadAbl);

module.exports = router;