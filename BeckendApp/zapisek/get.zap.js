
const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const zapisekDao = require("./../dao/zapisek.js");
const categoryDao = require("./../dao/category.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 16, maxLength: 32 },
  },
  required: ["id"],
  additionalProperties: false,
};

async function GetAbl(req, res) {
  try {
    // get request query or body
    const reqParams = req.query?.id ? req.query : req.body;

    // validate input
    const valid = ajv.validate(schema, reqParams);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // read zapisek by given id
    const zapisek = zapisekDao.take(reqParams.id);
    if (!zapisek) {
      res.status(404).json({
        code: "transactionNotFound",
        message: `zapisek ${reqParams.id} not found`,
      });
      return;
    }

    // get related category
    const category = categoryDao.take(zapisek.categoryId);
    zapisek.category = category;

    // return properly filled dtoOut
    res.json(zapisek);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = GetAbl;
