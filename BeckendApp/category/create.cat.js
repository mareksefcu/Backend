const Ajv = require("ajv");
const ajv = new Ajv();

const categoryDao = require("../dao/category.js");

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
  required: ["name"],
  additionalProperties: false,
};

async function CreateAbl(req, res) {
  try {
    let category = req.body;

    // validate input
    const valid = ajv.validate(schema, category);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        category: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // store category to a persistant storage
    try {
      category = categoryDao.create(category);
    } catch (e) {
      res.status(400).json({
        ...e,
      });
      return;
    }

    // return properly filled dtoOut
    res.json(category);
  } catch (e) {
    res.status(500).json({ category: e.category });
  }
}

module.exports = CreateAbl;