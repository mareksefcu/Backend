/*
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
*/
const express = require("express");
const router = express.Router();
const client = require("../dao/category").client; // Import client once

const ListAbl = require("./../category/list.of.cat"); // Remove this line
const CreateAbl = require("./../category/create.cat");
const DeleteAbl = require("./../category/delete.cat");
/*
router.get("/list", async (req, res) => {
  try {
    const categories = await client
      .db("CategoryList") // Make sure this DB name is correct
      .collection("CatList") // Make sure this collection name is correct
      .find()
      .toArray();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" }); // Send an error response
  }
});
*/ 
router.get("/list", ListAbl); // Remove this line
router.post("/create", CreateAbl);
router.post("/delete", DeleteAbl);

module.exports = router;