const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { search } = require("../controller/category");

const uri = "mongodb+srv://marsefcu:020702@cluster0.t4fqsaw.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    // Add connection timeout settings
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
});

let isConnected = false;

async function testConnection() {
    let testClient = null;
    try {
        console.log("Starting MongoDB connection test...");
        
        // Create a new client for testing
        testClient = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            connectTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        });

        console.log("Attempting to connect...");
        await testClient.connect();
        console.log("Initial connection successful");
        
        // Test basic connection
        console.log("Testing ping...");
        await testClient.db("admin").command({ ping: 1 });
        console.log("Ping successful");
        
        // Test access to the actual database
        console.log("Testing database access...");
        const db = testClient.db("ZapisekList");
        
        // Test collections access
        console.log("Testing collections access...");
        const collections = await db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));
        
        // Test a simple query
        console.log("Testing document count...");
        const zapCount = await db.collection("ZapList").countDocuments();
        console.log("Number of documents in ZapList:", zapCount);
        
        return {
            success: true,
            collections: collections.map(c => c.name),
            documentCount: zapCount,
            message: "All connection tests passed successfully"
        };
    } catch (error) {
        console.error("MongoDB connection test failed:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
            codeName: error.codeName,
            stack: error.stack
        });
        
        return {
            success: false,
            error: {
                name: error.name,
                message: error.message,
                code: error.code,
                codeName: error.codeName
            },
            message: "Connection test failed"
        };
    } finally {
        if (testClient) {
            try {
                await testClient.close();
                console.log("Test connection closed successfully");
            } catch (closeError) {
                console.error("Error closing test connection:", closeError);
            }
        }
    }
}

// Export the test function
module.exports.testConnection = testConnection;

async function connectClient() {
    try {
        if (!isConnected) {
            console.log("Attempting to connect to MongoDB...");
            await client.connect();
            // Test the connection
            await client.db("admin").command({ ping: 1 });
            console.log("Successfully connected to MongoDB.");
            isConnected = true;
        } else {
            // Test if the connection is still alive
            try {
                await client.db("admin").command({ ping: 1 });
                console.log("MongoDB connection is alive.");
            } catch (pingError) {
                console.log("MongoDB connection lost, reconnecting...");
                isConnected = false;
                await client.close();
                await client.connect();
                await client.db("admin").command({ ping: 1 });
                console.log("Successfully reconnected to MongoDB.");
                isConnected = true;
            }
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        console.error("Connection error details:", error.stack);
        isConnected = false;
        // Try to close the connection if it exists
        try {
            await client.close();
        } catch (closeError) {
            console.error("Error closing MongoDB connection:", closeError);
        }
        throw new Error("Failed to connect to database: " + error.message);
    }
}

// Add connection error handler
client.on('error', async (error) => {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    try {
        await client.close();
    } catch (closeError) {
        console.error("Error closing MongoDB connection:", closeError);
    }
});

// Add connection close handler
client.on('close', () => {
    console.log("MongoDB connection closed");
    isConnected = false;
});

async function getCategoryByName(categoryName) {
    if (!categoryName || typeof categoryName !== "string") return null;
    await connectClient();
    try {
        const category = await client
            .db("CategoryList")
            .collection("CatList")
            .findOne({ name: categoryName });
        return category;
    } catch (e) {
        console.error("Error finding category by name:", e);
        return null;
    }
}

async function create(zapisek) {
    try {
        await connectClient();
        if (!zapisek.name || !zapisek.details || !zapisek.categoryName) {
            throw new Error("Missing required fields: name, details, or categoryName");
        }
        const category = await getCategoryByName(zapisek.categoryName);
        if (!category) {
            throw new Error(`Invalid categoryName: '${zapisek.categoryName}' does not exist`);
        }
        const newZapisek = {
            name: zapisek.name,
            details: zapisek.details,
            categoryId: category._id,
            categoryName: category.name,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const resultCreate = await client
            .db("ZapisekList")
            .collection("ZapList")
            .insertOne(newZapisek);
        console.log("Inserted zapisek with ID:", resultCreate.insertedId);
        return { ...newZapisek, _id: resultCreate.insertedId };
    } catch (err) {
        console.error("Error creating zapisek:", err);
        throw err;
    }
}

async function remove(zapisekId) {
    try {
        await connectClient();
        const objectId = new ObjectId(zapisekId);
        const resultDelete = await client
            .db("ZapisekList")
            .collection("ZapList")
            .deleteOne({ _id: objectId });
        console.log("Deleted count:", resultDelete.deletedCount);
        return resultDelete;
    } catch (error) {
        console.error("Error deleting zapisek:", error);
        throw { code: "failedToRemoveNote", zapisek: zapisekId, details: error };
    }
}

async function list() {
    try {
        await connectClient();
        const resultList = await client
            .db("ZapisekList")
            .collection("ZapList")
            .find()
            .toArray();
        return resultList;
    } catch (error) {
        console.error("Error listing zapisek:", error);
        throw { code: "failedToListNotes", zapisek: error };
    }
}

async function update(zapisek) {
    try {
        await connectClient();
        console.log("Updating zapisek with data:", JSON.stringify(zapisek, null, 2));

        // Basic validation
        if (!zapisek.id || !zapisek.categoryId) {
            throw {
                code: "missingIds",
                message: "Missing required IDs"
            };
        }

        // Ensure valid ObjectId format
        if (!ObjectId.isValid(zapisek.id) || !ObjectId.isValid(zapisek.categoryId)) {
            throw {
                code: "invalidObjectId",
                message: "Invalid ObjectId format"
            };
        }

        // First check if the zapisek exists
        const existingZapisek = await client
            .db("ZapisekList")
            .collection("ZapList")
            .findOne({ _id: new ObjectId(zapisek.id) });

        if (!existingZapisek) {
            throw {
                code: "zapisekNotFound",
                message: `No zapisek found with id ${zapisek.id}`
            };
        }

        try {
            // Convert string IDs to MongoDB ObjectIds
            const zapisekId = new ObjectId(zapisek.id);
            const categoryId = new ObjectId(zapisek.categoryId);

            // Prepare update data
            const updatedZapisekData = {
                name: zapisek.name,
                details: zapisek.details,
                categoryId: categoryId,
                categoryName: zapisek.categoryName,
                updatedAt: new Date()
            };

            console.log("Transformed update data:", JSON.stringify(updatedZapisekData, null, 2));
            
            // Try direct update first
            const updateResult = await client
                .db("ZapisekList")
                .collection("ZapList")
                .updateOne(
                    { _id: zapisekId },
                    { $set: updatedZapisekData }
                );
            
            console.log("Update result:", JSON.stringify(updateResult, null, 2));
            
            if (updateResult.matchedCount === 0) {
                throw {
                    code: "updateFailed",
                    message: "Failed to update zapisek - document not found",
                    details: { updateResult }
                };
            }

            if (updateResult.modifiedCount === 0) {
                throw {
                    code: "updateFailed",
                    message: "Failed to update zapisek - document not modified",
                    details: { updateResult }
                };
            }

            // Fetch the updated document
            const updatedDoc = await client
                .db("ZapisekList")
                .collection("ZapList")
                .findOne({ _id: zapisekId });

            if (!updatedDoc) {
                throw {
                    code: "updateFailed",
                    message: "Failed to fetch updated zapisek",
                    details: { updateResult }
                };
            }

            // Format response
            const response = {
                _id: updatedDoc._id.toString(),
                name: updatedDoc.name,
                details: updatedDoc.details,
                categoryId: updatedDoc.categoryId.toString(),
                categoryName: updatedDoc.categoryName,
                updatedAt: updatedDoc.updatedAt,
                createdAt: updatedDoc.createdAt
            };

            console.log("Returning updated zapisek:", JSON.stringify(response, null, 2));
            return response;

        } catch (dbError) {
            console.error("Database operation error:", dbError);
            throw {
                code: "databaseError",
                message: "Database operation failed",
                details: dbError.message,
                originalError: dbError
            };
        }
    } catch (error) {
        console.error("Error updating zapisek:", error);
        if (error.code) {
            throw error;
        }
        throw {
            code: "updateError",
            message: "Failed to update zapisek",
            details: error.message,
            originalError: error
        };
    }
}

async function take(zapisekId) {
    try {
        await connectClient();
        const objectId = new ObjectId(zapisekId);
        const zapisek = await client
            .db("ZapisekList")
            .collection("ZapList")
            .findOne({ _id: objectId });
        return zapisek;
    } catch (error) {
        console.error("Error getting zapisek:", error);
        throw { code: "failedToReadNote", zapisek: zapisekId, details: error };
    }
}

async function getByName(name) {
    try {
      await connectClient();
  
      if (!name || typeof name !== "string") {
        throw new Error("Invalid or missing 'name' parameter");
      }
  
      const zapisek = await client
        .db("ZapisekList")
        .collection("ZapList")
        .findOne({ name });
  
      return zapisek;
    } catch (error) {
      console.error("Error in getByName:", error);
      throw { code: "failedToFindZapisek", message: "Could not find zapisek by name", error };
    }
  }

  async function download(name) {
    try {
      await connectClient();
  
      if (!name || typeof name !== "string") {
        throw { code: "invalidName", message: "Name must be a non-empty string." };
      }
  
      const zapisek = await client
        .db("ZapisekList")
        .collection("ZapList")
        .findOne({ name });
  
      if (!zapisek) {
        throw { code: "zapisekNotFound", message: `No zapisek found with name '${name}'.` };
      }
  
      return zapisek;
    } catch (error) {
      console.error("Error in DAO download():", error);
      throw {
        code: "failedToDownloadZapisek",
        message: "Failed to retrieve zapisek for download.",
        error,
      };
    }
  }


module.exports = {
    create,
    remove,
    list,
    getCategoryByName,
    update,
    take,
    getByName,
    download
};