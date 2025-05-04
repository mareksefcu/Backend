async function ListAbl(req, res) {
    try {
      const zapisekList = await zapisekDao.list(); // Calls DAO correctly
      res.json({ itemList: zapisekList });
    } catch (e) {
      res.status(500).json({ zapisek: e.zapisek });
    }
  }
  
  const zapisekDao = require("./../dao/zapisek.js");

  async function ListAbl(req, res) {
    try {
      console.log("Incoming GET /zapisek/list request");
  
      const zapisekList = await zapisekDao.list();
  
      
      res.json({ itemList: zapisekList });
    } catch (e) {
      console.error("Error in ListAbl:", e);  // <--- Log full error
      res.status(500).json({ zapisek: e.zapisek, error: e });
    }
  }
  
  module.exports = ListAbl;
