const express = require("express");
const router = express.Router();

const ListAbl = require("./../category/list.of.cat");
const CreateAbl = require("./../category/create.cat");
const DeleteAbl = require("./../category/delete.cat");

router.get("/list", async (req, res) => {
    const client = require("../dao/category").client; // or use your existing connection
    const categories = await client
      .db("CategoryList")
      .collection("CatList")
      .find()
      .toArray();
    res.json(categories);
  });

router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.post("/delete", DeleteAbl);

module.exports = router;