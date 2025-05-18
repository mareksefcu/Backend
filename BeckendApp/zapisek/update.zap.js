const { ObjectId } = require("mongodb");
const zapisekDao = require("./../dao/zapisek");
const categoryDao = require("./../dao/category");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", format: "objectId" },
    name: { type: "string", minLength: 1, maxLength: 100 },
    details: { type: "string", minLength: 1 },
    categoryName: { type: "string", minLength: 1 },
    categoryId: { type: "string", format: "objectId" }
  },
  required: ["id", "name", "details", "categoryName", "categoryId"],
  additionalProperties: false
};

async function UpdateAbl(req, res) {
  try {
    const zapisek = req.body;
    console.log("Received update request with data:", JSON.stringify(zapisek, null, 2));

    // Validate input data
    const valid = global.ajv.validate(schema, zapisek);
    if (!valid) {
      console.error("Validation errors:", JSON.stringify(global.ajv.errors, null, 2));
      return res.status(400).json({
        code: "validationError",
        message: "Invalid input data",
        errors: global.ajv.errors.map(error => ({
          field: error.instancePath.slice(1),
          message: error.message
        }))
      });
    }

    try {
      // Verify zapisek exists first
      console.log("Checking if zapisek exists with ID:", zapisek.id);
      const existingZapisek = await zapisekDao.take(zapisek.id);
      console.log("Existing zapisek:", existingZapisek);
      
      if (!existingZapisek) {
        console.log("Zapisek not found with ID:", zapisek.id);
        return res.status(404).json({
          code: "zapisekNotFound",
          message: `Zapisek ${zapisek.id} not found`,
          details: { id: zapisek.id }
        });
      }

      // Check if categoryId exists
      console.log("Checking if category exists with ID:", zapisek.categoryId);
      const category = await categoryDao.take(zapisek.categoryId);
      console.log("Found category:", category);
      
      if (!category) {
        console.log("Category not found with ID:", zapisek.categoryId);
        return res.status(400).json({
          code: "categoryDoesNotExist",
          message: `Category with id ${zapisek.categoryId} does not exist`,
          details: { categoryId: zapisek.categoryId }
        });
      }

      // Clean and prepare data for update
      const cleanedZapisek = {
        id: zapisek.id,
        name: zapisek.name.trim(),
        details: zapisek.details.trim(),
        categoryName: zapisek.categoryName.trim(),
        categoryId: category._id.toString()
      };
      
      console.log("Cleaned zapisek data:", cleanedZapisek);
      
      // Update Zapisek in database
      console.log("Attempting to update zapisek in database...");
      const updatedZapisek = await zapisekDao.update(cleanedZapisek);
      console.log("Update successful, result:", updatedZapisek);

      if (!updatedZapisek || !updatedZapisek._id) {
        throw {
          code: "updateFailed",
          message: "Failed to update zapisek - invalid response from database",
          details: { result: updatedZapisek }
        };
      }

      // Return properly filled dtoOut
      const response = {
        ...updatedZapisek,
        category
      };
      console.log("Sending response:", response);
      res.json(response);
    } catch (error) {
      console.error("Error during update operation:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", error.details || "No additional details");
      console.error("Original error:", error.originalError || "No original error");
      
      // Format the error response
      const errorResponse = {
        code: error.code || "updateFailed",
        message: error.message || "Failed to update zapisek",
        details: error.details || null,
        originalError: process.env.NODE_ENV === 'development' ? error.originalError : undefined
      };

      const statusCode = error.code === "invalidObjectId" ? 400 : 500;
      
      return res.status(statusCode).json(errorResponse);
    }
  } catch (e) {
    console.error("Unhandled error in update handler:", e);
    console.error("Error stack:", e.stack);
    
    const errorResponse = {
      code: "internalError",
      message: "Internal server error",
      details: e.details || null,
      originalError: process.env.NODE_ENV === 'development' ? e : undefined
    };
    
    res.status(500).json(errorResponse);
  }
}

module.exports = UpdateAbl;