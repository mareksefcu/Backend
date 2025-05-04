async function ListAbl(req, res) {
    try {
      const categoryList = await categoryDao.list(); // Calls DAO correctly
      res.json({ itemList: categoryList });
    } catch (e) {
      res.status(500).json({ category: e.category });
    }
  }
  
  const categoryDao = require("./../dao/category.js");

  async function ListAbl(req, res) {
    try {
      console.log("Incoming GET /category/list request");
  
      const categoryList = await categoryDao.list();
  
      console.log("Sending category list:", categoryList);
      res.json({ itemList: categoryList });
    } catch (e) {
      console.error("Error in ListAbl:", e);  // <--- Log full error
      res.status(500).json({ category: e.category, error: e });
    }
  }
  
  module.exports = ListAbl;
