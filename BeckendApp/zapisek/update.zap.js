const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const zapisekDao = require("./../dao/zapisek");
const categoryDao = require("./../dao/category");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 16, maxLength: 32 },
    date: { type: "string", format: "date" },
    name: { type: "string" },
    details: { type: "string" },
    categoryId: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function UpdateAbl(req, res) {
  try {
    let Zapisek = req.body;

    // validate input
    const valid = ajv.validate(schema, Zapisek);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // validate date
    if (new Date(Zapisek.date) >= new Date()) {
      res.status(400).json({
        code: "invalidDate",
        message: `date must be current day or a day in the past`,
        validationError: ajv.errors,
      });
      return;
    }

    // update Zapisek in database
    const updatedZapisek = zapisekDao.update(Zapisek);

    // check if categoryId exists
    const category = categoryDao.take(updatedZapisek.categoryId);
    if (!category) {
      res.status(400).json({
        code: "categoryDoesNotExist",
        message: `Category with id ${updatedZapisek.categoryId} does not exist`,
        validationError: ajv.errors,
      });
      return;
    }

    if (!updatedZapisek) {
      res.status(404).json({
        code: "ZapisekNotFound",
        message: `Zapisek ${Zapisek.id} not found`,
      });
      return;
    }

    // return properly filled dtoOut
    updatedZapisek.category = category;
    res.json(updatedZapisek);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = UpdateAbl;