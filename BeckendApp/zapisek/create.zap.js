/*
const Ajv = require("ajv");
const ajv = new Ajv();

const zapisekDao = require("../dao/zapisek.js");

// Validation schema
const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    details: { type: "string" },
    categoryName: { type: "string" }
  },
  required: ["name", "categoryName"],  // Ensure categoryName is required
  additionalProperties: false,
};

async function CreateAbl(req, res) {
  try {
    let zapisek = req.body;

    // Validate input data
    const valid = ajv.validate(schema, zapisek);
    if (!valid) {
      return res.status(400).json({
        code: "dtoInIsNotValid",
        zapisek: "dtoIn is not valid",
        validationError: ajv.errors,
      });
    }

    // Store zapisek to a persistent storage
    try {
      const createdZapisek = await zapisekDao.create(zapisek);  // Await the result from DAO
      res.status(201).json(createdZapisek);
    } catch (e) {
      res.status(400).json({
        code: "failedToCreateZapisek",
        message: "Failed to create zapisek",
        error: e.message,
      });
    }
  } catch (e) {
    res.status(500).json({
      code: "internalServerError",
      message: "Something went wrong",
      error: e.message,
    });
  }
}

module.exports = CreateAbl;
*/

const Ajv = require("ajv");
const ajv = new Ajv();
const zapisekDao = require("../dao/zapisek.js");

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    details: { type: "string" },
    categoryName: { type: "string" }
  },
  required: ["name", "details", "categoryName"],
  additionalProperties: false,
};

async function CreateAbl(req, res) {
  try {
    let zapisek = req.body;

    // Validate input
    const valid = ajv.validate(schema, zapisek);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        zapisek: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // Store zapisek in persistent storage
    try {
      const createdZapisek = await zapisekDao.create(zapisek);  // await here
      res.json(createdZapisek);  // Return created zapisek to client
    } catch (e) {
      res.status(500).json({
        code: "failedToCreateZapisek",
        message: "Failed to create zapisek",
        error: e.message || e,
      });
    }
    
  } catch (e) {
    console.error("Error during create process:", e);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = CreateAbl;
