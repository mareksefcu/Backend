const Ajv = require("ajv");
const ajv = new Ajv();
const zapisekDao = require("./../dao/zapisek.js");


const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function DeleteAbl(req, res) {
  try {
    // Přejmenováno pro lepší srozumitelnost
    const zapisekIdBody = req.body; 
    // Extrahujeme id z těla požadavku
    const zapisekId = zapisekIdBody.id; 

    // validate input
    const valid = ajv.validate(schema, zapisekIdBody);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        category: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // remove transaction from persistant storage
    // Používáme await a předáváme pouze id
    const result = await zapisekDao.remove(zapisekId); 

    // return properly filled dtoOut
    // Doporučuji vracet výsledek operace smazání
    res.json(result); 
  } catch (e) {
    // Přidáno logování chyby
    console.error("Chyba při mazání kategorie:", e); 
    // Doporučuji vracet i samotnou chybu pro ladění
    res.status(500).json({ zapisek: e.zapisek, error: e }); 
  }
}

module.exports = DeleteAbl;